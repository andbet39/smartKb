// Public API. Everything not listed here is internal.

// Document data types
export type {
  DocumentId,
  DocumentMap,
  DocumentPage,
  DocumentSection,
  DocumentSource,
  DocumentTableOfContents,
  ParsedDocument,
  PassageSource,
  SectionSource,
} from "./document/types.ts";

// Parser: file → ParsedDocument, independent of any store
export {
  convertDocument,
  createDocumentParser,
  getDocumentTableOfContents,
  getSectionMarkdown,
  saveDocumentMarkdown,
  type LocalConversionProgress,
} from "./parser/index.ts";
export { DocumentParseError } from "./parser/errors.ts";
export type { DocumentParser } from "./parser/interfaces.ts";
// Narrow a progress event with its `phase`, e.g. Extract<DocumentParseProgress, { phase: "conversion" }>.
export type { DocumentInput, DocumentParseProgress, ParserOptions } from "./parser/types.ts";

// Store: persistence and catalog
export * from "./store/index.ts";

export * from "./search/index.ts";

// KB manager: kb* methods, LangChain tools and the search agent
export * from "./kb/index.ts";
