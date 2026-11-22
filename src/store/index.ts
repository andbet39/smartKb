export { KbStoreError } from "./errors.ts";
export type { KbStore } from "./interfaces.ts";
export { createPosixStore, type PosixSemanticOptions, type PosixStoreOptions } from "./posix/index.ts";
export type {
  CatalogPage,
  CatalogQuery,
  DocumentCard,
  KbStoreErrorCode,
} from "./types.ts";
