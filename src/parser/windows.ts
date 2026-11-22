import type { DocumentInput, ParserOptions } from "./types.ts";

const DEFAULT_WINDOW_TOKENS = 4096;
const CONTEXT_LINE_COUNT = 3;

export interface DocumentWindow {
  start: number;
  end: number;
  payload: string;
}

export function* windows(
  lines: string[],
  size: DocumentInput["sectionSize"],
  options: ParserOptions,
): Generator<DocumentWindow> {
  const suggestedEnds = findSuggestedSectionEnds(lines, size);
  const numbered = formatNumberedLines(lines, suggestedEnds);
  const budget = options.windowTokens ?? DEFAULT_WINDOW_TOKENS;

  let start = 0;
  while (start < lines.length) {
    const window = buildNextWindow(numbered, start, budget, options.countTokens);
    yield window;
    start = window.end;
  }
}

function buildNextWindow(
  numbered: readonly string[],
  start: number,
  budget: number,
  countTokens: ParserOptions["countTokens"],
): DocumentWindow {
  const context = buildContextHeader(numbered, start, budget, countTokens);
  let payload = "";
  let end = start;

  while (end < numbered.length) {
    const candidate = payload ? `${payload}\n${numbered[end]}` : context + numbered[end];
    if (countTokens(candidate) > budget) break;
    payload = candidate;
    end++;
  }

  if (end === start) {
    throw new Error(`Line ${start + 1} exceeds the window token budget`);
  }
  return { start: start + 1, end, payload };
}

function buildContextHeader(
  numbered: readonly string[],
  start: number,
  budget: number,
  countTokens: ParserOptions["countTokens"],
): string {
  const previous = numbered.slice(Math.max(0, start - CONTEXT_LINE_COUNT), start).join("\n");
  if (!previous) return "";
  const header = `Context only:\n${previous}\nAssigned:\n`;
  return countTokens(header + numbered[start]) <= budget ? header : "";
}

function formatNumberedLines(lines: readonly string[], suggestedEnds: ReadonlySet<number>): string[] {
  return lines.map((line, index) => {
    const lineNumber = index + 1;
    const marker = suggestedEnds.has(lineNumber) ? "*" : "";
    return `${lineNumber}${marker} | ${line}`;
  });
}

function findSuggestedSectionEnds(lines: readonly string[], size: DocumentInput["sectionSize"]): Set<number> {
  const ends = new Set<number>();
  if (!size) return ends;

  let chars = 0;
  let fence = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    chars += line.length + (chars ? 1 : 0);
    fence = updateFenceState(line, fence);
    if (fence || chars < size.minChars) continue;

    const nextLine = lines[i + 1] ?? "";
    if (canEndSectionAfterLine(line, nextLine, chars, size.maxChars)) {
      ends.add(i + 1);
      chars = 0;
    }
  }
  return ends;
}

function updateFenceState(line: string, currentFence: string): string {
  const marker = line.trimStart().match(/^(`{3,}|~{3,})/)?.[0];
  if (marker && !currentFence) return marker;
  if (currentFence && marker?.startsWith(currentFence) && line.trim() === marker) return "";
  return currentFence;
}

function canEndSectionAfterLine(line: string, nextLine: string, chars: number, maxChars: number): boolean {
  const insideTable = line.includes("|") && nextLine.includes("|");
  if (insideTable) return false;
  return !nextLine.trim() || /^#{1,6} /.test(nextLine) || chars >= maxChars;
}
