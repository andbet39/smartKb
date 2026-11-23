import { lstatSync, readdirSync, rmdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { getLoadablePath } from 'sqlite-vec';
import type { DocumentId, DocumentInfo, IndexMatch } from '../../contracts/types.js';
import { decodeDocumentId, encodeDocumentId } from '../../shared/document-id.js';
import { splitLines } from '../../shared/markdown.js';
import { publicationRevision } from './revision.js';
import type { Artifact } from './types.js';

export class MapRepository {
  private readonly db: DatabaseSync;
  constructor(filename: string, semantic: boolean) {
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
        CREATE TABLE IF NOT EXISTS artifacts (key TEXT PRIMARY KEY) STRICT;
        CREATE TABLE IF NOT EXISTS published (
          id BLOB PRIMARY KEY, sha TEXT NOT NULL, metadata TEXT NOT NULL,
          artifact TEXT NOT NULL REFERENCES artifacts(key)
        ) STRICT;
        CREATE TABLE IF NOT EXISTS sections (
          rowid INTEGER PRIMARY KEY, artifact TEXT NOT NULL REFERENCES artifacts(key) ON DELETE CASCADE,
          first_line INTEGER NOT NULL, last_line INTEGER NOT NULL, page INTEGER,
          vector BLOB, section_id INTEGER
        ) STRICT;
        CREATE INDEX IF NOT EXISTS published_artifact ON published(artifact);
        CREATE INDEX IF NOT EXISTS sections_artifact ON sections(artifact);
        CREATE VIRTUAL TABLE IF NOT EXISTS section_search USING fts5(title, summary, text, content='', contentless_delete=1);
        CREATE TRIGGER IF NOT EXISTS remove_section_search AFTER DELETE ON sections
        BEGIN DELETE FROM section_search WHERE rowid = old.rowid; END;
      `);
      this.transaction(() => {
        if (!this.db.prepare("SELECT 1 FROM pragma_table_info('sections') WHERE name = 'section_id'").get()) {
          this.db.exec('ALTER TABLE sections ADD COLUMN section_id INTEGER');
        }
      });
      removeLegacyCopies(`${filename}.artifacts`);
    } catch (error) {
      this.db.close();
      throw error;
    }
  }

  getPublication(documentId: DocumentId) {
    const row = this.db.prepare('SELECT sha, metadata, artifact FROM published WHERE id = ?').get(encodeDocumentId(documentId));
    if (!row) return undefined;
    return { sha: row.sha as string, metadata: row.metadata as string, key: row.artifact as string };
  }

  hasIndexedArtifact(key: string): boolean {
    return this.db.prepare(`
      SELECT 1 FROM artifacts WHERE key = ? AND NOT EXISTS (
        SELECT 1 FROM sections WHERE artifact = artifacts.key AND section_id IS NULL
      )
    `).get(key) !== undefined;
  }

  listPublished(): DocumentId[] {
    return this.db.prepare('SELECT id FROM published').all().map(row => decodeDocumentId(row.id as Uint8Array));
  }

  publish(info: DocumentInfo, metadata: string, key: string, artifact?: Artifact, vectors?: Float32Array[]): void {
    const previous = this.getPublication(info.documentId);
    this.transaction(() => {
      if (artifact) this.insertArtifact(key, artifact, vectors);
      this.db.prepare(`
        INSERT INTO published VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET sha = excluded.sha, metadata = excluded.metadata, artifact = excluded.artifact
      `).run(encodeDocumentId(info.documentId), info.sha, metadata, key);
      if (previous && previous.key !== key) this.collectArtifact(previous.key);
    });
  }

  remove(documentId: DocumentId): void {
    const publication = this.getPublication(documentId);
    if (!publication) return;
    this.transaction(() => {
      this.db.prepare('DELETE FROM published WHERE id = ?').run(encodeDocumentId(documentId));
      this.collectArtifact(publication.key);
    });
  }

  keywordCandidates(query: string): IndexMatch[] {
    return toCandidates(this.db.prepare(`
      SELECT p.id, p.sha, p.metadata, s.artifact, s.section_id, -bm25(section_search) AS score
      FROM section_search JOIN sections s ON s.rowid = section_search.rowid
      JOIN published p ON p.artifact = s.artifact WHERE section_search MATCH ?
    `).all(query));
  }

  semanticCandidates(version: string, query: Float32Array): IndexMatch[] {
        return toCandidates(this.db.prepare(`
          SELECT p.id, p.sha, p.metadata, s.artifact, s.section_id,
              1 - vec_distance_cosine(s.vector, ?) AS score
      FROM sections s JOIN published p ON p.artifact = s.artifact
      WHERE s.vector IS NOT NULL AND substr(s.artifact, 1, ?) = ?
    `).all(query, version.length + 1, `${version}:`));
  }

  close(): void { this.db.close(); }

  private discardLegacyIndex(): void {
    const legacy = this.db.prepare("SELECT 1 FROM pragma_table_info('artifacts') WHERE name = 'data'").get();
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

  private collectArtifact(key: string): void {
    this.db.prepare('DELETE FROM artifacts WHERE key = ? AND NOT EXISTS (SELECT 1 FROM published WHERE artifact = ?)')
      .run(key, key);
  }

  private insertArtifact(key: string, artifact: Artifact, vectors?: Float32Array[]): void {
    this.db.prepare('INSERT OR IGNORE INTO artifacts VALUES (?)').run(key);
    this.db.prepare('DELETE FROM sections WHERE artifact = ?').run(key);
    const insertSection = this.db.prepare(`
      INSERT INTO sections(artifact, first_line, last_line, page, vector, section_id) VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertSearch = this.db.prepare('INSERT INTO section_search(rowid, title, summary, text) VALUES (?, ?, ?, ?)');
    const lines = splitLines(artifact.text);
    for (const [index, section] of artifact.sections.entries()) {
      const { sectionId, title, summary, shortDescription, keywords, lineStart, lineEnd } = section;
      const page = artifact.pages?.find(page => page.lineStart <= lineStart && page.lineEnd >= lineEnd)?.page;
      const text = lines.slice(lineStart - 1, lineEnd).join('\n');
      const vector = vectors?.[index];
      const { lastInsertRowid } = insertSection.run(key, lineStart, lineEnd, page ?? null, vector ?? null, sectionId);
      const metadataText = [summary, shortDescription !== summary ? shortDescription : '', ...keywords].filter(Boolean).join('\n');
      insertSearch.run(lastInsertRowid, title, metadataText, text);
    }
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
  return rows.flatMap(row => typeof row.section_id === 'number' ? [{
    documentId: decodeDocumentId(row.id as Uint8Array),
    sectionId: row.section_id,
    score: row.score as number,
    revision: publicationRevision(row.artifact as string, row.sha as string, row.metadata as string),
  }] : []);
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