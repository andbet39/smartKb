import { KbError } from '../../contracts/errors.js';
import { decodeCursor } from '../../shared/cursor.js';
import type { Embedder } from './interfaces.js';
import { normalizeVector } from './vector.js';

export function keywordQuery(text: string): string {
  return (text.match(/[\p{L}\p{N}\p{M}]+/gu) ?? []).map(token => `"${token}"`).join(' OR ');
}

export async function embedQuery(text: string, embedder: Embedder): Promise<Float32Array> {
  let vector: number[];
  try {
    vector = await embedder.embedQuery(text);
  } catch (cause) {
    throw new KbError('backend_unavailable', 'Could not embed the query', { cause });
  }
  return normalizeVector(vector, embedder.dimensions);
}

export function readOffset(cursor: string, fingerprint: string): number {
  const value = decodeCursor(cursor);
  if (!Array.isArray(value) || value.length !== 2 || value[0] !== fingerprint ||
      typeof value[1] !== 'number' || !Number.isSafeInteger(value[1]) || value[1] < 0) {
    throw new TypeError('Invalid search cursor for this query');
  }
  return value[1];
}

export function compareText(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }