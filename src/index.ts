export type { DocumentStore, IndexEngine, IngestionEngine, KnowledgeBase, KnowledgeBaseComposition,
  MarkdownConverter, ObjectStore, SearchEngine } from './contracts/interfaces.js';
export type { DocumentFields, ConvertedMarkdown, Document, DocumentId, DocumentInfo, DocumentMap, DocumentPage,
  DocumentSection, DocumentSectionContent, DocumentSectionOverview, DocumentSourceInfo, DocumentToc, Filter, Hit, IndexMatch, IndexSearchOptions,
  IndexSearchResult, IndexStatus, KbErrorCode, LineRange, MarkdownPage, Passage, DocumentArtifacts, SearchOptions, SearchResult,
  ProgressReporter, ProgressUpdate, SemanticIndexSearchOptions } from './contracts/types.js';
export { KbError } from './contracts/errors.js';
export { toMarkdown, type ConversionOptions } from './services/document-to-markdown/index.js';
export { DefaultKnowledgeBase } from './knowledge-base/knowledge-base.js';
export { LocalObjectStore } from './object-store/local-object-store.js';
export { DocumentMapStore } from './document-store/document-map-store.js';
export { createLlmIngestionEngine } from './ingestion/llm-ingestor.js';
export { mapBackend } from './indexing/map/factory.js';
export type { Embedder, ManagedMapBackend } from './indexing/map/interfaces.js';
export type { MapBackendConfig } from './indexing/map/types.js';
export { composeKnowledgeBase } from './composition/knowledge-base.js';
export type { ComposeKnowledgeBaseConfig, ManagedKnowledgeBase, LocalKnowledgeBase,
  LocalKnowledgeBaseConfig } from './composition/types.js';
export { openLocalKnowledgeBase } from './composition/local-knowledge-base.js';