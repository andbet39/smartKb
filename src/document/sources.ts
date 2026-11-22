import type {
  DocumentPage,
  DocumentSection,
  DocumentSource,
  DocumentTableOfContents,
  PassageSource,
  SectionSource,
  ParsedDocument,
} from "./types.ts";

// Builders for the citation sources returned by the KB tools.
// They only need the map and the pages, never the Markdown.

export function buildDocumentSource({ map }: Omit<ParsedDocument, "markdown">): DocumentSource {
  return {
    documentId: map.documentId,
    ...(map.originalFileName !== undefined && { originalFileName: map.originalFileName }),
    ...(map.title !== undefined && { title: map.title }),
  };
}

export function buildPassageSource(
  doc: Omit<ParsedDocument, "markdown">,
  fromLine: number,
  toLine: number,
  section?: DocumentSection,
): PassageSource {
  const containing = section ?? doc.map.sections.find(item => item.fromLine <= fromLine && toLine <= item.toLine);
  return {
    ...buildDocumentSource(doc),
    fromLine,
    toLine,
    pages: computePageSpans(doc.pages, fromLine, toLine),
    ...(containing && { sectionId: containing.sectionId, sectionTitle: containing.title }),
  };
}

export function buildSectionSource(doc: Omit<ParsedDocument, "markdown">, section: DocumentSection): SectionSource {
  return {
    ...buildPassageSource(doc, section.fromLine, section.toLine, section),
    sectionId: section.sectionId,
    sectionTitle: section.title,
  };
}

export function buildTableOfContents(doc: Omit<ParsedDocument, "markdown">): DocumentTableOfContents {
  return {
    source: buildDocumentSource(doc),
    shortDescription: doc.map.shortDescription,
    sections: doc.map.sections.map(section => ({
      source: buildSectionSource(doc, section),
      shortDescription: section.shortDescription,
    })),
  };
}

export function findSection(doc: Omit<ParsedDocument, "markdown">, sectionId: number): DocumentSection {
  const section = doc.map.sections.find(item => item.sectionId === sectionId);
  if (!section) {
    throw new Error(`Unknown section ${sectionId} in document ${doc.map.documentId}`);
  }
  return section;
}

/** Pages that overlap the range, clipped to it. A section's page range can include blank pages. */
function computePageSpans(
  pages: readonly DocumentPage[] | undefined,
  fromLine: number,
  toLine: number,
): Required<DocumentPage>[] | null {
  if (!pages) return null;
  return pages.flatMap(page => {
    if (page.fromLine === undefined || page.toLine === undefined) return [];
    const start = Math.max(fromLine, page.fromLine);
    const end = Math.min(toLine, page.toLine);
    return start <= end ? [{ pageNumber: page.pageNumber, fromLine: start, toLine: end }] : [];
  });
}
