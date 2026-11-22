import { z } from "zod";
import { documentIdSchema } from "../document/id.ts";
import { buildPassageSource, buildSectionSource, findSection } from "../document/sources.ts";
import type { DocumentId, DocumentSection, ParsedDocument } from "../document/types.ts";
import type { KBSearchEngine } from "../search/interfaces.ts";
import type { SearchHit } from "../search/types.ts";
import type { DocumentReader } from "./interfaces.ts";
import type { SearchOptions, SearchQuery, SearchResult, SemanticMatch, SemanticSearchResult } from "./types.ts";

// Turns search hits into the snippets returned to the agent, within fixed budgets.

const MAX_CONTEXT_LINES = 20;
const MAX_WINDOWS = 20;
const MAX_CHARACTERS = 12_000; // UTF-16 units of returned text, newlines included.
const SEMANTIC_LIMIT = 10;

const contextLinesSchema = z.int().min(0).max(MAX_CONTEXT_LINES).optional();
export const searchOptionsSchema = z.object({
  beforeLines: contextLinesSchema,
  afterLines: contextLinesSchema,
  fullSection: z.boolean().optional(),
});
export const documentIdsSchema = z.array(documentIdSchema).optional();

/** A line range to return; `matchLines` are the lines that caused it. */
interface Window {
  fromLine: number;
  toLine: number;
  matchLines: number[];
}

/**
 * Keyword search: the engine finds the sections, the manager cuts windows around the matched lines.
 * A section without matched lines (the index matched it, a literal substring did not) or with
 * `fullSection` is returned whole.
 */
export async function searchByKeywords(
  engine: KBSearchEngine,
  limit: number,
  reader: DocumentReader,
  query: Extract<SearchQuery, { kind: "keywords" }>,
  documentIds: DocumentId[] | undefined,
  options: SearchOptions,
): Promise<SearchResult> {
  const { beforeLines = 0, afterLines = 0, fullSection = false } = searchOptionsSchema.parse(options);
  const hits = await engine.keywordSearch({
    keywords: query.keywords,
    caseSensitive: query.caseSensitive,
    documentIds: documentIdsSchema.parse(documentIds),
    limit,
  });

  const collector = new SnippetCollector();
  for (const [documentId, documentHits] of groupByDocument(hits)) {
    const doc = await reader.getDocument(documentId);
    const lines = await reader.readLines(documentId);
    const windows = documentHits.flatMap(hit => {
      const section = findSection(doc, hit.sectionId);
      const matched = hit.lines ?? [];
      return fullSection || !matched.length
        ? [sectionWindow(section, matched)]
        : matched.map(line => contextWindow(line, beforeLines, afterLines, lines.length));
    });
    if (!collector.addAll(doc, lines, mergeWindows(windows))) break;
  }
  // A full page of hits means the engine may have more.
  if (hits.length === limit) collector.markTruncated();
  return collector.result();
}

/** Regular expressions run in the manager, on the listed documents only: no index can evaluate them. */
export async function searchByRegex(
  reader: DocumentReader,
  query: Extract<SearchQuery, { kind: "regex" }>,
  documentIds: DocumentId[] | undefined,
  options: SearchOptions,
): Promise<SearchResult> {
  if (typeof query.pattern !== "string") {
    throw new Error("Expected a regular expression string");
  }
  const expression = new RegExp(query.pattern, query.caseSensitive ? "u" : "iu");
  const { beforeLines = 0, afterLines = 0, fullSection = false } = searchOptionsSchema.parse(options);
  const ids = documentIdsSchema.parse(documentIds);
  if (!ids?.length) {
    throw new Error("A regular expression search requires documentIds: find the documents with a keyword search first");
  }

  const collector = new SnippetCollector();
  for (const documentId of new Set(ids)) {
    const doc = await reader.getDocument(documentId);
    const lines = await reader.readLines(documentId);
    const windows: Window[] = [];
    lines.forEach((text, index) => {
      if (!expression.test(text)) return;
      const line = index + 1;
      const section = fullSection && doc.map.sections.find(item => item.fromLine <= line && line <= item.toLine);
      windows.push(section ? sectionWindow(section, [line]) : contextWindow(line, beforeLines, afterLines, lines.length));
    });
    if (!collector.addAll(doc, lines, mergeWindows(windows))) break;
  }
  return collector.result();
}

export async function searchSemantic(
  engine: KBSearchEngine,
  limit: number,
  reader: DocumentReader,
  text: string,
  documentIds: DocumentId[] | undefined,
  { fullSection = false }: Pick<SearchOptions, "fullSection">,
): Promise<SemanticSearchResult> {
  if (!engine.semanticSearch) {
    throw new Error("This knowledge base has no semantic index");
  }
  const hits = await engine.semanticSearch({
    text,
    documentIds: documentIdsSchema.parse(documentIds),
    limit: Math.min(SEMANTIC_LIMIT, limit),
    fullSection,
  });

  let remaining = MAX_CHARACTERS;
  let truncated = false;
  const matches: SemanticMatch[] = [];
  for (const hit of hits) {
    const doc = await reader.getDocument(hit.documentId);
    const match: SemanticMatch = {
      source: buildSectionSource(doc, findSection(doc, hit.sectionId)),
      shortDescription: hit.shortDescription,
      ...(hit.summary !== undefined && { summary: hit.summary }),
      ...(hit.score !== undefined && { score: hit.score }),
    };
    // Past the text budget, results keep their pointer but lose the section text.
    if (hit.markdown !== undefined) {
      if (hit.markdown.length <= remaining) {
        match.markdown = hit.markdown;
        remaining -= hit.markdown.length;
      } else {
        truncated = true;
      }
    }
    matches.push(match);
  }
  return truncated ? { matches, truncated } : { matches };
}

/** Collects snippets in order and stops at the first window that exceeds a budget. */
class SnippetCollector {
  private readonly matches: SearchResult["matches"] = [];
  private remaining = MAX_CHARACTERS;
  private truncated = false;

  /** Returns `false` once a budget is exhausted. */
  addAll(doc: Omit<ParsedDocument, "markdown">, lines: readonly string[], windows: readonly Window[]): boolean {
    for (const window of windows) {
      if (!this.add(doc, lines, window)) {
        this.truncated = true;
        return false;
      }
    }
    return true;
  }

  markTruncated(): void {
    this.truncated = true;
  }

  result(): SearchResult {
    return this.truncated ? { matches: this.matches, truncated: true } : { matches: this.matches };
  }

  private add(doc: Omit<ParsedDocument, "markdown">, lines: readonly string[], { fromLine, toLine, matchLines }: Window): boolean {
    if (this.matches.length >= MAX_WINDOWS) return false;
    const snippet = lines.slice(fromLine - 1, toLine).join("\n");
    if (snippet.length > this.remaining) return false;
    this.remaining -= snippet.length;
    this.matches.push({ snippet, source: buildPassageSource(doc, fromLine, toLine), matchLines });
    return true;
  }
}

function contextWindow(line: number, beforeLines: number, afterLines: number, lineCount: number): Window {
  return {
    fromLine: Math.max(1, line - beforeLines),
    toLine: Math.min(lineCount, line + afterLines),
    matchLines: [line],
  };
}

function sectionWindow(section: DocumentSection, matchLines: number[]): Window {
  return { fromLine: section.fromLine, toLine: section.toLine, matchLines };
}

/** Sorts by start and merges windows that overlap; windows that only touch stay separate. */
function mergeWindows(windows: readonly Window[]): Window[] {
  const sorted = [...windows].sort((a, b) => a.fromLine - b.fromLine || a.toLine - b.toLine);
  const merged: Window[] = [];
  for (const window of sorted) {
    const last = merged.at(-1);
    if (last && window.fromLine <= last.toLine) {
      last.toLine = Math.max(last.toLine, window.toLine);
      last.matchLines = [...new Set([...last.matchLines, ...window.matchLines])].sort((a, b) => a - b);
    } else {
      merged.push({ ...window, matchLines: [...window.matchLines] });
    }
  }
  return merged;
}

/** Groups hits by document in order of first appearance, i.e. best document first. */
function groupByDocument(hits: readonly SearchHit[]): Map<DocumentId, SearchHit[]> {
  const groups = new Map<DocumentId, SearchHit[]>();
  for (const hit of hits) {
    const group = groups.get(hit.documentId);
    if (group) group.push(hit);
    else groups.set(hit.documentId, [hit]);
  }
  return groups;
}
