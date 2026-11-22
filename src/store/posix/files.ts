import { mkdir, open, readdir, readFile, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { compareDocumentIds, documentIdSchema } from "../../document/id.ts";
import type { DocumentId, ParsedDocument } from "../../document/types.ts";

const MARKDOWN_FILE = "document.md";
const MANIFEST_FILE = "manifest.json";

/**
 * The canonical files of each document, in `<root>/doc-<id>/`.
 * The folder alone, without an index row, is a reservation.
 */
export class DocumentFiles {
  constructor(private readonly root: string) {}

  /** Creates the folder; fails with `EEXIST` if it already exists. */
  async createFolder(documentId: DocumentId): Promise<void> {
    await mkdir(this.folder(documentId));
  }

  async removeFolder(documentId: DocumentId): Promise<void> {
    await rm(this.folder(documentId), { recursive: true, force: true });
  }

  /** Without its manifest, the folder is no longer rebuilt into the index. */
  async removeManifest(documentId: DocumentId): Promise<void> {
    await rm(join(this.folder(documentId), MANIFEST_FILE), { force: true });
  }

  /** Writes Markdown and manifest. The manifest is the source used to rebuild the index. */
  async write(doc: ParsedDocument): Promise<void> {
    const folder = this.folder(doc.map.documentId);
    const manifest: Omit<ParsedDocument, "markdown"> = { map: doc.map, ...(doc.pages && { pages: doc.pages }) };
    await writeFileDurably(join(folder, MARKDOWN_FILE), doc.markdown);
    await writeFileDurably(join(folder, MANIFEST_FILE), JSON.stringify(manifest));
    await syncDirectory(folder);
  }

  readMarkdown(documentId: DocumentId): Promise<string> {
    return readFile(join(this.folder(documentId), MARKDOWN_FILE), "utf8");
  }

  /** The unvalidated manifest, or `undefined` for an incomplete document folder. */
  async readManifest(documentId: DocumentId): Promise<unknown> {
    try {
      return JSON.parse(await readFile(join(this.folder(documentId), MANIFEST_FILE), "utf8"));
    } catch (cause) {
      if (errorCode(cause) === "ENOENT") return undefined;
      throw cause;
    }
  }

  /** IDs of canonical `doc-<id>` folders, ascending. Other entries of the root are ignored. */
  async listDocumentIds(): Promise<DocumentId[]> {
    const entries = await readdir(this.root, { withFileTypes: true });
    return entries
      .flatMap((entry): DocumentId[] => {
        if (!entry.isDirectory() || !entry.name.startsWith("doc-")) return [];
        const suffix = entry.name.slice(4);
        const id = /^\d+$/.test(suffix) ? Number(suffix) : suffix;
        return String(id) === suffix && isFolderId(id) ? [id] : [];
      })
      .sort(compareDocumentIds);
  }

  private folder(documentId: DocumentId): string {
    if (!isFolderId(documentId)) throw new TypeError("Expected a safe non-negative integer or a lowercase UUID v7");
    return join(this.root, `doc-${documentId}`);
  }
}

function isFolderId(id: DocumentId): boolean {
  // A single lowercase spelling avoids aliases on case-insensitive filesystems.
  return (typeof id !== "string" || (id.length === 36 && /^[0-9a-f-]+$/.test(id))) && documentIdSchema.safeParse(id).success;
}

/** Writes to a temporary file, flushes it to disk, then renames it over the target. */
async function writeFileDurably(path: string, contents: string): Promise<void> {
  const temporary = `${path}.tmp`;
  const handle = await open(temporary, "w");
  try {
    await handle.writeFile(contents, "utf8");
    await handle.sync();
  } finally {
    await handle.close();
  }
  await rename(temporary, path);
}

/** Makes the renames durable. Some platforms cannot sync a directory: that is not an error. */
async function syncDirectory(path: string): Promise<void> {
  try {
    const handle = await open(path, "r");
    try {
      await handle.sync();
    } finally {
      await handle.close();
    }
  } catch {
    // Best effort.
  }
}

export function errorCode(cause: unknown): string | undefined {
  return cause instanceof Error && "code" in cause ? String(cause.code) : undefined;
}
