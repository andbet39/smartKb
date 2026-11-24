export function validateDocumentId(id: string): void {
  if (typeof id !== 'string' || id.length === 0) throw new TypeError('Expected a non-empty documentId');
}

// UTF-16 bytes preserve every JavaScript string, including embedded NULs and lone surrogates.
export function encodeDocumentId(id: string): Buffer {
  return Buffer.from(id, 'utf16le');
}

export function decodeDocumentId(id: Uint8Array): string {
  return Buffer.from(id).toString('utf16le');
}