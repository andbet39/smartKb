import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import type { ParsedDocument } from "./types.js";

const position = z.number().int().positive();
const range = z.tuple([position, position]).refine(([start, end]) => start <= end, "Reversed range");
const description = {
  summary: z.string(),
  short_description: z.string(),
  keywords: z.array(z.string()),
};
const metadata = z.object({
  map: z.object({
    documentId: z.number(),
    originalFileName: z.string().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
    fileType: z.string().optional(),
    tags: z.array(z.string()).optional(),
    lineCount: z.number().int().nonnegative(),
    ...description,
    sections: z.array(z.object({
      id: z.number(), order: z.number(), title: z.string(),
      range, pageRange: range.optional(),
      tokens: z.number(), totalTokens: z.number(),
      ...description,
    })),
  }),
  pages: z.array(z.object({ page: position, range: range.nullable() })).optional(),
});

export async function persist(doc: ParsedDocument, folder: string): Promise<void> {
  await mkdir(folder, { recursive: true });
  const originalFileName = doc.map.originalFileName && basename(doc.map.originalFileName);
  const markdownFile = originalFileName ? `${originalFileName}.md` : "document.md";
  const metadataFile = originalFileName ? `${originalFileName}.json` : "metadata.json";
  await writeFile(join(folder, markdownFile), doc.markdown, "utf8");
  await writeFile(join(folder, metadataFile), JSON.stringify({ map: doc.map, pages: doc.pages }), "utf8");
}

export function loadMarkdown(folder: string, originalFileName?: string): Promise<string> {
  const fileName = originalFileName && basename(originalFileName);
  if (!fileName) return readFile(join(folder, "document.md"), "utf8");
  return readFile(join(folder, `${fileName}.md`), "utf8").catch(cause => {
    if (!(cause instanceof Error) || !("code" in cause) || cause.code !== "ENOENT") throw cause;
    return readFile(join(folder, "document.md"), "utf8");
  });
}

export async function loadMetadata(folder: string): Promise<Omit<ParsedDocument, "markdown">> {
  const files = await readdir(folder, { withFileTypes: true });
  const manifestFiles = files.filter(file => file.isFile() && file.name.endsWith(".json"));
  const legacyManifest = manifestFiles.find(file => file.name === "metadata.json");
  if (!legacyManifest && manifestFiles.length > 1) {
    throw new Error(`Multiple metadata manifests in ${folder}`);
  }
  const path = join(folder, legacyManifest?.name ?? manifestFiles[0]?.name ?? "metadata.json");
  return readMetadata(path);
}

export async function loadMetadataFiles(folder: string): Promise<Omit<ParsedDocument, "markdown">[]> {
  const files = await readdir(folder, { withFileTypes: true });
  const manifestFiles = files
    .filter(file => file.isFile() && file.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const result = [];
  for (const file of manifestFiles) result.push(await readMetadata(join(folder, file.name)));
  return result;
}

async function readMetadata(path: string): Promise<Omit<ParsedDocument, "markdown">> {
  const json = await readFile(path, "utf8");
  try {
    const data = metadata.parse(JSON.parse(json));
    const { lineCount, sections } = data.map;
    if (sections.some(section => section.range[1] > lineCount) ||
        data.pages?.some(page => page.range && page.range[1] > lineCount)) {
      throw new Error("Line range extends beyond lineCount");
    }
    if (new Set(sections.map(section => section.id)).size !== sections.length) {
      throw new Error("Duplicate section ID");
    }
    return data;
  } catch (cause) {
    throw new Error(`Invalid metadata in ${path}: ${cause instanceof Error ? cause.message : cause}`, { cause });
  }
}

export async function load(folder: string): Promise<ParsedDocument> {
  const data = await loadMetadata(folder);
  const markdown = await loadMarkdown(folder, data.map.originalFileName);
  return { markdown, ...data };
}
