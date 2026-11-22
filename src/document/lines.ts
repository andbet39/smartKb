// Line helpers for canonical Markdown (LF separated, no trailing newline).

export function splitLines(markdown: string): string[] {
  return markdown ? markdown.split("\n") : [];
}

/** Joins lines `fromLine` through `toLine` (1-based, inclusive). */
export function sliceLines(lines: readonly string[], fromLine: number, toLine: number): string {
  return lines.slice(fromLine - 1, toLine).join("\n");
}

export function normalizeMarkdown(text: string): string {
  return text.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
}
