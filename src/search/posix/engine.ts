import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { compareDocumentIds } from "../../document/id.ts";
import { splitLines } from "../../document/lines.ts";
import type { DocumentId } from "../../document/types.ts";
import { KbStoreError, toStoreError } from "../../store/errors.ts";
import { DocumentFiles } from "../../store/posix/files.ts";
import { anyPhrase } from "../../store/posix/query.ts";
import { readSettings } from "../../store/posix/settings.ts";
import { bindDocumentId, loadVectorExtensionPath, placeholders, toBlob } from "../../store/posix/sqlite.ts";
import { SearchEngine } from "../engine.ts";
import type { KeywordQuery, SearchHit, SemanticQuery } from "../types.ts";
import type { POSIXSearchOptions, RankedSectionRow } from "./types.ts";

/** Searches the persisted POSIX format without a store instance. */
export class POSIXSearchEngine extends SearchEngine {
  declare readonly semanticSearch?: (query: SemanticQuery) => Promise<SearchHit[]>;
  private closed = false;

  private constructor(
    private readonly db: DatabaseSync,
    private readonly files: DocumentFiles,
    private readonly kbFolder: string,
    private readonly maxLimit: number,
    semantic: POSIXSearchOptions["semantic"],
  ) {
    super();
    if (semantic) this.semanticSearch = query => this.searchVectors(query, semantic);
  }

  static async open({ root, maxLimit = 100, semantic }: POSIXSearchOptions): Promise<POSIXSearchEngine> {
    if (!Number.isSafeInteger(maxLimit) || maxLimit < 1) {
      throw new KbStoreError("INVALID_QUERY", "maxLimit must be a positive integer");
    }
    const folder = resolve(root);
    const kbFolder = join(folder, ".kb");
    let db: DatabaseSync | undefined;
    try {
      const extension = semantic ? await loadVectorExtensionPath() : undefined;
      db = new DatabaseSync(join(kbFolder, "index.sqlite"), { readOnly: true, allowExtension: Boolean(extension) });
      if (extension) {
        db.loadExtension(extension);
        db.enableLoadExtension(false);
      }
      // The reader never creates or migrates the schema.
      db.prepare("SELECT documentId FROM sections LIMIT 0");
      return new POSIXSearchEngine(db, new DocumentFiles(folder), kbFolder, maxLimit, semantic);
    } catch (cause) {
      db?.close();
      throw toStoreError(cause, `Cannot open the search engine in ${folder}`);
    }
  }

  async keywordSearch({ keywords, caseSensitive = false, documentIds, limit, fullSection = false }: KeywordQuery): Promise<SearchHit[]> {
    this.assertOpen();
    this.assertLimit(limit);
    const ftsQuery = anyPhrase(keywords);
    if (documentIds?.length === 0) return [];

    const filter = documentIds ? `AND s.documentId IN (${placeholders(documentIds)})` : "";
    const rows = this.db.prepare(`
      SELECT s.documentId, s.sectionId, s.title, s.shortDescription, s.summary, s.fromLine, s.toLine,
        bm25(sections_fts) AS rank
      FROM sections_fts JOIN sections s ON s.rowid = sections_fts.rowid
      WHERE sections_fts MATCH ? ${filter}
      ORDER BY rank, s.documentId, s.sectionId
      LIMIT ?
    `).all(ftsQuery, ...(documentIds ?? []).map(bindDocumentId), limit) as unknown as RankedSectionRow[];
    const normalize = (text: string) => caseSensitive ? text : text.toLowerCase();
    const needles = keywords.map(normalize);
    const hits: SearchHit[] = [];
    for (const [documentId, documentRows] of groupByDocument(rows)) {
      const lines = await this.readLines(documentId);
      for (const row of documentRows) {
        const matched: number[] = [];
        // FTS5 can match metadata or accent variants without a literal match in Markdown.
        for (let line = row.fromLine; line <= row.toLine; line++) {
          const content = normalize(lines[line - 1]);
          if (needles.some(needle => content.includes(needle))) matched.push(line);
        }
        if (caseSensitive && !matched.length) continue;
        hits.push({ ...toHit(row, -row.rank, lines, fullSection), lines: matched });
      }
    }
    return sortHits(hits);
  }

  private async searchVectors(
    { text, documentIds, limit, fullSection = false }: SemanticQuery,
    semantic: NonNullable<POSIXSearchOptions["semantic"]>,
  ): Promise<SearchHit[]> {
    this.assertOpen();
    this.assertLimit(limit);
    if (typeof text !== "string" || !text.trim()) {
      throw new KbStoreError("INVALID_QUERY", "Expected a non-empty text");
    }
    const { embedding } = await readSettings(this.kbFolder);
    this.assertOpen();
    if (embedding && embedding.modelId !== semantic.modelId) {
      throw new KbStoreError("INDEX_MISMATCH", `The index was built with model "${embedding.modelId}", not "${semantic.modelId}"`);
    }
    if (!embedding || documentIds?.length === 0 || !this.db.prepare(
      "SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'section_vectors'",
    ).get()) return [];

    let vector: Float32Array;
    try {
      vector = Float32Array.from(await semantic.embeddings.embedQuery(text));
    } catch (cause) {
      throw toStoreError(cause, "Cannot embed the query");
    }
    this.assertOpen();
    if (vector.length !== embedding.dimensions) {
      throw new KbStoreError("INDEX_MISMATCH", "Embedding dimensions differ from the index");
    }
    const filter = documentIds ? `AND documentId IN (
      SELECT d.rowid FROM documents d WHERE d.documentId IN (${placeholders(documentIds)})
    )` : "";
    const rows = this.db.prepare(`
      WITH nearest AS (
        SELECT documentId AS documentRowid, sectionId, distance FROM section_vectors
        WHERE embedding MATCH ? AND k = ? ${filter}
      )
      SELECT s.documentId, s.sectionId, s.title, s.shortDescription, s.summary, s.fromLine, s.toLine,
        nearest.distance AS rank
      FROM nearest JOIN documents d ON d.rowid = nearest.documentRowid
      JOIN sections s ON s.documentId = d.documentId AND s.sectionId = nearest.sectionId
      ORDER BY rank, s.documentId, s.sectionId
    `).all(toBlob(vector), limit, ...(documentIds ?? []).map(bindDocumentId)) as unknown as RankedSectionRow[];
    const hits: SearchHit[] = [];
    for (const [documentId, documentRows] of groupByDocument(rows)) {
      const lines = fullSection ? await this.readLines(documentId) : [];
      for (const row of documentRows) hits.push(toHit(row, 1 - row.rank, lines, fullSection));
    }
    return sortHits(hits);
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.db.close();
  }

  private async readLines(documentId: DocumentId): Promise<string[]> {
    this.assertOpen();
    const row = this.db.prepare("SELECT lineCount FROM documents WHERE documentId = ?").get(bindDocumentId(documentId));
    if (!row) throw new KbStoreError("NOT_FOUND", `Unknown document ${documentId}`);
    const markdown = await this.files.readMarkdown(documentId).catch(cause => {
      throw toStoreError(cause, `Cannot read document ${documentId}`);
    });
    const lines = splitLines(markdown);
    if (lines.length !== row.lineCount) {
      throw new KbStoreError("BACKEND", `Markdown of document ${documentId} differs from its line count`);
    }
    return lines;
  }

  private assertOpen(): void {
    if (this.closed) throw new KbStoreError("CLOSED", "The search engine is closed");
  }

  private assertLimit(limit: number): void {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > this.maxLimit) {
      throw new KbStoreError("INVALID_QUERY", `limit must be an integer between 1 and ${this.maxLimit}`);
    }
  }
}

function toHit(row: RankedSectionRow, score: number, lines: readonly string[], fullSection: boolean): SearchHit {
  return {
    documentId: row.documentId,
    sectionId: row.sectionId,
    title: row.title,
    shortDescription: row.shortDescription,
    summary: row.summary,
    score,
    ...(fullSection && { markdown: lines.slice(row.fromLine - 1, row.toLine).join("\n") }),
  };
}

/** Read each Markdown at most once per query. */
function groupByDocument(rows: readonly RankedSectionRow[]): Map<DocumentId, RankedSectionRow[]> {
  const groups = new Map<DocumentId, RankedSectionRow[]>();
  for (const row of rows) {
    const group = groups.get(row.documentId);
    if (group) group.push(row);
    else groups.set(row.documentId, [row]);
  }
  return groups;
}

function sortHits(hits: SearchHit[]): SearchHit[] {
  return hits.sort((a, b) => b.score! - a.score! || compareDocumentIds(a.documentId, b.documentId) || a.sectionId - b.sectionId);
}