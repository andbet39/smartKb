import { createHash } from 'node:crypto';
import type { Ingestor } from '../contracts/interfaces.js';
import type { DocumentMap, MarkdownPage } from '../contracts/types.js';
import { MarkdownSectionAnalyzer, validateSections } from './analysis.js';
import { splitLines } from '../shared/markdown.js';
import type { SectionAnalyzer } from './types.js';

export class MarkdownIngestor implements Ingestor {
  constructor(private readonly analyzer: SectionAnalyzer = new MarkdownSectionAnalyzer()) {}

  async ingest(markdown: string, context?: { pages?: MarkdownPage[] }): Promise<DocumentMap> {
    const lines = splitLines(markdown);
    const lineCount = lines.length;
    const extracted = { text: markdown, pages: context?.pages };
    const sections = await this.analyzer.analyze(extracted);
    validateSections(sections, lineCount);
    const title = /^ {0,3}#\s+(.+?)\s*#*$/.exec(lines.find(line => line.trim()) ?? '')?.[1];
    const metadata = (markdown.trim() ? await this.analyzer.analyzeMetadata?.(extracted) : undefined) ?? (title ? { title } : {});
    return {
      metadata,
      markdownSha: createHash('sha256').update(markdown).digest('hex'), lineCount,
      sections: sections.map((section, index) => ({
        ...section,
        sectionId: index + 1,
        order: index + 1,
        shortDescription: section.shortDescription ?? section.summary,
        keywords: normalizeKeywords(section.keywords ?? extractKeywords(lines, section.lineStart, section.lineEnd)),
      })),
    };
  }
}

const STOP_WORDS = new Set('that this these those with from have will were been which their there about della delle dello degli nella nelle nello sono come alla alle anche essere questo questa questi queste quando quale quali quindi'.split(' '));

function extractKeywords(lines: string[], start: number, end: number): string[] {
  const counts = new Map<string, number>();
  for (const word of lines.slice(start - 1, end).join('\n').toLowerCase().matchAll(/\p{L}[\p{L}\p{M}\p{N}]{3,}/gu)) {
    const term = word[0];
    if (!STOP_WORDS.has(term)) counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([term]) => term);
}

function normalizeKeywords(terms: string[]): string[] {
  const unique = new Map<string, string>();
  for (const term of terms) {
    if (typeof term !== 'string') throw new TypeError('Expected keyword strings');
    const value = term.trim();
    const key = value.toLowerCase();
    if (value && !unique.has(key)) unique.set(key, value);
  }
  return [...unique.values()];
}