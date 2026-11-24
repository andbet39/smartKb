import { createHash } from 'node:crypto';
import type { DocumentMap } from '../../contracts/types.js';

export function indexKey(version: string, map: DocumentMap): string {
  const sections = map.sections.map(s => [s.sectionId, s.lineStart, s.lineEnd, s.title, s.shortDescription,
    s.summary, s.keywords]);
  return `${version}:${createHash('sha256').update(JSON.stringify([map.markdownSha, sections])).digest('hex')}`;
}