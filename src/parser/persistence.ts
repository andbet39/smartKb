import type { Stats } from "node:fs";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import type { ParsedDocument } from "./types.ts";

const LEGACY_MARKDOWN_FILE = "document.md";
const LEGACY_METADATA_FILE = "metadata.json";

const positionSchema = z.number().int().positive();
const rangeSchema = z
  .tuple([positionSchema, positionSchema])
  .refine(([start, end]) => start <= end, "Reversed range");

const descriptionSchema = {
  summary: z.string(),
  short_description: z.string(),
  keywords: z.array(z.string()),
};

const metadataSchema = z.object({
  map: z.object({
    documentId: z.number(),
    originalFileName: z.string().optional(),
    title: z.string().optional(),
    author: z.string().optional(),
    fileType: z.string().optional(),
    tags: z.array(z.string()).optional(),
    lineCount: z.number().int().nonnegative(),
    ...descriptionSchema,
    sections: z.array(z.object({
      id: z.number(),
      order: z.number(),
      title: z.string(),
      range: rangeSchema,
      pageRange: rangeSchema.optional(),
      tokens: z.number(),
      totalTokens: z.number(),
      ...descriptionSchema,
    })),
  }),
  pages: z.array(z.object({ page: positionSchema, range: rangeSchema.nullable() })).optional(),
});

export type StoredDocumentMetadata = Omit<ParsedDocument, "markdown">;

export interface StoredManifest extends StoredDocumentMetadata {
  manifestPath: string;
}

export interface MarkdownFileInfo {
  path: string;
  stats: Stats;
}

export async function persist(doc: ParsedDocument, folder: string): Promise<void> {
  await mkdir(folder, { recursive: true });
  const { markdownFile, metadataFile } = resolvePersistenceFileNames(doc.map.originalFileName);
  await writeFile(join(folder, markdownFile), doc.markdown, "utf8");
  await writeFile(join(folder, metadataFile), JSON.stringify({ map: doc.map, pages: doc.pages }), "utf8");
}

export async function load(folder: string): Promise<ParsedDocument> {
  const data = await loadMetadata(folder);
  const markdown = await loadMarkdown(folder, data.map.originalFileName);
  return { markdown, ...data };
}

export async function loadMetadata(folder: string): Promise<StoredDocumentMetadata> {
  const manifestNames = await listJsonManifestNames(folder);
  const legacyManifest = manifestNames.find(name => name === LEGACY_METADATA_FILE);
  if (!legacyManifest && manifestNames.length > 1) {
    throw new Error(`Multiple metadata manifests in ${folder}`);
  }
  const selected = legacyManifest ?? manifestNames[0] ?? LEGACY_METADATA_FILE;
  return readMetadataFile(join(folder, selected));
}

export async function loadMetadataFiles(folder: string): Promise<StoredManifest[]> {
  const manifestNames = (await listJsonManifestNames(folder)).sort((a, b) => a.localeCompare(b));
  const manifests: StoredManifest[] = [];
  for (const name of manifestNames) {
    const manifestPath = join(folder, name);
    manifests.push({ ...(await readMetadataFile(manifestPath)), manifestPath });
  }
  return manifests;
}

export async function loadMarkdown(folder: string, originalFileName?: string): Promise<string> {
  const [primary, fallback] = markdownCandidatePaths(folder, originalFileName);
  try {
    return await readFile(primary, "utf8");
  } catch (cause) {
    if (!fallback || !isMissingFileError(cause)) throw cause;
    return readFile(fallback, "utf8");
  }
}

export async function findMarkdownFile(
  folder: string,
  originalFileName?: string,
): Promise<MarkdownFileInfo | undefined> {
  for (const path of markdownCandidatePaths(folder, originalFileName)) {
    try {
      return { path, stats: await lstat(path) };
    } catch (cause) {
      if (!isMissingFileError(cause)) throw cause;
    }
  }
  return undefined;
}

function resolvePersistenceFileNames(originalFileName?: string): { markdownFile: string; metadataFile: string } {
  const cleanName = originalFileName && basename(originalFileName);
  return {
    markdownFile: cleanName ? `${cleanName}.md` : LEGACY_MARKDOWN_FILE,
    metadataFile: cleanName ? `${cleanName}.json` : LEGACY_METADATA_FILE,
  };
}

function markdownCandidatePaths(folder: string, originalFileName?: string): string[] {
  const cleanName = originalFileName && basename(originalFileName);
  const legacyPath = join(folder, LEGACY_MARKDOWN_FILE);
  return cleanName ? [join(folder, `${cleanName}.md`), legacyPath] : [legacyPath];
}

async function listJsonManifestNames(folder: string): Promise<string[]> {
  const entries = await readdir(folder, { withFileTypes: true });
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith(".json"))
    .map(entry => entry.name);
}

async function readMetadataFile(path: string): Promise<StoredDocumentMetadata> {
  const json = await readFile(path, "utf8");
  try {
    const data = metadataSchema.parse(JSON.parse(json));
    validateMetadataInvariants(data);
    return data;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`Invalid metadata in ${path}: ${reason}`, { cause });
  }
}

function validateMetadataInvariants(data: StoredDocumentMetadata): void {
  const { lineCount, sections } = data.map;
  const hasOutOfBoundsRange =
    sections.some(section => section.range[1] > lineCount) ||
    data.pages?.some(page => page.range !== null && page.range[1] > lineCount);
  if (hasOutOfBoundsRange) {
    throw new Error("Line range extends beyond lineCount");
  }
  const uniqueIds = new Set(sections.map(section => section.id));
  if (uniqueIds.size !== sections.length) {
    throw new Error("Duplicate section ID");
  }
}

function isMissingFileError(cause: unknown): boolean {
  return cause instanceof Error && "code" in cause && cause.code === "ENOENT";
}
