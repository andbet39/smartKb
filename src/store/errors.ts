import type { KbStoreErrorCode } from "./types.ts";

/** The only error type a `KbStore` rejects with. `code` tells the cause; `cause` keeps the backend error. */
export class KbStoreError extends Error {
  constructor(readonly code: KbStoreErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "KbStoreError";
  }
}

/** Wraps anything that is not already a `KbStoreError` as a `BACKEND` error. */
export function toStoreError(cause: unknown, context: string): KbStoreError {
  if (cause instanceof KbStoreError) return cause;
  const reason = cause instanceof Error ? cause.message : String(cause);
  return new KbStoreError("BACKEND", `${context}: ${reason}`, { cause });
}
