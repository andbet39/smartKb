import type { ExtractedText, Section, SectionAnalyzer } from './types.js';
import { splitLines } from '../shared/markdown.js';

const MAX_SECTION_LINES = 80;

/** Deterministic fallback; a model-backed analyzer can be supplied at composition. */
export class MarkdownSectionAnalyzer implements SectionAnalyzer {
  async analyze(extracted: ExtractedText): Promise<Section[]> {
    const lines = splitLines(extracted.text);
    const sections: Section[] = [];
    let start = 0;
    let title = '';
    let fence: { char: string; length: number } | undefined;
    for (const [index, line] of lines.entries()) {
      const marker = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      const heading = !fence && /^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
      if (index > start && (heading || (!fence && index - start >= MAX_SECTION_LINES))) {
        sections.push(summarize(lines, start, index, title));
        start = index;
        title = '';
      }
      if (heading) title = heading[1];
      if (marker && !fence) fence = { char: marker[1][0], length: marker[1].length };
      else if (marker && fence && marker[1][0] === fence.char && marker[1].length >= fence.length && !marker[2].trim()) {
        fence = undefined;
      }
    }
    if (start < lines.length) sections.push(summarize(lines, start, lines.length, title));
    return sections;
  }
}

export function validateSections(sections: Section[], lineCount: number): void {
  let next = 1;
  for (const section of sections) {
    if (section.lineStart !== next || !Number.isSafeInteger(section.lineEnd) ||
        section.lineEnd < next || section.lineEnd > lineCount ||
        typeof section.title !== 'string' || typeof section.summary !== 'string') {
      throw new TypeError('Sections must cover the normalized text in contiguous, inclusive line ranges');
    }
    next = section.lineEnd + 1;
  }
  if (next !== lineCount + 1) throw new TypeError('Sections do not cover the whole document');
}

function summarize(lines: string[], start: number, end: number, title: string): Section {
  const summary = lines.slice(start + (title ? 1 : 0), end).join(' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  return { title, summary, lineStart: start + 1, lineEnd: end };
}