import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";
import { documentIdSchema } from "../document/id.ts";
import type { AgentSearchTarget, KbToolsTarget } from "./interfaces.ts";
import { documentIdsSchema, searchOptionsSchema } from "./search.ts";

const agentQuestionSchema = z.object({ question: z.string().trim().min(1) });
const documentTargetSchema = z.object({ documentId: documentIdSchema });
const tocQuerySchema = z.object({
  text: z.string().optional(),
  tags: z.array(z.string()).optional(),
  cursor: z.string().optional(),
});
const sectionTargetSchema = z.union([
  z.object({ sectionId: z.int() }),
  z.object({ fromLine: z.int(), toLine: z.int() }),
]);
const searchQuerySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("keywords"), keywords: z.array(z.string()), caseSensitive: z.boolean().optional() }),
  z.object({ kind: z.literal("regex"), pattern: z.string(), caseSensitive: z.boolean().optional() }),
]);
const searchToolSchema = searchOptionsSchema.extend({
  query: searchQuerySchema,
  documentIds: documentIdsSchema,
});
const semanticToolSchema = searchOptionsSchema.pick({ fullSection: true }).extend({
  text: z.string(),
  documentIds: documentIdsSchema,
});

export const TOOL_SOURCE_KIND: Readonly<Partial<Record<string, "read" | "candidate">>> = {
  kbDocumentRead: "read",
  kbDocumentReadSection: "read",
  kbDocumentSearchByKeywords: "candidate",
  kbDocumentSearchSemantic: "candidate",
};

export function createAgentSearchTool(kb: AgentSearchTarget): StructuredToolInterface {
  return tool(({ question }) => kb.kbAgentSearch(question), {
    name: "kbAgentSearch",
    description: "Search the knowledge base and return a Markdown answer with references to cited search hits and explicitly read passages.",
    schema: agentQuestionSchema,
  });
}

export function createKbTools(kb: KbToolsTarget): StructuredToolInterface[] {
  const tools: StructuredToolInterface[] = [
    tool(query => kb.kbGetTableOfContents(query), {
      name: "kbGetTableOfContents",
      description: "List documents in the knowledge base. Filter by text or tags, or use the previous page's nextCursor to continue.",
      schema: tocQuerySchema,
    }),
    createDocumentTool(kb, "kbDocumentGetTableOfContents", "List the sections of a document and their IDs."),
    createDocumentTool(kb, "kbDocumentGetInfo", "Read the metadata for a document."),
    createDocumentTool(kb, "kbDocumentReadSummary", "Read a document summary to guide your search."),
    createDocumentTool(kb, "kbDocumentRead", "Read the full text of a document and its source information."),
    tool(
      ({ documentId, section }) =>
        "sectionId" in section
          ? kb.kbDocumentReadSection(documentId, section.sectionId)
          : kb.kbDocumentReadSection(documentId, section.fromLine, section.toLine),
      {
        name: "kbDocumentReadSection",
        description: "Read a document section by ID or read an inclusive line range.",
        schema: documentTargetSchema.extend({ section: sectionTargetSchema }),
      },
    ),
    tool(
      ({ query, documentIds, ...options }) => kb.kbDocumentSearchByKeywords(query, documentIds, options),
      {
        name: "kbDocumentSearchByKeywords",
        description: "Search document text by keyword or regular expression. Regular expressions require documentIds. Use beforeLines and afterLines for context. If truncated, narrow the query or filter by document ID.",
        schema: searchToolSchema,
      },
    ),
  ];
  if (kb.hasSemanticSearch) {
    tools.push(tool(
      ({ text, documentIds, fullSection }) => kb.kbDocumentSearchSemantic(text, documentIds, { fullSection }),
      {
        name: "kbDocumentSearchSemantic",
        description: "Search for relevant sections by meaning, optionally limited to documentIds.",
        schema: semanticToolSchema,
      },
    ));
  }
  return tools;
}

function createDocumentTool(
  kb: KbToolsTarget,
  name: "kbDocumentGetTableOfContents" | "kbDocumentGetInfo" | "kbDocumentReadSummary" | "kbDocumentRead",
  description: string,
): StructuredToolInterface {
  return tool(({ documentId }) => kb[name](documentId), {
    name,
    description,
    schema: documentTargetSchema,
  });
}
