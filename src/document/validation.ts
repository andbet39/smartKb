import { z } from "zod";
import { documentIdSchema } from "./id.ts";
import { splitLines } from "./lines.ts";
import type { ParsedDocument } from "./types.ts";

const position = z.number().int().positive();

const description = {
  summary: z.string(),
  shortDescription: z.string(),
  keywords: z.array(z.string()),
};

const pageSchema = z
  .object({ pageNumber: position, fromLine: position.optional(), toLine: position.optional() })
  .refine(page => (page.fromLine === undefined) === (page.toLine === undefined), "A page needs both fromLine and toLine, or neither")
  .refine(page => page.fromLine === undefined || page.fromLine <= page.toLine!, "Reversed page range");

const sectionSchema = z
  .object({
    sectionId: z.number().int(),
    order: z.number(),
    title: z.string(),
    fromLine: position,
    toLine: position,
    fromPage: position.optional(),
    toPage: position.optional(),
    tokens: z.number(),
    totalTokens: z.number(),
    ...description,
  })
  .refine(section => section.fromLine <= section.toLine, "Reversed section range");

const storedDocumentSchema = z.object({
  map: z.object({
    documentId: documentIdSchema,
    originalFileName: z.string().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
    fileType: z.string().optional(),
    tags: z.array(z.string()).optional(),
    lineCount: z.number().int().nonnegative(),
    ...description,
    sections: z.array(sectionSchema),
  }),
  pages: z.array(pageSchema).optional(),
});

/** Validates map and pages and returns a copy without unknown fields. Throws an `Error` listing the problems. */
export function validateStoredDocument(data: unknown): Omit<ParsedDocument, "markdown"> {
  const parsed = storedDocumentSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(z.prettifyError(parsed.error));
  }
  const doc = parsed.data;
  const { lineCount, sections } = doc.map;
  const outOfBounds =
    sections.some(section => section.toLine > lineCount) ||
    doc.pages?.some(page => page.toLine !== undefined && page.toLine > lineCount);
  if (outOfBounds) {
    throw new Error("Line range extends beyond lineCount");
  }
  if (new Set(sections.map(section => section.sectionId)).size !== sections.length) {
    throw new Error("Duplicate section ID");
  }
  return doc;
}

/** Like `validateStoredDocument`, and also checks that the Markdown has `lineCount` lines. */
export function validateParsedDocument(doc: ParsedDocument): ParsedDocument {
  if (typeof doc?.markdown !== "string") {
    throw new Error("Markdown must be a string");
  }
  const stored = validateStoredDocument({ map: doc.map, pages: doc.pages });
  if (splitLines(doc.markdown).length !== stored.map.lineCount) {
    throw new Error("Markdown line count differs from lineCount");
  }
  return { markdown: doc.markdown, ...stored };
}
