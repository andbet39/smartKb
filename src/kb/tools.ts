import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";
import { searchContextSchema } from "./search.ts";
import type {
  AgentSearchResult,
  FileContent,
  FileInfo,
  FileSpec,
  FileSummary,
  FileTableOfContents,
  KbTableOfContents,
  SearchContextOptions,
  SearchQuery,
  SearchResult,
  SectionContent,
} from "./types.ts";

const agentQuestionSchema = z.object({ question: z.string().trim().min(1) });
const documentIdSchema = z.object({ documentId: z.int() });
const sectionTargetSchema = z.union([
  z.object({ sectionId: z.int() }),
  z.object({ fromLine: z.int(), toLine: z.int() }),
]);
const searchQuerySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keywords"), keywords: z.array(z.string()), caseSensitive: z.boolean().optional() }),
  z.object({ kind: z.literal("regex"), pattern: z.string(), caseSensitive: z.boolean().optional() }),
]);
const searchToolSchema = searchContextSchema.extend({
  query: searchQuerySchema,
  fileSpec: z.object({ documentIds: z.array(z.int()) }).optional(),
});

export interface AgentSearchTarget {
  kbAgentSearch(question: string): Promise<AgentSearchResult>;
}

export interface KbToolsTarget {
  kbGetTableOfContents(): Promise<KbTableOfContents>;
  kbFileGetTableOfContents(documentId: number): Promise<FileTableOfContents>;
  kbFileGetInfo(documentId: number): Promise<FileInfo>;
  kbFileReadSummary(documentId: number): Promise<FileSummary>;
  kbFileRead(documentId: number): Promise<FileContent>;
  kbFileReadSection(documentId: number, sectionId: number): Promise<SectionContent>;
  kbFileReadSection(documentId: number, fromLine: number, toLine: number): Promise<SectionContent>;
  kbFileSearchByKeywords(query: SearchQuery, fileSpec?: FileSpec, context?: SearchContextOptions): Promise<SearchResult>;
}

export function createAgentSearchTool(kb: AgentSearchTarget): StructuredToolInterface {
  return tool(({ question }) => kb.kbAgentSearch(question), {
    name: "kbAgentSearch",
    description: "Search the knowledge base and return a Markdown answer with references to cited search hits and explicitly read passages.",
    schema: agentQuestionSchema,
  });
}

export function createKbTools(kb: KbToolsTarget): StructuredToolInterface[] {
  return [
    tool(() => kb.kbGetTableOfContents(), {
      name: "kbGetTableOfContents",
      description: "List the documents in the knowledge base.",
      schema: z.object({}),
    }),
    createDocumentTool(kb, "kbFileGetTableOfContents", "List the sections of a document and their IDs."),
    createDocumentTool(kb, "kbFileGetInfo", "Read the metadata for a document."),
    createDocumentTool(kb, "kbFileReadSummary", "Read a document summary to guide your search."),
    createDocumentTool(kb, "kbFileRead", "Read the full text of a document and its source information."),
    tool(
      ({ documentId, section }) =>
        "sectionId" in section
          ? kb.kbFileReadSection(documentId, section.sectionId)
          : kb.kbFileReadSection(documentId, section.fromLine, section.toLine),
      {
        name: "kbFileReadSection",
        description: "Read a document section by ID or read an inclusive line range.",
        schema: documentIdSchema.extend({ section: sectionTargetSchema }),
      },
    ),
    tool(
      ({ query, fileSpec, beforeLines, afterLines }) =>
        kb.kbFileSearchByKeywords(query, fileSpec, { beforeLines, afterLines }),
      {
        name: "kbFileSearchByKeywords",
        description: "Search document text by keyword or regular expression. Optionally filter by document ID and request surrounding lines via beforeLines and afterLines (0 by default). If truncated, narrow the query or filter by document ID.",
        schema: searchToolSchema,
      },
    ),
  ];
}

function createDocumentTool(
  kb: KbToolsTarget,
  name: "kbFileGetTableOfContents" | "kbFileGetInfo" | "kbFileReadSummary" | "kbFileRead",
  description: string,
): StructuredToolInterface {
  return tool(({ documentId }) => kb[name](documentId), {
    name,
    description,
    schema: documentIdSchema,
  });
}
