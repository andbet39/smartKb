import type { CanonicalMetadata, DocumentSection, MarkdownPage } from '../contracts/types.js';

export type Section = Omit<DocumentSection, 'sectionId' | 'order' | 'shortDescription' | 'keywords'> &
  Partial<Pick<DocumentSection, 'shortDescription' | 'keywords'>>;
export type ExtractedText = { text: string; pages?: MarkdownPage[] };

/** Analyzes the exact normalized text that the reader will serve. */
export interface SectionAnalyzer {
  analyze(extracted: ExtractedText): Promise<Section[]>;
  analyzeMetadata?(extracted: ExtractedText): Promise<CanonicalMetadata>;
}