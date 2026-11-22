import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { StructuredToolInterface } from "@langchain/core/tools";
import { splitLines } from "../document/lines.ts";
import { buildDocumentSource, buildPassageSource, buildSectionSource, buildTableOfContents, findSection } from "../document/sources.ts";
import type { DocumentId, DocumentTableOfContents, ParsedDocument, PassageSource } from "../document/types.ts";
import type { KBSearchEngine } from "../search/interfaces.ts";
import type { KbStore } from "../store/interfaces.ts";
import { runKbAgent } from "./agent.ts";
import type { AgentSearchTarget, DocumentReader, KbToolsTarget } from "./interfaces.ts";
import { searchByKeywords, searchByRegex, searchSemantic } from "./search.ts";
import { createAgentSearchTool, createKbTools } from "./tools.ts";
import type {
  AgentSearchResult,
  DocumentContent,
  DocumentInfo,
  DocumentSummary,
  KbOpenOptions,
  KbTableOfContents,
  SearchOptions,
  SearchQuery,
  SearchResult,
  SemanticSearchResult,
  TableOfContentsQuery,
} from "./types.ts";
import { LruCache, validateLineRange } from "./utils.ts";

const TOC_PAGE_SIZE = 100;
// The agent usually reads the same few documents several times while answering one question.
const CACHED_MAPS = 64;
const CACHED_TEXTS = 8;

/**
 * Exposes a document store and search engine to an LLM: the kb* methods, the tools, and an
 * agent (`kbAgentSearch`) that uses those tools to answer a question with citations.
 */
export class KbSmartManager implements KbToolsTarget, AgentSearchTarget, DocumentReader {
  private readonly maps = new LruCache<DocumentId, Omit<ParsedDocument, "markdown">>(CACHED_MAPS);
  private readonly texts = new LruCache<DocumentId, string[]>(CACHED_TEXTS);

  private constructor(
    private readonly store: KbStore,
    private readonly searchEngine: KBSearchEngine,
    private readonly searchLimit: number,
    private readonly llm?: Pick<BaseChatModel, "bindTools">,
  ) {}

  static async open(store: KbStore, searchEngine: KBSearchEngine, { llm, searchLimit = 100 }: KbOpenOptions = {}): Promise<KbSmartManager> {
    if (!Number.isSafeInteger(searchLimit) || searchLimit < 1) {
      throw new RangeError("searchLimit must be a positive integer");
    }
    return new KbSmartManager(store, searchEngine, searchLimit, llm);
  }

  get hasSemanticSearch(): boolean {
    return this.searchEngine.semanticSearch !== undefined;
  }

  async deleteDocument(documentId: DocumentId): Promise<void> {
    this.maps.delete(documentId);
    this.texts.delete(documentId);
    if (!(await this.store.delete(documentId))) {
      throw new Error(`Unknown document ${documentId}`);
    }
  }

  close(): Promise<void> {
    return this.store.close();
  }

  // ── Agent and tools ───────────────────────────────────────────────────────

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
    if (!this.llm) {
      throw new Error("La ricerca agentica richiede un modello: passa llm a KbSmartManager.open.");
    }
    return runKbAgent({ tools: this.getTools(), question, llm: this.llm });
  }

  // ── kb* methods ───────────────────────────────────────────────────────────

  async kbGetTableOfContents(query: TableOfContentsQuery = {}): Promise<KbTableOfContents> {
    const { cards, nextCursor } = await this.store.list({
      ...query,
      limit: Math.min(TOC_PAGE_SIZE, this.store.maxLimit),
    });
    return nextCursor === undefined ? { documents: cards } : { documents: cards, nextCursor };
  }

  async kbDocumentGetTableOfContents(documentId: DocumentId): Promise<DocumentTableOfContents> {
    return buildTableOfContents(await this.getDocument(documentId));
  }

  async kbDocumentGetInfo(documentId: DocumentId): Promise<DocumentInfo> {
    const { map } = await this.getDocument(documentId);
    return {
      ...buildDocumentSource({ map }),
      ...(map.author !== undefined && { author: map.author }),
      ...(map.fileType !== undefined && { fileType: map.fileType }),
      ...(map.tags !== undefined && { tags: [...map.tags] }),
      shortDescription: map.shortDescription,
      keywords: [...map.keywords],
      lineCount: map.lineCount,
      sectionCount: map.sections.length,
    };
  }

  async kbDocumentReadSummary(documentId: DocumentId): Promise<DocumentSummary> {
    const doc = await this.getDocument(documentId);
    return { source: buildDocumentSource(doc), kind: "summary", summary: doc.map.summary };
  }

  async kbDocumentRead(documentId: DocumentId): Promise<DocumentContent> {
    const doc = await this.getDocument(documentId);
    const lines = await this.readLines(documentId);
    if (!lines.length) {
      return { markdown: "", source: buildDocumentSource(doc) };
    }
    return { markdown: lines.join("\n"), source: buildPassageSource(doc, 1, lines.length) };
  }

  async kbDocumentReadSection(documentId: DocumentId, sectionId: number): Promise<DocumentContent>;
  async kbDocumentReadSection(documentId: DocumentId, fromLine: number, toLine: number): Promise<DocumentContent>;
  async kbDocumentReadSection(documentId: DocumentId, sectionOrLine: number, toLine?: number): Promise<DocumentContent> {
    const doc = await this.getDocument(documentId);
    let source: PassageSource;
    if (toLine === undefined) {
      source = buildSectionSource(doc, findSection(doc, sectionOrLine));
    } else {
      validateLineRange(documentId, sectionOrLine, toLine, doc.map.lineCount);
      source = buildPassageSource(doc, sectionOrLine, toLine);
    }
    const lines = await this.readLines(documentId);
    return { markdown: lines.slice(source.fromLine - 1, source.toLine).join("\n"), source };
  }

  kbDocumentSearchByKeywords(query: SearchQuery, documentIds?: DocumentId[], options: SearchOptions = {}): Promise<SearchResult> {
    return query?.kind === "regex"
      ? searchByRegex(this, query, documentIds, options)
      : searchByKeywords(this.searchEngine, this.searchLimit, this, query, documentIds, options);
  }

  kbDocumentSearchSemantic(
    text: string,
    documentIds?: DocumentId[],
    options: Pick<SearchOptions, "fullSection"> = {},
  ): Promise<SemanticSearchResult> {
    return searchSemantic(this.searchEngine, this.searchLimit, this, text, documentIds, options);
  }

  // ── Cached document access ────────────────────────────────────────────────
  // Entries are dropped by deleteDocument. A document deleted and re-added directly through
  // the store, bypassing the manager, can be served stale until it leaves the cache.

  async getDocument(documentId: DocumentId): Promise<Omit<ParsedDocument, "markdown">> {
    let doc = this.maps.get(documentId);
    if (!doc) {
      doc = await this.store.get(documentId);
      this.maps.set(documentId, doc);
    }
    return doc;
  }

  async readLines(documentId: DocumentId): Promise<string[]> {
    let lines = this.texts.get(documentId);
    if (!lines) {
      lines = splitLines(await this.store.read(documentId));
      this.texts.set(documentId, lines);
    }
    return lines;
  }
}
