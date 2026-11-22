import type { DocumentId, PassageSource } from "../document/types.ts";

export function validateLineRange(documentId: DocumentId, fromLine: number, toLine: number, lineCount: number): void {
  const isValid =
    Number.isSafeInteger(fromLine) &&
    Number.isSafeInteger(toLine) &&
    fromLine >= 1 &&
    toLine >= fromLine &&
    toLine <= lineCount;
  if (!isValid) {
    throw new RangeError(`Invalid line range ${fromLine}-${toLine} in document ${documentId}`);
  }
}

/** Key of a passage, matching the agent's citation markers `[[kb:documentId:fromLine:toLine]]`. */
export function passageKey({ documentId, fromLine, toLine }: PassageSource): string {
  return `${documentId}:${fromLine}:${toLine}`;
}

/** Minimal LRU cache: reading an entry makes it the most recent. */
export class LruCache<K, V> {
  private readonly entries = new Map<K, V>();

  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    const value = this.entries.get(key);
    if (value !== undefined) {
      this.entries.delete(key);
      this.entries.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    this.entries.delete(key);
    this.entries.set(key, value);
    if (this.entries.size > this.capacity) {
      this.entries.delete(this.entries.keys().next().value!);
    }
  }

  delete(key: K): void {
    this.entries.delete(key);
  }
}
