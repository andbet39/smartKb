import { access, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { documentIdSchema } from "../../document/id.ts";
import { splitLines } from "../../document/lines.ts";
import type { DocumentId, DocumentSection, ParsedDocument } from "../../document/types.ts";
import { validateParsedDocument } from "../../document/validation.ts";
import { KbStoreError, toStoreError } from "../errors.ts";
import type { KbStore } from "../interfaces.ts";
import type { CatalogPage, CatalogQuery } from "../types.ts";
import { IndexDatabase } from "./database.ts";
import { DocumentFiles, errorCode } from "./files.ts";
import { allWords } from "./query.ts";
import { readSettings, writeSettings } from "./settings.ts";
import { loadVectorExtensionPath } from "./sqlite.ts";
import type { PosixSemanticOptions, PosixStoreOptions, PosixStoreSettings } from "./types.ts";

const DEFAULT_MAX_LIMIT = 100;
const DEFAULT_EMBEDDING_BATCH = 64;

/**
 * Filesystem store: one folder per document plus a SQLite index.
 *
 *   <root>/.kb/store.json     embedding model of the index
 *   <root>/.kb/index.sqlite   catalog, sections, FTS5 and vectors
 *   <root>/doc-<id>/          document.md and manifest.json
 *
 * The folders are the canonical copy; the index is derived from them. When index.sqlite is
 * missing (a fresh clone, or a deleted .kb folder) it is rebuilt from the folders on open.
 * Build it with `createPosixStore`.
 */
export class PosixStore implements KbStore {
  readonly maxLimit: number;
  private closed = false;

  private constructor(
    private readonly kbFolder: string,
    private readonly files: DocumentFiles,
    private readonly db: IndexDatabase,
    private settings: PosixStoreSettings,
    private readonly semantic: PosixSemanticOptions | undefined,
    maxLimit: number,
  ) {
    this.maxLimit = maxLimit;
  }

  static async open(options: PosixStoreOptions): Promise<PosixStore> {
    const maxLimit = options.maxLimit ?? DEFAULT_MAX_LIMIT;
    if (!Number.isSafeInteger(maxLimit) || maxLimit < 1) {
      throw new KbStoreError("INVALID_QUERY", "maxLimit must be a positive integer");
    }
    const root = resolve(options.root);
    const kbFolder = join(root, ".kb");
    try {
      await mkdir(kbFolder, { recursive: true });
      const settings = await readSettings(kbFolder);
      if (settings.embedding && !options.semantic) {
        // Without sqlite-vec the vector table cannot even be updated on delete.
        throw new KbStoreError("INDEX_MISMATCH", "This KB has a semantic index: configure the semantic options to open it");
      }
      const extension = options.semantic ? await loadVectorExtensionPath() : undefined;
      const indexPath = join(kbFolder, "index.sqlite");
      const rebuild = !(await fileExists(indexPath));
      const db = new IndexDatabase(indexPath, extension);
      if (settings.embedding) db.enableVectors(settings.embedding.dimensions);
      const store = new PosixStore(kbFolder, new DocumentFiles(root), db, settings, options.semantic, maxLimit);
      if (rebuild) await store.rebuildIndex();
      return store;
    } catch (cause) {
      throw toStoreError(cause, `Cannot open the store in ${root}`);
    }
  }

  // ── Writes ────────────────────────────────────────────────────────────────

  async add(input: ParsedDocument): Promise<void> {
    this.assertOpen();
    const doc = validateDocument(input);
    const { documentId } = doc.map;
    if (this.db.hasDocument(documentId)) throw alreadyExists(documentId);

    try {
      await this.files.createFolder(documentId);
    } catch (cause) {
      if (errorCode(cause) === "EEXIST") throw alreadyExists(documentId);
      throw toStoreError(cause, `Cannot create folder for document ${documentId}`);
    }

    try {
      await this.files.write(doc);
      const vectors = await this.embedSections(doc.map.sections);
      // Commit point: until this transaction ends, the document is invisible.
      this.db.insertDocument(doc, vectors);
    } catch (cause) {
      await this.files.removeFolder(documentId).catch(() => {});
      throw toStoreError(cause, `Cannot add document ${documentId}`);
    }
  }

  async delete(documentId: DocumentId): Promise<boolean> {
    this.assertOpen();
    try {
      if (!this.db.hasDocument(documentId)) return false;
      // Manifest first: if the process stops halfway, a rebuild will not bring the document back.
      await this.files.removeManifest(documentId);
      this.db.deleteDocument(documentId);
      await this.files.removeFolder(documentId);
      return true;
    } catch (cause) {
      throw toStoreError(cause, `Cannot delete document ${documentId}`);
    }
  }

  // ── Reads ─────────────────────────────────────────────────────────────────

  async get(documentId: DocumentId): Promise<Omit<ParsedDocument, "markdown">> {
    this.assertOpen();
    const doc = this.db.getDocument(documentId);
    if (!doc) throw notFound(documentId);
    return doc;
  }

  async read(documentId: DocumentId): Promise<string> {
    this.assertOpen();
    const lineCount = this.db.getLineCount(documentId);
    if (lineCount === undefined) throw notFound(documentId);
    let markdown: string;
    try {
      markdown = await this.files.readMarkdown(documentId);
    } catch (cause) {
      throw toStoreError(cause, `Cannot read document ${documentId}`);
    }
    if (splitLines(markdown).length !== lineCount) {
      throw new KbStoreError("BACKEND", `Markdown of document ${documentId} differs from its line count`);
    }
    return markdown;
  }

  async list({ text, tags, limit, cursor }: CatalogQuery): Promise<CatalogPage> {
    this.assertOpen();
    this.assertLimit(limit);
    const afterDocumentId = cursor === undefined ? undefined : parseCursor(cursor);
    const ftsQuery = text === undefined ? undefined : allWords(text);
    // Ask for one more card to know whether another page exists.
    const cards = this.db.listCards({ afterDocumentId, ftsQuery, tags, limit: limit + 1 });
    if (cards.length <= limit) return { cards };
    const page = cards.slice(0, limit);
    return { cards: page, nextCursor: String(page.at(-1)!.documentId) };
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.db.close();
  }

  // ── Internals ─────────────────────────────────────────────────────────────

  /** Indexes every document folder that has a manifest. Folders without one are reservations. */
  private async rebuildIndex(): Promise<void> {
    for (const documentId of await this.files.listDocumentIds()) {
      const manifest = await this.files.readManifest(documentId);
      if (manifest === undefined) continue;
      const markdown = await this.files.readMarkdown(documentId);
      const doc = validateDocument({ markdown, ...(manifest as Omit<ParsedDocument, "markdown">) });
      if (doc.map.documentId !== documentId) {
        throw new KbStoreError("INVALID_DOCUMENT", `Folder doc-${documentId} contains document ${doc.map.documentId}`);
      }
      this.db.insertDocument(doc, await this.embedSections(doc.map.sections));
    }
  }

  /** One vector per section, from its title and summary. `undefined` without a semantic index. */
  private async embedSections(sections: readonly DocumentSection[]): Promise<Float32Array[] | undefined> {
    if (!this.semantic || !sections.length) return undefined;
    this.assertSameModel();
    const texts = sections.map(section => `${section.title}\n${section.summary}`);
    const batchSize = this.semantic.batchSize ?? DEFAULT_EMBEDDING_BATCH;
    const vectors: Float32Array[] = [];
    for (let start = 0; start < texts.length; start += batchSize) {
      const batch = await this.semantic.embeddings.embedDocuments(texts.slice(start, start + batchSize));
      vectors.push(...batch.map(vector => Float32Array.from(vector)));
    }
    await this.ensureVectorTable(vectors[0].length);
    if (vectors.some(vector => vector.length !== this.settings.embedding!.dimensions)) {
      throw new KbStoreError("INDEX_MISMATCH", "Embedding dimensions differ from the index");
    }
    return vectors;
  }

  /** The first vector fixes the dimensions; they are recorded in store.json with the model. */
  private async ensureVectorTable(dimensions: number): Promise<void> {
    if (this.settings.embedding) return;
    const embedding = { modelId: this.semantic!.modelId, dimensions };
    this.db.enableVectors(dimensions);
    await writeSettings(this.kbFolder, { ...this.settings, embedding });
    this.settings = { ...this.settings, embedding };
  }

  private assertSameModel(): void {
    const indexed = this.settings.embedding?.modelId;
    if (indexed !== undefined && indexed !== this.semantic?.modelId) {
      throw new KbStoreError("INDEX_MISMATCH", `The index was built with model "${indexed}", not "${this.semantic?.modelId}"`);
    }
  }

  private assertOpen(): void {
    if (this.closed) throw new KbStoreError("CLOSED", "The store is closed");
  }

  private assertLimit(limit: number): void {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > this.maxLimit) {
      throw new KbStoreError("INVALID_QUERY", `limit must be an integer between 1 and ${this.maxLimit}`);
    }
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function validateDocument(doc: ParsedDocument): ParsedDocument {
  try {
    return validateParsedDocument(doc);
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new KbStoreError("INVALID_DOCUMENT", `Invalid document: ${reason}`, { cause });
  }
}

function parseCursor(cursor: string): DocumentId {
  const result = documentIdSchema.safeParse(/^\d+$/.test(cursor) ? Number(cursor) : cursor);
  if (!result.success) {
    throw new KbStoreError("INVALID_QUERY", "Invalid cursor");
  }
  return result.data;
}

function alreadyExists(documentId: DocumentId): KbStoreError {
  return new KbStoreError("ALREADY_EXISTS", `Document ${documentId} already exists`);
}

function notFound(documentId: DocumentId): KbStoreError {
  return new KbStoreError("NOT_FOUND", `Unknown document ${documentId}`);
}
