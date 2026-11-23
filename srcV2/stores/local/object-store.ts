import { createHash, randomUUID } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { KbError } from '../../contracts/errors.js';
import type { DocumentMapStore } from '../../contracts/interfaces.js';
import type { Document, DocumentSourceInfo, DocumentId, DocumentInfo, DocumentMap, DocumentPage,
  DocumentSectionContent, DocumentSectionOverview, LineRange, PreparedDocument } from '../../contracts/types.js';
import { encodeCursor, decodeCursor } from '../../shared/cursor.js';
import { encodeDocumentId, validateDocumentId } from '../../shared/document-id.js';
import { parseMetadata, serializeMetadata, sourceInfo } from '../../shared/metadata.js';
import { splitLines } from '../../shared/markdown.js';

const PAGE_SIZE = 100;

export class LocalObjectStore implements DocumentMapStore {
  private readonly directory: string;

  constructor(baseDirectory: string) {
    this.directory = resolve(baseDirectory);
    mkdirSync(this.directory, { recursive: true });
  }

  async stat(documentId: DocumentId): Promise<DocumentInfo> {
    return readInfo(this.requireCurrent(documentId));
  }

  async list(idPrefix = '', cursor?: string): Promise<DocumentPage> {
    const after = cursor === undefined ? '' : readListCursor(cursor, idPrefix);
    const ids: DocumentId[] = [];
    for (const entry of readdirSync(this.directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || !/^[a-f0-9]{64}$/.test(entry.name)) continue;
      const current = resolveCurrent(join(this.directory, entry.name));
      if (!current) continue;
      const { documentId } = readInfo(current);
      if (documentId.startsWith(idPrefix) && documentId > after) ids.push(documentId);
    }
    ids.sort();
    const items = ids.slice(0, PAGE_SIZE);
    return ids.length > PAGE_SIZE ? { items, nextCursor: encodeCursor([idPrefix, items.at(-1)]) } : { items };
  }

  async read(documentId: DocumentId): Promise<Uint8Array> {
    return readFileSync(join(this.requireCurrent(documentId), 'original'));
  }

  async readText(documentId: DocumentId, lines?: LineRange): Promise<Document> {
    const prepared = await this.readPreparedDocument(documentId);
    if (!prepared) throw new KbError('not_found', `No prepared Markdown for ${documentId}`);
    const { info, map, markdown } = prepared;
    return { ...info, metadata: map.metadata, text: lines ? readLines(markdown, lines) : markdown };
  }

  async readPreparedDocument(documentId: DocumentId): Promise<PreparedDocument | undefined> {
    const current = resolveCurrent(this.objectDirectory(documentId));
    if (!current) return undefined;
    const map = readMap(current);
    if (!map) return undefined;
    const markdown = readOptional(join(current, 'derived', 'document.md'));
    if (markdown === undefined || createHash('sha256').update(markdown).digest('hex') !== map.markdownSha) return undefined;
    return { info: readInfo(current), map, markdown };
  }

  async write(documentId: DocumentId, body: Uint8Array, source: DocumentSourceInfo = {}): Promise<DocumentInfo> {
    const directory = this.objectDirectory(documentId);
    const sha = createHash('sha256').update(body).digest('hex');
    const info = { documentId, sha, ...sourceInfo(source) };
    const previous = resolveCurrent(directory);
    const version = randomUUID();
    const next = join(directory, version);
    const pointer = join(directory, `.current-${version}`);
    mkdirSync(next, { recursive: true });
    try {
      if (previous && readInfo(previous).sha === sha && existsSync(join(previous, 'derived'))) {
        cpSync(join(previous, 'derived'), join(next, 'derived'), { recursive: true });
      }
      writeFileSync(join(next, 'original'), body, { flush: true });
      writeFileSync(join(next, 'metadata.json'), JSON.stringify(info), { flush: true });
      writeFileSync(pointer, version, { flush: true });
      // A single rename publishes both files together.
      renameSync(pointer, join(directory, 'current'));
    } catch (error) {
      rmSync(next, { recursive: true, force: true });
      rmSync(pointer, { force: true });
      throw error;
    }
    if (previous) cleanDirectory(previous);
    return info;
  }

  async delete(documentId: DocumentId): Promise<void> {
    const directory = this.objectDirectory(documentId);
    const trash = join(this.directory, `.deleted-${randomUUID()}`);
    try { renameSync(directory, trash); } catch (error) {
      if (isMissing(error)) return;
      throw error;
    }
    cleanDirectory(trash);
  }

  async writeDocumentMarkdown(documentId: DocumentId, markdown: string): Promise<void> {
    if (markdown.includes('\r') || markdown.endsWith('\n')) throw new TypeError('Expected canonical Markdown');
    const directory = join(this.requireCurrent(documentId), 'derived');
    if (readOptional(join(directory, 'document.md')) === markdown) return;
    rmSync(join(directory, 'map.json'), { force: true });
    writeAtomic(directory, 'document.md', markdown);
  }

  async readDocumentMarkdown(documentId: DocumentId, lines?: LineRange): Promise<string | undefined> {
    const current = resolveCurrent(this.objectDirectory(documentId));
    if (!current) return undefined;
    const markdown = readOptional(join(current, 'derived', 'document.md'));
    return markdown === undefined || !lines ? markdown : readLines(markdown, lines);
  }

  async writeDocumentMap(documentId: DocumentId, map: DocumentMap): Promise<void> {
    const directory = join(this.requireCurrent(documentId), 'derived');
    const markdown = readOptional(join(directory, 'document.md'));
    if (markdown === undefined) throw new KbError('not_found', 'Missing Markdown revision');
    if (createHash('sha256').update(markdown).digest('hex') !== map.markdownSha) {
      throw new TypeError('The map does not match the stored Markdown');
    }
    const lineCount = splitLines(markdown).length;
    let next = 1;
    const sectionIds = new Set<number>();
    for (const [index, section] of map.sections.entries()) {
      if (!Number.isSafeInteger(section.sectionId) || section.sectionId < 1 || sectionIds.has(section.sectionId) ||
          section.order !== index + 1 || section.lineStart !== next || !Number.isSafeInteger(section.lineEnd) ||
          section.lineEnd < next || section.lineEnd > lineCount ||
          [section.title, section.shortDescription, section.summary].some(value => typeof value !== 'string') ||
          !Array.isArray(section.keywords) || section.keywords.some(term => typeof term !== 'string' || !term.trim())) {
        throw new TypeError('Invalid document map section');
      }
      sectionIds.add(section.sectionId);
      next = section.lineEnd + 1;
    }
    if (map.lineCount !== lineCount || next !== lineCount + 1) throw new TypeError('Document map does not cover the Markdown');
    writeAtomic(directory, 'map.json', JSON.stringify({ ...map, metadata: JSON.parse(serializeMetadata(map.metadata)) }));
  }

  async readDocumentMap(documentId: DocumentId): Promise<DocumentMap | undefined> {
    const current = resolveCurrent(this.objectDirectory(documentId));
    return current ? readMap(current) : undefined;
  }

  async listDocumentSections(documentId: DocumentId): Promise<DocumentSectionOverview[] | undefined> {
    return (await this.readDocumentMap(documentId))?.sections.map(
      ({ sectionId, order, title, shortDescription, lineStart, lineEnd }) => ({
        sectionId, order, title, shortDescription, lineStart, lineEnd,
      }));
  }

  async readDocumentSection(documentId: DocumentId, sectionId: number): Promise<DocumentSectionContent | undefined> {
    if (!Number.isSafeInteger(sectionId) || sectionId < 1) return undefined;
    const current = resolveCurrent(this.objectDirectory(documentId));
    if (!current) return undefined;
    const section = readMap(current)?.sections.find(section => section.sectionId === sectionId);
    if (!section) return undefined;
    const markdown = readOptional(join(current, 'derived', 'document.md'));
    return markdown === undefined ? undefined : {
      ...section, markdown: readLines(markdown, { start: section.lineStart, end: section.lineEnd }),
    };
  }

  // There are no persistent handles to release.
  close(): void {}

  private objectDirectory(documentId: DocumentId): string {
    validateDocumentId(documentId);
    const key = createHash('sha256').update(encodeDocumentId(documentId)).digest('hex');
    return join(this.directory, key);
  }

  private requireCurrent(documentId: DocumentId): string {
    const current = resolveCurrent(this.objectDirectory(documentId));
    if (!current) throw new KbError('not_found', `Unknown document: ${documentId}`);
    return current;
  }
}

function readMap(current: string): DocumentMap | undefined {
  const directory = join(current, 'derived');
  if (!existsSync(join(directory, 'document.md'))) return undefined;
  const json = readOptional(join(directory, 'map.json'));
  if (json === undefined) return undefined;
  const map = JSON.parse(json) as DocumentMap;
  return { ...map, metadata: parseMetadata(JSON.stringify(map.metadata ?? {})), sections: map.sections.map((section, index) => ({
    ...section, sectionId: section.sectionId ?? index + 1, order: section.order ?? index + 1,
    keywords: section.keywords ?? [],
  })) };
}

function readOptional(path: string): string | undefined {
  try { return readFileSync(path, 'utf8'); } catch (error) {
    if (isMissing(error)) return undefined;
    throw error;
  }
}

function writeAtomic(directory: string, name: string, contents: string): void {
  mkdirSync(directory, { recursive: true });
  const pending = join(directory, `.pending-${randomUUID()}`);
  try {
    writeFileSync(pending, contents, { flush: true });
    renameSync(pending, join(directory, name));
  } finally { rmSync(pending, { force: true }); }
}

function readLines(markdown: string, { start, end }: LineRange): string {
  const lines = splitLines(markdown);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start || end > lines.length) {
    throw new RangeError('Expected a 1-based inclusive range inside the Markdown');
  }
  return lines.slice(start - 1, end).join('\n');
}

function resolveCurrent(directory: string): string | undefined {
  let version: string;
  try { version = readFileSync(join(directory, 'current'), 'utf8'); } catch (error) {
    if (isMissing(error)) return undefined;
    throw error;
  }
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(version)) {
    throw new Error('Invalid original version pointer');
  }
  return join(directory, version);
}

function readInfo(directory: string): DocumentInfo {
  const { documentId, sha, metadata, ...source } = JSON.parse(readFileSync(join(directory, 'metadata.json'), 'utf8'));
  return { documentId, sha, ...sourceInfo({ ...metadata, ...source }) };
}

function isMissing(error: unknown): boolean {
  return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

function cleanDirectory(directory: string): void {
  try { rmSync(directory, { recursive: true, force: true }); } catch (error) {
    console.warn('Could not remove an unpublished original version', error);
  }
}

function readListCursor(cursor: string, prefix: string): string {
  const value = decodeCursor(cursor);
  if (!Array.isArray(value) || value.length !== 2 || value[0] !== prefix ||
      typeof value[1] !== 'string' || !value[1].startsWith(prefix) || !value[1]) {
    throw new TypeError('Invalid list cursor');
  }
  return value[1];
}