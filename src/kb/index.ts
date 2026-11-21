import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tool, type StructuredToolInterface } from "@langchain/core/tools";
import { z } from "zod";
import { loadMarkdown, loadMetadataFiles } from "../parser/persistence.js";
import type { DocumentLineRange, DocumentSection, ParsedDocument } from "../parser/types.js";
import type {
  DocumentSource, FileContent, FileInfo, FileSpec, FileSummary, FileTableOfContents,
  KbTableOfContents, PassageSource, SearchQuery, SearchResult, SectionContent, SectionSource,
} from "./types.js";

export type * from "./types.js";

interface Entry extends Omit<ParsedDocument, "markdown"> {
  folder: string;
}

async function* documentFolders(folder: string): AsyncGenerator<string> {
  const children = await readdir(folder, { withFileTypes: true });
  if (children.some(child => child.isFile() && child.name.endsWith(".json"))) yield folder;
  for (const child of children) {
    if (child.isDirectory()) yield* documentFolders(join(folder, child.name));
  }
}

function documentSource({ map }: Entry): DocumentSource {
  return {
    documentId: map.documentId,
    originalFileName: map.originalFileName ?? null,
    ...(map.title !== undefined && { title: map.title }),
  };
}

function passageSource(entry: Entry, range: DocumentLineRange, section?: DocumentSection): PassageSource {
  const [fromLine, toLine] = range;
  const containing = section ?? entry.map.sections.find(s => s.range[0] <= fromLine && toLine <= s.range[1]);
  // A section's pageRange can include blank pages: cite only actual overlapping lines.
  const pages = entry.pages?.flatMap(page => {
    if (!page.range) return [];
    const start = Math.max(fromLine, page.range[0]);
    const end = Math.min(toLine, page.range[1]);
    return start <= end ? [{ pageNumber: page.page, fromLine: start, toLine: end }] : [];
  }) ?? null;
  return {
    ...documentSource(entry), fromLine, toLine, pages,
    ...(containing && { sectionId: containing.id, sectionTitle: containing.title }),
  };
}

function sectionSource(entry: Entry, section: DocumentSection): SectionSource {
  return { ...passageSource(entry, section.range, section), sectionId: section.id, sectionTitle: section.title };
}

async function readText(entry: Entry) {
  const markdown = await loadMarkdown(entry.folder, entry.map.originalFileName);
  const lines = markdown ? markdown.split("\n") : [];
  if (lines.length !== entry.map.lineCount) {
    throw new Error(`Markdown line count differs from metadata in ${entry.folder}`);
  }
  return { markdown, lines };
}

function lineMatcher(query: SearchQuery): (line: string) => boolean {
  if (query.kind === "regex") {
    if (typeof query.pattern !== "string") throw new Error("Expected a regular expression string");
    const expression = new RegExp(query.pattern, query.caseSensitive ? "u" : "iu");
    return line => expression.test(line);
  }
  if (query.kind !== "keywords" || !Array.isArray(query.keywords) ||
      !query.keywords.length || query.keywords.some(word => typeof word !== "string" || !word.length)) {
    throw new Error("Expected at least one non-empty search keyword");
  }
  const normalize = (text: string) => query.caseSensitive ? text : text.toLowerCase();
  const keywords = query.keywords.map(normalize);
  return line => {
    const text = normalize(line);
    return keywords.some(word => text.includes(word));
  };
}

export class KbSmartManager {
  private constructor(private readonly documents: Map<number, Entry>) {}

  static async open(baseFolder: string): Promise<KbSmartManager> {
    const documents = new Map<number, Entry>();
    for await (const folder of documentFolders(resolve(baseFolder))) {
      for (const data of await loadMetadataFiles(folder)) {
        const id = data.map.documentId;
        const previous = documents.get(id);
        if (previous) throw new Error(`Duplicate document ${id}: ${previous.folder} and ${folder}`);
        documents.set(id, { ...data, folder });
      }
    }
    return new KbSmartManager(documents);
  }

  private document(id: number): Entry {
    const entry = this.documents.get(id);
    if (!entry) throw new Error(`Unknown document ${id}`);
    return entry;
  }

  getTools(): StructuredToolInterface[] {
    const document = z.object({ documentId: z.int() });
    const fileTool = (name: "kbFileGetTableOfContents" | "kbFileGetInfo" | "kbFileReadSummary" | "kbFileRead", description: string) =>
      tool(({ documentId }) => this[name](documentId), { name, description, schema: document });
    const section = z.union([z.object({ sectionId: z.int() }), z.object({ fromLine: z.int(), toLine: z.int() })]);
    const query = z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("keywords"), keywords: z.array(z.string()), caseSensitive: z.boolean().optional() }),
      z.object({ kind: z.literal("regex"), pattern: z.string(), caseSensitive: z.boolean().optional() }),
    ]);
    return [
      tool(() => this.kbGetTableOfContents(), { name: "kbGetTableOfContents", description: "Elenca i documenti della KB.", schema: z.object({}) }),
      fileTool("kbFileGetTableOfContents", "Elenca le sezioni del documento e i loro ID."),
      fileTool("kbFileGetInfo", "Leggi i metadati del documento."),
      fileTool("kbFileReadSummary", "Leggi la sintesi per orientare la ricerca."),
      fileTool("kbFileRead", "Leggi il testo integrale e la fonte."),
      tool(({ documentId, section }) => "sectionId" in section
        ? this.kbFileReadSection(documentId, section.sectionId)
        : this.kbFileReadSection(documentId, section.fromLine, section.toLine), {
        name: "kbFileReadSection", description: "Leggi una sezione per ID o un intervallo di righe inclusivo.",
        schema: document.extend({ section }),
      }),
      tool(({ query, fileSpec }) => this.kbFileSearchByKeywords(query, fileSpec), {
        name: "kbFileSearchByKeywords", description: "Cerca parole o una regex nel testo, anche limitando i documenti.",
        schema: z.object({ query, fileSpec: z.object({ documentIds: z.array(z.int()) }).optional() }),
      }),
    ];
  }

  async kbGetTableOfContents(): Promise<KbTableOfContents> {
    const documents = Array.from(this.documents.values(), entry => ({
      source: documentSource(entry),
      shortDescription: entry.map.short_description,
      sectionCount: entry.map.sections.length,
    }));
    return { documents };
  }

  async kbFileGetTableOfContents(documentId: number): Promise<FileTableOfContents> {
    const entry = this.document(documentId);
    const sections = entry.map.sections.map(section => ({
      source: sectionSource(entry, section),
      shortDescription: section.short_description,
    }));
    return { source: documentSource(entry), sections };
  }

  async kbFileGetInfo(documentId: number): Promise<FileInfo> {
    const entry = this.document(documentId);
    const { author, fileType, tags, keywords, short_description, lineCount, sections } = entry.map;
    return {
      source: documentSource(entry), author, fileType, tags: tags?.slice(),
      keywords: [...keywords], shortDescription: short_description, lineCount, sectionCount: sections.length,
    };
  }

  async kbFileReadSummary(documentId: number): Promise<FileSummary> {
    const entry = this.document(documentId);
    return { source: documentSource(entry), kind: "summary", summary: entry.map.summary };
  }

  async kbFileRead(documentId: number): Promise<FileContent> {
    const entry = this.document(documentId);
    const { markdown, lines } = await readText(entry);
    if (!lines.length) return { markdown: "", source: documentSource(entry) };
    return { markdown, source: passageSource(entry, [1, lines.length]) };
  }

  async kbFileReadSection(documentId: number, sectionId: number): Promise<SectionContent>;
  async kbFileReadSection(documentId: number, fromLine: number, toLine: number): Promise<SectionContent>;
  async kbFileReadSection(documentId: number, startOrId: number, end?: number): Promise<SectionContent> {
    const entry = this.document(documentId);
    let source: PassageSource;
    if (end === undefined) {
      const section = entry.map.sections.find(s => s.id === startOrId);
      if (!section) throw new Error(`Unknown section ${startOrId} in document ${documentId}`);
      source = sectionSource(entry, section);
    } else {
      if (!Number.isSafeInteger(startOrId) || !Number.isSafeInteger(end) ||
          startOrId < 1 || end < startOrId || end > entry.map.lineCount) {
        throw new RangeError(`Invalid line range ${startOrId}-${end} in document ${documentId}`);
      }
      source = passageSource(entry, [startOrId, end]);
    }
    const { lines } = await readText(entry);
    return { markdown: lines.slice(source.fromLine - 1, source.toLine).join("\n"), source };
  }

  async kbFileSearchByKeywords(query: SearchQuery, fileSpec?: FileSpec): Promise<SearchResult> {
    const matchesLine = lineMatcher(query);
    if (fileSpec !== undefined && !Array.isArray(fileSpec.documentIds)) {
      throw new Error("Expected fileSpec.documentIds to be an array");
    }
    const entries = fileSpec === undefined
      ? this.documents.values()
      : Array.from(new Set(fileSpec.documentIds), id => this.document(id));
    const result: SearchResult = { matches: [] };
    for (const entry of entries) {
      const { lines } = await readText(entry);
      for (const [index, snippet] of lines.entries()) {
        if (matchesLine(snippet)) {
          const line = index + 1;
          result.matches.push({ snippet, source: passageSource(entry, [line, line]) });
        }
      }
    }
    return result;
  }
}
