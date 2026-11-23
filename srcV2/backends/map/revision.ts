import { createHash } from 'node:crypto';
import type { DocumentInfo, DocumentMap } from '../../contracts/types.js';
import { serializeMetadata, sourceInfo } from '../../shared/metadata.js';

export function indexKey(version: string, map: DocumentMap): string {
  const sections = map.sections.map(s => [s.sectionId, s.order, s.lineStart, s.lineEnd, s.title, s.shortDescription,
    s.summary, s.keywords]);
  const pages = map.pages?.map(p => [p.page, p.lineStart, p.lineEnd]);
  return `${version}:${hash([map.markdownSha, sections, pages])}`;
}

export function publicationMetadata(info: DocumentInfo, map: DocumentMap): string {
  return JSON.stringify({ ...JSON.parse(serializeMetadata(map.metadata)), ...sourceInfo(info) });
}

export function publicationRevision(key: string, originalSha: string, metadata: string): string {
  return hash([key, originalSha, metadata]);
}

function hash(value: unknown[]): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}