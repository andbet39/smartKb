import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import type { DocumentId, DocumentSection, ParsedDocument } from "../../document/types.ts";
import type { DocumentCard } from "../types.ts";
import { bindDocumentId, placeholders, toBlob } from "./sqlite.ts";
import type { CatalogFilter } from "./types.ts";

// The SQLite index in `.kb/index.sqlite`: catalog, sections, full-text and vector tables.
// It is derived data: the canonical copy of each document is in its `doc-<id>/` folder.
// Column names match the TypeScript fields, so rows map to objects without renaming.

const TOKENIZER = `tokenize="unicode61 remove_diacritics 2"`;

// BLOB affinity leaves numeric IDs as INTEGER and UUIDs as TEXT, with no coercion.
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS documents (
    rowid INTEGER PRIMARY KEY,
    documentId BLOB NOT NULL UNIQUE,
    originalFileName TEXT,
    title TEXT,
    shortDescription TEXT NOT NULL,
    keywordsJson TEXT NOT NULL,
    tagsJson TEXT,
    sectionCount INTEGER NOT NULL,
    lineCount INTEGER NOT NULL,
    mapJson TEXT NOT NULL,
    pagesJson TEXT
  );
  CREATE TABLE IF NOT EXISTS document_tags (
    tag TEXT NOT NULL,
    documentId BLOB NOT NULL,
    PRIMARY KEY (tag, documentId)
  );
  CREATE TABLE IF NOT EXISTS sections (
    rowid INTEGER PRIMARY KEY,
    documentId BLOB NOT NULL,
    sectionId INTEGER NOT NULL,
    title TEXT NOT NULL,
    shortDescription TEXT NOT NULL,
    summary TEXT NOT NULL,
    fromLine INTEGER NOT NULL,
    toLine INTEGER NOT NULL,
    UNIQUE (documentId, sectionId)
  );
  CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title, originalFileName, shortDescription, keywords,
    content='', contentless_delete=1, ${TOKENIZER}
  );
  CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    title, shortDescription, summary, keywords, body,
    content='', contentless_delete=1, ${TOKENIZER}
  );
`;

interface DocumentRow {
  documentId: DocumentId;
  originalFileName: string | null;
  title: string | null;
  shortDescription: string;
  keywordsJson: string;
  tagsJson: string | null;
  sectionCount: number;
}

export class IndexDatabase {
  private readonly db: DatabaseSync;
  private vectorDimensions?: number;

  constructor(path: string, vectorExtensionPath?: string) {
    this.db = new DatabaseSync(path, { allowExtension: Boolean(vectorExtensionPath) });
    try {
      this.db.exec("PRAGMA journal_mode = WAL");
      if (vectorExtensionPath) this.db.loadExtension(vectorExtensionPath);
      this.initializeSchema();
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  /** Creates the vector table on first use. Requires the sqlite-vec extension. */
  enableVectors(dimensions: number): void {
    // The legacy name `documentId` now denotes documents.rowid, not its public ID.
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS section_vectors USING vec0(
        documentId INTEGER PARTITION KEY,
        sectionId INTEGER,
        embedding FLOAT[${dimensions}] distance_metric=cosine
      )
    `);
    this.vectorDimensions = dimensions;
  }

  get hasVectors(): boolean {
    return this.vectorDimensions !== undefined;
  }

  close(): void {
    this.db.close();
  }

  // ── Documents ─────────────────────────────────────────────────────────────

  hasDocument(documentId: DocumentId): boolean {
    return this.db.prepare("SELECT 1 FROM documents WHERE documentId = ?").get(bindDocumentId(documentId)) !== undefined;
  }

  getDocument(documentId: DocumentId): Omit<ParsedDocument, "markdown"> | undefined {
    const row = this.db.prepare("SELECT mapJson, pagesJson FROM documents WHERE documentId = ?").get(bindDocumentId(documentId)) as
      | { mapJson: string; pagesJson: string | null }
      | undefined;
    if (!row) return undefined;
    return { map: JSON.parse(row.mapJson), ...(row.pagesJson !== null && { pages: JSON.parse(row.pagesJson) }) };
  }

  getLineCount(documentId: DocumentId): number | undefined {
    const row = this.db.prepare("SELECT lineCount FROM documents WHERE documentId = ?").get(bindDocumentId(documentId)) as
      | { lineCount: number }
      | undefined;
    return row?.lineCount;
  }

  /**
   * Inserts the document, its sections, the full-text rows and the vectors in one transaction:
   * the commit is the moment the document becomes visible.
   */
  insertDocument(doc: ParsedDocument, vectors?: Float32Array[]): void {
    const { map } = doc;
    const documentId = bindDocumentId(map.documentId);
    const lines = doc.markdown ? doc.markdown.split("\n") : [];
    this.transaction(() => {
      const { lastInsertRowid: documentRowid } = this.prepareWrite(`
        INSERT INTO documents (documentId, originalFileName, title, shortDescription, keywordsJson, tagsJson,
          sectionCount, lineCount, mapJson, pagesJson)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        documentId, map.originalFileName ?? null, map.title ?? null, map.shortDescription,
        JSON.stringify(map.keywords), map.tags ? JSON.stringify(map.tags) : null,
        map.sections.length, map.lineCount, JSON.stringify(map), doc.pages ? JSON.stringify(doc.pages) : null,
      );
      this.prepareWrite(`
        INSERT INTO documents_fts (rowid, title, originalFileName, shortDescription, keywords) VALUES (?, ?, ?, ?, ?)
      `).run(documentRowid, map.title ?? "", map.originalFileName ?? "", map.shortDescription, map.keywords.join(" "));

      const insertTag = this.prepareWrite("INSERT OR IGNORE INTO document_tags (tag, documentId) VALUES (?, ?)");
      for (const tag of map.tags ?? []) insertTag.run(tag, documentId);

      const insertSection = this.prepareWrite(`
        INSERT INTO sections (documentId, sectionId, title, shortDescription, summary, fromLine, toLine)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const insertSectionText = this.prepareWrite(`
        INSERT INTO sections_fts (rowid, title, shortDescription, summary, keywords, body) VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const section of map.sections) {
        const { lastInsertRowid } = insertSection.run(
          documentId, section.sectionId, section.title, section.shortDescription, section.summary,
          section.fromLine, section.toLine,
        );
        const body = lines.slice(section.fromLine - 1, section.toLine).join("\n");
        insertSectionText.run(
          lastInsertRowid, section.title, section.shortDescription, section.summary, section.keywords.join(" "), body,
        );
      }

      if (vectors) this.insertVectors(BigInt(documentRowid), map.sections, vectors);
    });
  }

  /** Removes every row of the document in one transaction. Returns `false` if it was not indexed. */
  deleteDocument(documentId: DocumentId): boolean {
    return this.transaction(() => {
      const findDocument = this.db.prepare("SELECT rowid FROM documents WHERE documentId = ?");
      findDocument.setReadBigInts(true);
      const id = bindDocumentId(documentId);
      const document = findDocument.get(id) as { rowid: bigint } | undefined;
      if (!document) return false;
      const findSections = this.db.prepare("SELECT rowid FROM sections WHERE documentId = ?");
      findSections.setReadBigInts(true);
      const sectionRows = findSections.all(id) as { rowid: bigint }[];
      const deleteSectionText = this.prepareWrite("DELETE FROM sections_fts WHERE rowid = ?");
      for (const { rowid } of sectionRows) deleteSectionText.run(rowid);
      this.prepareWrite("DELETE FROM sections WHERE documentId = ?").run(id);
      this.prepareWrite("DELETE FROM documents_fts WHERE rowid = ?").run(document.rowid);
      this.prepareWrite("DELETE FROM document_tags WHERE documentId = ?").run(id);
      this.prepareWrite("DELETE FROM documents WHERE rowid = ?").run(document.rowid);
      if (this.hasVectors) {
        // vec0 compares partition keys by type: integers must be bound as BigInt.
        this.prepareWrite("DELETE FROM section_vectors WHERE documentId = ?").run(document.rowid);
      }
      return true;
    });
  }

  listCards({ afterDocumentId, ftsQuery, tags, limit }: CatalogFilter): DocumentCard[] {
    const conditions: string[] = [];
    const params: SQLInputValue[] = [];
    if (afterDocumentId !== undefined) {
      conditions.push("documentId > ?");
      params.push(bindDocumentId(afterDocumentId));
    }
    if (ftsQuery) {
      conditions.push("rowid IN (SELECT rowid FROM documents_fts WHERE documents_fts MATCH ?)");
      params.push(ftsQuery);
    }
    if (tags?.length) {
      const unique = [...new Set(tags)];
      conditions.push(`documentId IN (
        SELECT documentId FROM document_tags WHERE tag IN (${placeholders(unique)})
        GROUP BY documentId HAVING COUNT(*) = ?
      )`);
      params.push(...unique, unique.length);
    }
    const rows = this.db.prepare(`
      SELECT documentId, originalFileName, title, shortDescription, keywordsJson, tagsJson, sectionCount
      FROM documents ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY documentId LIMIT ?
    `).all(...params, limit) as unknown as DocumentRow[];
    return rows.map(toCard);
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  private initializeSchema(): void {
    this.transaction(() => {
      const legacy = this.db.prepare(`
        SELECT 1 FROM pragma_table_info('documents') WHERE name = 'documentId' AND type = 'INTEGER' AND pk = 1
      `).get() !== undefined;
      if (legacy) {
        this.db.exec(`
          ALTER TABLE documents RENAME TO legacy_documents;
          ALTER TABLE document_tags RENAME TO legacy_document_tags;
          ALTER TABLE sections RENAME TO legacy_sections;
        `);
      }
      this.db.exec(SCHEMA);
      if (legacy) {
        // Preserve document and section rowids; existing FTS rows and vec0 partitions remain valid.
        this.db.exec(`
          INSERT INTO documents (rowid, documentId, originalFileName, title, shortDescription, keywordsJson,
            tagsJson, sectionCount, lineCount, mapJson, pagesJson)
          SELECT documentId, documentId, originalFileName, title, shortDescription, keywordsJson,
            tagsJson, sectionCount, lineCount, mapJson, pagesJson FROM legacy_documents;
          INSERT INTO document_tags (tag, documentId) SELECT tag, documentId FROM legacy_document_tags;
          INSERT INTO sections (rowid, documentId, sectionId, title, shortDescription, summary, fromLine, toLine)
          SELECT rowid, documentId, sectionId, title, shortDescription, summary, fromLine, toLine FROM legacy_sections;
          DROP TABLE legacy_sections;
          DROP TABLE legacy_document_tags;
          DROP TABLE legacy_documents;
        `);
      }
    });
  }

  private insertVectors(documentRowid: bigint, sections: readonly DocumentSection[], vectors: Float32Array[]): void {
    const insert = this.prepareWrite("INSERT INTO section_vectors (documentId, sectionId, embedding) VALUES (?, ?, ?)");
    sections.forEach((section, index) => {
      insert.run(documentRowid, BigInt(section.sectionId), toBlob(vectors[index]));
    });
  }

  private prepareWrite(sql: string) {
    const statement = this.db.prepare(sql);
    // Every run reports the connection's last insert rowid, even if it did not insert a row.
    statement.setReadBigInts(true);
    return statement;
  }

  private transaction<T>(work: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = work();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}

function toCard(row: DocumentRow): DocumentCard {
  return {
    documentId: row.documentId,
    ...(row.originalFileName !== null && { originalFileName: row.originalFileName }),
    ...(row.title !== null && { title: row.title }),
    shortDescription: row.shortDescription,
    keywords: JSON.parse(row.keywordsJson),
    ...(row.tagsJson !== null && { tags: JSON.parse(row.tagsJson) }),
    sectionCount: row.sectionCount,
  };
}

