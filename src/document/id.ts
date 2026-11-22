import { z } from "zod";
import type { DocumentId } from "./types.ts";

export const documentIdSchema = z.union([
  z.int().nonnegative(),
  z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
]);

/** Matches SQLite ordering for integer and text values in the catalog. */
export function compareDocumentIds(a: DocumentId, b: DocumentId): number {
  if (typeof a === "number") return typeof b === "number" ? a - b : -1;
  if (typeof b === "number") return 1;
  return a < b ? -1 : a > b ? 1 : 0;
}