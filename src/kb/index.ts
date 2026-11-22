import { unlink } from "node:fs/promises";
import { resolve } from "node:path";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { findMarkdownFile } from "../parser/persistence.ts";
import { runKbAgent } from "./agent.ts";
import { executeKeywordSearch, parseSearchRequest } from "./search.ts";
import { createDocumentSelector, type DocumentSelector } from "./selection.ts";
import { createAgentSearchTool, createKbTools } from "./tools.ts";
import type {
  AgentSearchOptions,
  AgentSearchResult,
  DocumentSelectionOptions,
  FileContent,
  FileInfo,
  FileSpec,
  FileSummary,
  FileTableOfContents,
  KbOpenOptions,
  KbTableOfContents,
  PassageSource,
  SearchContextOptions,
  SearchQuery,
  SearchResult,
  SectionContent,
} from "./types.ts";
import { KbUtils, type KbDocumentEntry } from "./utils.ts";

export type * from "./types.ts";

type TocMode = NonNullable<AgentSearchOptions["tocMode"]>;

export class KbSmartManager {
  private constructor(
    private readonly roots: readonly string[],
    private documents: Map<number, KbDocumentEntry>,
    private readonly llm?: Pick<BaseChatModel, "bindTools">,
    private readonly selectDocuments?: DocumentSelector,
    private readonly tocMode: TocMode = "prompt",
  ) {}

  static open(baseFolder: string | readonly string[], options?: KbOpenOptions): Promise<KbSmartManager>;
  static open(
    baseFolder: string | readonly string[],
    llm?: Pick<BaseChatModel, "bindTools">,
    selection?: DocumentSelectionOptions,
    options?: AgentSearchOptions,
  ): Promise<KbSmartManager>;
  static async open(
    baseFolder: string | readonly string[],
    modelOrOptions?: Pick<BaseChatModel, "bindTools"> | KbOpenOptions,
    legacySelection?: DocumentSelectionOptions,
    legacyOptions?: AgentSearchOptions,
  ): Promise<KbSmartManager> {
    const { llm, selection, tocMode } = modelOrOptions && !("bindTools" in modelOrOptions)
      ? modelOrOptions as KbOpenOptions
      : { llm: modelOrOptions, selection: legacySelection, tocMode: legacyOptions?.tocMode };
    const selectDocuments = selection && createDocumentSelector(selection);
    const roots = (typeof baseFolder === "string" ? [baseFolder] : baseFolder).map(folder => resolve(folder));
    const documents = await KbUtils.loadCatalog(roots);
    return new KbSmartManager(roots, documents, llm, selectDocuments, tocMode);
  }

  async refresh(): Promise<void> {
    this.documents = await KbUtils.loadCatalog(this.roots);
  }

  async deleteDocument(documentId: number): Promise<void> {
    const { folder, manifestPath, map } = this.getEntry(documentId);
    const markdown = await findMarkdownFile(folder, map.originalFileName);
    if (markdown) {
      const shared = await KbUtils.isMarkdownShared(this.documents.values(), documentId, folder, markdown);
      if (!shared) {
        await unlink(markdown.path);
      }
    }
    await unlink(manifestPath);
    this.documents.delete(documentId);
  }

  getAgentSearchTool(): StructuredToolInterface {
    return createAgentSearchTool(this);
  }

  getTools(): StructuredToolInterface[] {
    return createKbTools(this);
  }

  async kbAgentSearch(question: string): Promise<AgentSearchResult> {
    if (!question.trim()) {
      throw new Error("La domanda non può essere vuota.");
    }

    const baseInput = { tools: this.getTools(), question, llm: this.llm };
    if (!this.selectDocuments && this.tocMode === "tools") {
      return runKbAgent(baseInput);
    }

    const entries = await this.resolveAgentTocEntries(question);
    const toc = KbUtils.buildAgentToc(entries);
    return runKbAgent({ ...baseInput, toc, hasSelection: Boolean(this.selectDocuments) });
  }

  async kbGetTableOfContents(): Promise<KbTableOfContents> {
    const documents = Array.from(this.documents.values(), entry => ({
      source: KbUtils.buildDocumentSource(entry),
      shortDescription: entry.map.short_description,
      sectionCount: entry.map.sections.length,
    }));
    return { documents };
  }

  async kbFileGetTableOfContents(documentId: number): Promise<FileTableOfContents> {
    const entry = this.getEntry(documentId);
    const sections = entry.map.sections.map(section => ({
      source: KbUtils.buildSectionSource(entry, section),
      shortDescription: section.short_description,
    }));
    return { source: KbUtils.buildDocumentSource(entry), sections };
  }

  async kbFileGetInfo(documentId: number): Promise<FileInfo> {
    const entry = this.getEntry(documentId);
    const { author, fileType, tags, keywords, short_description, lineCount, sections } = entry.map;
    return {
      source: KbUtils.buildDocumentSource(entry),
      author,
      fileType,
      tags: tags?.slice(),
      keywords: [...keywords],
      shortDescription: short_description,
      lineCount,
      sectionCount: sections.length,
    };
  }

  async kbFileReadSummary(documentId: number): Promise<FileSummary> {
    const entry = this.getEntry(documentId);
    return {
      source: KbUtils.buildDocumentSource(entry),
      kind: "summary",
      summary: entry.map.summary,
    };
  }

  async kbFileRead(documentId: number): Promise<FileContent> {
    const entry = this.getEntry(documentId);
    const { markdown, lines } = await KbUtils.readDocumentText(entry);
    if (!lines.length) {
      return { markdown: "", source: KbUtils.buildDocumentSource(entry) };
    }
    return { markdown, source: KbUtils.buildPassageSource(entry, [1, lines.length]) };
  }

  async kbFileReadSection(documentId: number, sectionId: number): Promise<SectionContent>;
  async kbFileReadSection(documentId: number, fromLine: number, toLine: number): Promise<SectionContent>;
  async kbFileReadSection(documentId: number, startOrId: number, end?: number): Promise<SectionContent> {
    const entry = this.getEntry(documentId);
    const source = this.resolvePassageSource(entry, documentId, startOrId, end);
    const { lines } = await KbUtils.readDocumentText(entry);
    return {
      markdown: lines.slice(source.fromLine - 1, source.toLine).join("\n"),
      source,
    };
  }

  async kbFileSearchByKeywords(
    query: SearchQuery,
    fileSpec?: FileSpec,
    context?: SearchContextOptions,
  ): Promise<SearchResult> {
    const request = parseSearchRequest(query, context);
    const entries = this.resolveSearchEntries(fileSpec);
    return executeKeywordSearch(entries, request);
  }

  private getEntry(id: number): KbDocumentEntry {
    const entry = this.documents.get(id);
    if (!entry) {
      throw new Error(`Unknown document ${id}`);
    }
    return entry;
  }

  private resolvePassageSource(
    entry: KbDocumentEntry,
    documentId: number,
    startOrId: number,
    end?: number,
  ): PassageSource {
    if (end === undefined) {
      const section = entry.map.sections.find(item => item.id === startOrId);
      if (!section) {
        throw new Error(`Unknown section ${startOrId} in document ${documentId}`);
      }
      return KbUtils.buildSectionSource(entry, section);
    }
    KbUtils.validateLineRange(documentId, startOrId, end, entry.map.lineCount);
    return KbUtils.buildPassageSource(entry, [startOrId, end]);
  }

  private resolveSearchEntries(fileSpec?: FileSpec): Iterable<KbDocumentEntry> {
    if (fileSpec === undefined) {
      return this.documents.values();
    }
    if (!Array.isArray(fileSpec.documentIds)) {
      throw new Error("Expected fileSpec.documentIds to be an array");
    }
    return Array.from(new Set(fileSpec.documentIds), id => this.getEntry(id));
  }

  private async resolveAgentTocEntries(question: string): Promise<Iterable<KbDocumentEntry>> {
    if (!this.selectDocuments) {
      return this.documents.values();
    }
    const cards = KbUtils.buildSelectionCards(this.documents.values());
    const selectedIds = await this.selectDocuments(question, cards);
    return selectedIds.flatMap(id => {
      const entry = this.documents.get(id);
      return entry ? [entry] : [];
    });
  }
}
