import type { DocumentInput, ParserOptions } from "./types.js";

function suggestedEnds(lines: string[], size: DocumentInput["sectionSize"]) {
  const ends = new Set<number>();
  if (!size) return ends;
  let chars = 0;
  let fence = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    chars += line.length + (chars ? 1 : 0);
    const marker = line.trimStart().match(/^(`{3,}|~{3,})/)?.[0];
    if (marker && !fence) fence = marker;
    else if (marker?.startsWith(fence) && line.trim() === marker) fence = "";
    if (fence || chars < size.minChars) continue;
    const next = lines[i + 1] ?? "";
    const insideTable = line.includes("|") && next.includes("|");
    if (!insideTable && (!next.trim() || /^#{1,6} /.test(next) || chars >= size.maxChars)) {
      ends.add(i + 1);
      chars = 0;
    }
  }
  return ends;
}

export function* windows(lines: string[], size: DocumentInput["sectionSize"], options: ParserOptions) {
  const ends = suggestedEnds(lines, size);
  const numbered = lines.map((line, i) => `${i + 1}${ends.has(i + 1) ? "*" : ""} | ${line}`);
  const budget = options.windowTokens ?? 4096;
  let start = 0;
  while (start < lines.length) {
    const previous = numbered.slice(Math.max(0, start - 3), start).join("\n");
    let context = previous ? `Context only:\n${previous}\nAssigned:\n` : "";
    if (options.countTokens(context + numbered[start]) > budget) context = "";
    let payload = "";
    let end = start;
    while (end < lines.length) {
      const candidate = payload ? `${payload}\n${numbered[end]}` : context + numbered[end];
      if (options.countTokens(candidate) > budget) break;
      payload = candidate;
      end++;
    }
    if (end === start) throw new Error(`Line ${start + 1} exceeds the window token budget`);
    yield { start: start + 1, end, payload };
    start = end;
  }
}
