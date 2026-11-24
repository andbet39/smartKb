export function encodeCursor<T>(value: T): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function decodeCursor(cursor: string): unknown {
  try {
    if (!/^[A-Za-z0-9_-]+$/.test(cursor)) throw new Error('Invalid encoding');
    return JSON.parse(Buffer.from(cursor, 'base64url').toString());
  } catch {
    throw new TypeError('Invalid cursor');
  }
}