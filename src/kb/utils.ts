import { readdir } from "node:fs/promises";
import { join } from "node:path";
import {
  findMarkdownFile,
  loadMarkdown,
  loadMetadataFiles,
  type MarkdownFileInfo,
  type StoredManifest,
} from "../parser/persistence.ts";
import type { DocumentLineRange, DocumentPage, DocumentSection } from "../parser/types.ts";
import type { DocumentSource, PageSpan, PassageSource, SectionSource } from "./types.ts";

export interface KbDocumentEntry extends StoredManifest {
  folder: string;
}

export interface DocumentCard extends DocumentSource {
  shortDescription: string;
  keywords: string[];
}

export interface AgentDocumentToc extends DocumentSource {
  shortDescription: string;
  sections: { sectionId: number; title: string; shortDescription: string }[];
}

export interface DocumentText {
  markdown: string;
  lines: string[];
}

export class KbUtils {
  static async loadCatalog(roots: readonly string[]): Promise<Map<number, KbDocumentEntry>> {
    const documents = new Map<number, KbDocumentEntry>();

    for (const root of roots) {
      for await (const folder of discoverDocumentFolders(root)) {
        for (const manifest of await loadMetadataFiles(folder)) {
          const id = manifest.map.documentId;
          const existing = documents.get(id);
          if (existing) {
            throw new Error(`Duplicate document ${id}: ${existing.folder} and ${folder}`);
          }
          documents.set(id, { ...manifest, folder });
        }
      }
    }
    return documents;
  }

  static async isMarkdownShared(
    entries: Iterable<KbDocumentEntry>,
    documentId: number,
    folder: string,
    target: MarkdownFileInfo,
  ): Promise<boolean> {
    for (const other of entries) {
      if (other.map.documentId === documentId || other.folder !== folder) continue;
      const candidate = await findMarkdownFile(folder, other.map.originalFileName);
      if (candidate && KbUtils.samePhysicalFile(candidate, target)) {
        return true;
      }
    }
    return false;
  }

  static async readDocumentText(entry: KbDocumentEntry): Promise<DocumentText> {
    const markdown = await loadMarkdown(entry.folder, entry.map.originalFileName);
    const lines = markdown ? markdown.split("\n") : [];
    if (lines.length !== entry.map.lineCount) {
      throw new Error(`Markdown line count differs from metadata in ${entry.folder}`);
    }
    return { markdown, lines };
  }

  static buildDocumentSource({ map }: KbDocumentEntry): DocumentSource {
    return {
      documentId: map.documentId,
      originalFileName: map.originalFileName ?? null,
      ...(map.title !== undefined && { title: map.title }),
    };
  }

  static buildPassageSource(
    entry: KbDocumentEntry,
    range: DocumentLineRange,
    section?: DocumentSection,
  ): PassageSource {
    const [fromLine, toLine] = range;
    const containing = section ?? entry.map.sections.find(item => item.range[0] <= fromLine && toLine <= item.range[1]);
    return {
      ...KbUtils.buildDocumentSource(entry),
      fromLine,
      toLine,
      pages: KbUtils.computePageSpans(entry.pages, range),
      ...(containing && { sectionId: containing.id, sectionTitle: containing.title }),
    };
  }

  static buildSectionSource(entry: KbDocumentEntry, section: DocumentSection): SectionSource {
    return {
      ...KbUtils.buildPassageSource(entry, section.range, section),
      sectionId: section.id,
      sectionTitle: section.title,
    };
  }

  static buildSelectionCards(entries: Iterable<KbDocumentEntry>): DocumentCard[] {
    return Array.from(entries, entry => ({
      ...KbUtils.buildDocumentSource(entry),
      shortDescription: entry.map.short_description,
      keywords: entry.map.keywords,
    }));
  }

  static buildAgentToc(entries: Iterable<KbDocumentEntry>): AgentDocumentToc[] {
    // Build the index from loaded metadata without reading the Markdown files.
    return Array.from(entries, entry => ({
      ...KbUtils.buildDocumentSource(entry),
      shortDescription: entry.map.short_description,
      sections: entry.map.sections.map(section => ({
        sectionId: section.id,
        title: section.title,
        shortDescription: section.short_description,
      })),
    }));
  }

  static validateLineRange(documentId: number, start: number, end: number, lineCount: number): void {
    const isValid =
      Number.isSafeInteger(start) &&
      Number.isSafeInteger(end) &&
      start >= 1 &&
      end >= start &&
      end <= lineCount;
    if (!isValid) {
      throw new RangeError(`Invalid line range ${start}-${end} in document ${documentId}`);
    }
  }

  static passageKey({ documentId, fromLine, toLine }: PassageSource): string {
    return `${documentId}:${fromLine}:${toLine}`;
  }

  private static computePageSpans(
    pages: readonly DocumentPage[] | undefined,
    [fromLine, toLine]: DocumentLineRange,
  ): PageSpan[] | null {
    if (!pages) return null;
    // A section's pageRange can include blank pages: cite only actual overlapping lines.
    return pages.flatMap(page => {
      if (!page.range) return [];
      const start = Math.max(fromLine, page.range[0]);
      const end = Math.min(toLine, page.range[1]);
      return start <= end ? [{ pageNumber: page.page, fromLine: start, toLine: end }] : [];
    });
  }

  private static samePhysicalFile(first: MarkdownFileInfo, second: MarkdownFileInfo): boolean {
    return first.stats.dev === second.stats.dev && first.stats.ino === second.stats.ino;
  }
}

async function* discoverDocumentFolders(folder: string): AsyncGenerator<string> {
  const children = await readdir(folder, { withFileTypes: true });
  if (children.some(child => child.isFile() && child.name.endsWith(".json"))) {
    yield folder;
  }
  for (const child of children) {
    if (child.isDirectory()) {
      yield* discoverDocumentFolders(join(folder, child.name));
    }
  }
}
