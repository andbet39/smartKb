import type { DocumentId } from "../../document/types.ts";

export function bindDocumentId(id: DocumentId): bigint | string {
  // node:sqlite binds JS numbers as REAL, even when the number is a safe integer.
  return typeof id === "number" ? BigInt(id) : id;
}

export function placeholders(values: readonly unknown[]): string {
  return values.map(() => "?").join(", ");
}

export function toBlob(vector: Float32Array): Uint8Array {
  return new Uint8Array(vector.buffer, vector.byteOffset, vector.byteLength);
}

export async function loadVectorExtensionPath(): Promise<string> {
  const { getLoadablePath } = await import("sqlite-vec");
  return getLoadablePath();
}