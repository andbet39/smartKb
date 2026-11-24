import { lstatSync, mkdirSync, readdirSync, rmdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getLoadablePath } from 'sqlite-vec';
import type { DocumentId, IndexMatch } from '../../contracts/types.js';
import { decodeDocumentId, encodeDocumentId } from '../../shared/document-id.js';
import type { IndexSection } from './types.js';

export class MapRepository {
  private readonly db: DatabaseSync;
  constructor(directory: string, semantic: boolean) {
    if (typeof directory !== 'string' || !directory) throw new TypeError('Expected a map index directory');
    const root = resolve(directory);
    mkdirSync(root, { recursive: true });
    const filename = join(root, 'map.sqlite');
    this.db = new DatabaseSync(filename, { allowExtension: semantic });
    try {
      if (semantic) {
        this.db.loadExtension(getLoadablePath());
        this.db.enableLoadExtension(false);
      }
      this.db.exec(`
        PRAGMA busy_timeout = 5000;
        PRAGMA foreign_keys = ON;
      `);
      this.discardLegacyIndex();
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS published (id BLOB PRIMARY KEY, key TEXT NOT NULL) STRICT;
        CREATE TABLE IF NOT EXISTS sections (
          rowid INTEGER PRIMARY KEY, id BLOB NOT NULL REFERENCES published(id) ON DELETE CASCADE,
          section_id INTEGER NOT NULL, vector BLOB
        ) STRICT;
        CREATE INDEX IF NOT EXISTS sections_document ON sections(id);
        CREATE VIRTUAL TABLE IF NOT EXISTS section_search USING fts5(title, summary, text, content='', contentless_delete=1);
        CREATE TRIGGER IF NOT EXISTS remove_section_search AFTER DELETE ON sections
        BEGIN DELETE FROM section_search WHERE rowid = old.rowid; END;
      `);
      removeLegacyCopies(`${filename}.artifacts`);
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  hasIndex(documentId: DocumentId, key: string): boolean {
    return this.db.prepare('SELECT 1 FROM published WHERE id = ? AND key = ?').get(encodeDocumentId(documentId), key) !== undefined;
  }

  listPublished(): DocumentId[] {
    return this.db.prepare('SELECT id FROM published').all().map(row => decodeDocumentId(row.id as Uint8Array));
  }

  publish(documentId: DocumentId, key: string, sections: IndexSection[], vectors?: Float32Array[]): void {
    const id = encodeDocumentId(documentId);
    this.transaction(() => {
      this.remove(documentId);
      this.db.prepare('INSERT INTO published(id, key) VALUES (?, ?)').run(id, key);
      const insertSection = this.db.prepare('INSERT INTO sections(id, section_id, vector) VALUES (?, ?, ?)');
      const insertSearch = this.db.prepare('INSERT INTO section_search(rowid, title, summary, text) VALUES (?, ?, ?, ?)');
      for (const [index, { section, text }] of sections.entries()) {
        const { sectionId, title, summary, shortDescription, keywords } = section;
        const { lastInsertRowid } = insertSection.run(id, sectionId, vectors?.[index] ?? null);
        const metadataText = [summary, shortDescription !== summary ? shortDescription : '', ...keywords].filter(Boolean).join('\n');
        insertSearch.run(lastInsertRowid, title, metadataText, text);
      }
    });
  }

  remove(documentId: DocumentId): void {
    this.db.prepare('DELETE FROM published WHERE id = ?').run(encodeDocumentId(documentId));
  }

  keywordCandidates(query: string): IndexMatch[] {
    return toCandidates(this.db.prepare(`
      SELECT s.id, s.section_id, -bm25(section_search) AS score
      FROM section_search JOIN sections s ON s.rowid = section_search.rowid
      WHERE section_search MATCH ?
    `).all(query));
  }

  semanticCandidates(version: string, query: Float32Array): IndexMatch[] {
    return toCandidates(this.db.prepare(`
      SELECT s.id, s.section_id, 1 - vec_distance_cosine(s.vector, ?) AS score
      FROM sections s JOIN published p ON p.id = s.id
      WHERE s.vector IS NOT NULL AND substr(p.key, 1, ?) = ?
    `).all(query, version.length + 1, `${version}:`));
  }

  close(): void { this.db.close(); }

  private discardLegacyIndex(): void {
    const legacy = this.db.prepare("SELECT 1 FROM pragma_table_info('published') WHERE name = 'artifact'").get();
    if (!legacy) return;
    // Only the derived index is replaced. Originals are in a different database.
    this.transaction(() => this.db.exec(`
      DROP TRIGGER IF EXISTS remove_section_search;
      DROP TABLE published;
      DROP TABLE sections;
      DROP TABLE section_search;
      DROP TABLE artifacts;
    `));
  }

  private transaction(operation: () => void): void {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      operation();
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
}

function toCandidates(rows: Record<string, unknown>[]): IndexMatch[] {
  return rows.map(row => ({
    documentId: decodeDocumentId(row.id as Uint8Array),
    sectionId: row.section_id as number,
    score: row.score as number,
  }));
}

function removeLegacyCopies(directory: string): void {
  if (!lstatSync(directory, { throwIfNoEntry: false })?.isDirectory()) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^(?:[a-f0-9]{64}-[a-f0-9]{64}|\.staging-[a-zA-Z0-9]+)$/.test(entry.name)) continue;
    const path = join(directory, entry.name);
    const files = readdirSync(path, { withFileTypes: true });
    if (files.some(file => !file.isFile() || !['document.md', 'map.json'].includes(file.name))) continue;
    rmSync(path, { recursive: true, force: true });
  }
  if (!readdirSync(directory).length) rmdirSync(directory);
}