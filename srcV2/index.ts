export type { DocumentMapStore, IndexEngine, Indexer, Ingestor, KnowledgeBase,
  KnowledgeBaseDeps, MarkdownConverter, ObjectStore, SearchBackend, SearchEngine } from './contracts/interfaces.js';
export type { BackendFactory, CanonicalMetadata, ConvertedMarkdown, Document, DocumentId, DocumentInfo, DocumentMap, DocumentPage,
  DocumentSection, DocumentSectionContent, DocumentSectionOverview, DocumentSourceInfo, Filter, Hit, IndexMatch, IndexSearchOptions,
  IndexSearchResult, IndexStatus, KbErrorCode, LineRange, MarkdownPage, Passage, PreparedDocument, SearchOptions, SearchResult,
  SemanticIndexSearchOptions } from './contracts/types.js';
export { KbError } from './contracts/errors.js';
export { DefaultKnowledgeBase } from './core/knowledge-base.js';
export { LocalObjectStore } from './stores/local/object-store.js';
export { MarkdownIngestor } from './ingestion/markdown-ingestor.js';
export { mapBackend } from './backends/map/factory.js';
export type { Embedder, ManagedMapBackend } from './backends/map/interfaces.js';
export type { MapBackendConfig } from './backends/map/types.js';
export type { ExtractedText, Section, SectionAnalyzer } from './ingestion/types.js';
export { openLocalKnowledgeBase } from './composition/local-knowledge-base.js';
export type { LocalKnowledgeBase, LocalKnowledgeBaseConfig } from './composition/types.js';