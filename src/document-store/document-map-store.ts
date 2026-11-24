import { createHash } from 'node:crypto';
import { win32 } from 'node:path';
import { KbError } from '../contracts/errors.js';
import type { DocumentStore, ObjectStore } from '../contracts/interfaces.js';
import type { Document, DocumentArtifacts, DocumentId, DocumentInfo, DocumentMap, DocumentPage, DocumentSectionContent,
  DocumentSectionOverview, DocumentSourceInfo, DocumentToc, LineRange } from '../contracts/types.js';
import { splitLines } from '../shared/markdown.js';
import { documentMetadata, sourceInfo } from '../shared/metadata.js';
import { decodeCursor, encodeCursor } from '../shared/cursor.js';
import { validateFileSegment } from '../shared/file-key.js';

export class DocumentMapStore implements DocumentStore {
  constructor(private readonly objects: ObjectStore) {}

  private async findInfo(id: DocumentId): Promise<DocumentInfo | undefined> {
    validateFileSegment(id, 'documentId');
    const bytes = await this.objects.read(`${id}/metadata.json`);
    if (!bytes) return undefined;
    const { documentId, sha, metadata, ...source } = JSON.parse(Buffer.from(bytes).toString('utf8'));
    if (documentId !== id) throw new TypeError('Invalid documentId: directory name collision');
    return { documentId, sha, ...sourceInfo({ ...metadata, ...source }) };
  }

  async stat(id: DocumentId): Promise<DocumentInfo> {
    const info = await this.findInfo(id);
    if (!info) throw new KbError('not_found', `Unknown document: ${id}`);
    return info;
  }

  async list(prefix = '', cursor?: string): Promise<DocumentPage> {
    let after = '';
    if (cursor !== undefined) {
      const value = decodeCursor(cursor);
      if (!Array.isArray(value) || value.length !== 2 || value[0] !== prefix ||
          typeof value[1] !== 'string' || !value[1] || !value[1].startsWith(prefix)) throw new TypeError('Invalid list cursor');
      after = value[1];
    }
    const ids = (await this.objects.list(prefix)).filter(key => /^[^/]+\/metadata\.json$/.test(key))
      .map(key => key.slice(0, key.indexOf('/'))).filter(id => id > after).sort();
    const items = ids.slice(0, 100);
    return ids.length > items.length ? { items, nextCursor: encodeCursor([prefix, items.at(-1)]) } : { items };
  }

  async read(id: DocumentId): Promise<Uint8Array> {
    const info = await this.stat(id);
    const bytes = await this.objects.read(`${id}/${originalName(info)}`);
    if (!bytes) throw new KbError('not_found', `Missing original: ${id}`);
    return bytes;
  }

  async write(id: DocumentId, body: Uint8Array, source: DocumentSourceInfo = {}): Promise<DocumentInfo> {
    const prior = await this.findInfo(id);
    const info = { documentId: id, sha: createHash('sha256').update(body).digest('hex'), ...sourceInfo(source) };
    const key = `${id}/${originalName(info)}`;
    if (prior && (prior.sha !== info.sha || prior.contentType !== info.contentType)) {
      await this.objects.delete(`${id}/artifacts.json`);
    }
    await this.objects.write(key, body);
    try {
      await this.objects.write(`${id}/metadata.json`, Buffer.from(JSON.stringify(info)));
    } catch (error) {
      if (!prior) await this.objects.delete(key);
      throw error;
    }
    if (prior && originalName(prior) !== originalName(info)) {
      const oldKey = `${id}/${originalName(prior)}`;
      // On case-insensitive filesystems a case-only rename addresses the same file.
      const sameSpelling = oldKey.toLowerCase() === key.toLowerCase();
      const keys = sameSpelling ? await this.objects.list(`${id}/`) : [];
      if (!sameSpelling || (keys.includes(key) && keys.includes(oldKey))) {
        await this.objects.delete(oldKey);
      }
    }
    return info;
  }

  async delete(id: DocumentId): Promise<void> {
    const info = await this.findInfo(id);
    if (!info) return;
    await this.objects.delete(`${id}/artifacts.json`);
    await this.objects.delete(`${id}/${originalName(info)}`);
    await this.objects.delete(`${id}/metadata.json`);
  }

  async readText(documentId: DocumentId, lines?: LineRange): Promise<Document> {
    const artifacts = await this.readDocumentArtifacts(documentId);
    if (!artifacts) throw new KbError('not_found', `No final artifacts for ${documentId}`);
    const { info, map, markdown } = artifacts;
    return { ...documentMetadata(info, map), text: lines ? readLines(markdown, lines) : markdown };
  }

  async readDocumentArtifacts(documentId: DocumentId): Promise<(DocumentArtifacts & { info: DocumentInfo }) | undefined> {
    const info = await this.findInfo(documentId);
    if (!info) return undefined;
    const bytes = await this.objects.read(`${documentId}/artifacts.json`);
    if (!bytes) return undefined;
    // Previously saved maps nested the ingestion fields under metadata.
    const { map: { metadata, ...flatMap }, markdown } = JSON.parse(Buffer.from(bytes).toString('utf8'));
    const map: DocumentMap = { ...metadata, ...flatMap };
    if (map.createdAt !== undefined) map.createdAt = new Date(map.createdAt);
    if (map.modifiedAt !== undefined) map.modifiedAt = new Date(map.modifiedAt);
    return { info, map, markdown };
  }

  async readDocumentMarkdown(documentId: DocumentId, lines?: LineRange): Promise<string | undefined> {
    const markdown = (await this.readDocumentArtifacts(documentId))?.markdown;
    return markdown === undefined || !lines ? markdown : readLines(markdown, lines);
  }

  async writeDocumentArtifacts(documentId: DocumentId, { map, markdown }: DocumentArtifacts): Promise<void> {
    if (markdown.includes('\r') || markdown.endsWith('\n')) throw new TypeError('Expected canonical Markdown');
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
    await this.stat(documentId);
    await this.objects.write(`${documentId}/artifacts.json`, Buffer.from(JSON.stringify({ markdown, map })));
  }

  async readDocumentMap(documentId: DocumentId): Promise<DocumentMap | undefined> {
    return (await this.readDocumentArtifacts(documentId))?.map;
  }

  async listDocumentSections(documentId: DocumentId): Promise<DocumentSectionOverview[] | undefined> {
    return (await this.readDocumentMap(documentId))?.sections.map(
      ({ sectionId, order, title, shortDescription, lineStart, lineEnd }) => ({
        sectionId, order, title, shortDescription, lineStart, lineEnd,
      }));
  }

  async getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]): Promise<DocumentToc[]> {
    const result: DocumentToc[] = [];
    for (const documentId of new Set(typeof documentIds === 'string' ? [documentIds] : documentIds)) {
      const sections = await this.listDocumentSections(documentId);
      if (sections !== undefined) result.push({ documentId, sections });
    }
    return result;
  }

  async readDocumentSection(documentId: DocumentId, sectionId: number): Promise<DocumentSectionContent | undefined> {
    if (!Number.isSafeInteger(sectionId) || sectionId < 1) return undefined;
    const artifacts = await this.readDocumentArtifacts(documentId);
    const section = artifacts?.map.sections.find(section => section.sectionId === sectionId);
    return !artifacts || !section ? undefined : {
      ...section, markdown: readLines(artifacts.markdown, { start: section.lineStart, end: section.lineEnd }),
    };
  }
}

function originalName(info: DocumentSourceInfo): string {
  const extension = win32.extname(info.originalFileName ?? '');
  return /^\.[a-z0-9]{1,32}$/i.test(extension) ? `original${extension}` : 'original';
}

function readLines(markdown: string, { start, end }: LineRange): string {
  const lines = splitLines(markdown);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 1 || end < start || end > lines.length) {
    throw new RangeError('Expected a 1-based inclusive range inside the Markdown');
  }
  return lines.slice(start - 1, end).join('\n');
}
