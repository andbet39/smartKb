import { z } from "zod";
import type { SearchContextOptions, SearchQuery, SearchResult } from "./types.ts";
import { KbUtils, type KbDocumentEntry } from "./utils.ts";

const MAX_CONTEXT_LINES = 20;
const MAX_CONTEXT_WINDOWS = 20;
const MAX_CONTEXT_CHARACTERS = 12_000;

const contextLinesSchema = z.int().min(0).max(MAX_CONTEXT_LINES).optional();
export const searchContextSchema = z.object({
  beforeLines: contextLinesSchema,
  afterLines: contextLinesSchema,
});

type LineMatcher = (line: string) => boolean;

interface ContextWindow {
  fromLine: number;
  toLine: number;
  matchLines: number[];
}

export interface ParsedSearchRequest {
  matchesLine: LineMatcher;
  beforeLines: number;
  afterLines: number;
}

class ContextSearchCollector {
  private readonly matches: SearchResult["matches"] = [];
  private remainingCharacters = MAX_CONTEXT_CHARACTERS;
  private truncated = false;

  constructor(
    private readonly beforeLines: number,
    private readonly afterLines: number,
  ) {}

  collectFromEntry(entry: KbDocumentEntry, lines: readonly string[], matchesLine: LineMatcher): boolean {
    let pendingWindow: ContextWindow | undefined;

    for (const [index, snippet] of lines.entries()) {
      if (!matchesLine(snippet)) continue;
      const line = index + 1;
      const fromLine = Math.max(1, line - this.beforeLines);
      const toLine = Math.min(lines.length, line + this.afterLines);

      if (pendingWindow && fromLine <= pendingWindow.toLine) {
        pendingWindow.toLine = toLine;
        pendingWindow.matchLines.push(line);
      } else {
        if (pendingWindow && !this.appendWindow(entry, lines, pendingWindow)) {
          this.truncated = true;
          return false;
        }
        pendingWindow = { fromLine, toLine, matchLines: [line] };
      }
    }

    if (pendingWindow && !this.appendWindow(entry, lines, pendingWindow)) {
      this.truncated = true;
      return false;
    }
    return true;
  }

  toResult(): SearchResult {
    return this.truncated ? { matches: this.matches, truncated: true } : { matches: this.matches };
  }

  private appendWindow(entry: KbDocumentEntry, lines: readonly string[], window: ContextWindow): boolean {
    if (this.matches.length >= MAX_CONTEXT_WINDOWS) return false;

    const { fromLine, toLine, matchLines } = window;
    let length = toLine - fromLine; // Newlines between the selected lines.
    for (let i = fromLine - 1; i < toLine; i++) {
      length += lines[i].length;
      if (length > this.remainingCharacters) return false;
    }

    this.remainingCharacters -= length;
    const snippet = lines.slice(fromLine - 1, toLine).join("\n");
    this.matches.push({
      snippet,
      source: KbUtils.buildPassageSource(entry, [fromLine, toLine]),
      matchLines,
    });
    return true;
  }
}

export function parseSearchRequest(query: SearchQuery, context?: SearchContextOptions): ParsedSearchRequest {
  const matchesLine = createLineMatcher(query);
  const { beforeLines = 0, afterLines = 0 } = searchContextSchema.parse(context === undefined ? {} : context);
  return { matchesLine, beforeLines, afterLines };
}

export async function executeKeywordSearch(
  entries: Iterable<KbDocumentEntry>,
  request: ParsedSearchRequest,
): Promise<SearchResult> {
  const { matchesLine, beforeLines, afterLines } = request;
  if (beforeLines === 0 && afterLines === 0) {
    return searchWithoutContext(entries, matchesLine);
  }

  const collector = new ContextSearchCollector(beforeLines, afterLines);
  for (const entry of entries) {
    const { lines } = await KbUtils.readDocumentText(entry);
    if (!collector.collectFromEntry(entry, lines, matchesLine)) break;
  }
  return collector.toResult();
}

async function searchWithoutContext(
  entries: Iterable<KbDocumentEntry>,
  matchesLine: LineMatcher,
): Promise<SearchResult> {
  const matches: SearchResult["matches"] = [];
  for (const entry of entries) {
    const { lines } = await KbUtils.readDocumentText(entry);
    for (const [index, snippet] of lines.entries()) {
      if (!matchesLine(snippet)) continue;
      const line = index + 1;
      matches.push({ snippet, source: KbUtils.buildPassageSource(entry, [line, line]) });
    }
  }
  return { matches };
}

function createLineMatcher(query: SearchQuery): LineMatcher {
  if (query.kind === "regex") {
    if (typeof query.pattern !== "string") {
      throw new Error("Expected a regular expression string");
    }
    const expression = new RegExp(query.pattern, query.caseSensitive ? "u" : "iu");
    return line => expression.test(line);
  }

  if (query.kind !== "keywords" || !isValidKeywords(query.keywords)) {
    throw new Error("Expected at least one non-empty search keyword");
  }

  const normalize = (text: string) => (query.caseSensitive ? text : text.toLowerCase());
  const keywords = query.keywords.map(normalize);
  return line => {
    const normalizedLine = normalize(line);
    return keywords.some(word => normalizedLine.includes(word));
  };
}

function isValidKeywords(keywords: unknown): keywords is string[] {
  return (
    Array.isArray(keywords) &&
    keywords.length > 0 &&
    keywords.every(word => typeof word === "string" && word.length > 0)
  );
}
