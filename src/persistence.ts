import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { ParsedDocument } from "./types.js";

const range = z.tuple([z.number(), z.number()]);
const description = {
  summary: z.string(),
  short_description: z.string(),
  keywords: z.array(z.string()),
};
const metadata = z.object({
  map: z.object({
    documentId: z.number(),
    lineCount: z.number(),
    ...description,
    sections: z.array(z.object({
      id: z.number(), order: z.number(), title: z.string(),
      range, pageRange: range.optional(),
      tokens: z.number(), totalTokens: z.number(),
      ...description,
    })),
  }),
  pages: z.array(z.object({ page: z.number(), range: range.nullable() })).optional(),
});

export async function persist(doc: ParsedDocument, folder: string): Promise<void> {
  await mkdir(folder, { recursive: true });
  await writeFile(join(folder, "document.md"), doc.markdown, "utf8");
  await writeFile(join(folder, "metadata.json"), JSON.stringify({ map: doc.map, pages: doc.pages }), "utf8");
}

export async function load(folder: string): Promise<ParsedDocument> {
  const [markdown, json] = await Promise.all([
    readFile(join(folder, "document.md"), "utf8"),
    readFile(join(folder, "metadata.json"), "utf8"),
  ]);
  return { markdown, ...metadata.parse(JSON.parse(json)) };
}
