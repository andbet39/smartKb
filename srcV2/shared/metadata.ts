import type { CanonicalMetadata, DocumentInfo, DocumentSourceInfo } from '../contracts/types.js';

export function serializeMetadata(metadata: CanonicalMetadata): string {
  return JSON.stringify({
    title: metadata.title, author: metadata.author,
    createdAt: metadata.createdAt?.toISOString(), modifiedAt: metadata.modifiedAt?.toISOString(),
    tags: metadata.tags,
  });
}

export function sourceInfo({ originalFileName, contentType }: DocumentSourceInfo): DocumentSourceInfo {
  return { ...(originalFileName !== undefined && { originalFileName }), ...(contentType !== undefined && { contentType }) };
}

export function sourceFingerprint(info: DocumentInfo): string {
  return JSON.stringify([info.sha, info.originalFileName, info.contentType]);
}

export function parseMetadata(json: string): CanonicalMetadata {
  const { createdAt, modifiedAt, ...fields } = JSON.parse(json);
  return {
    ...fields,
    ...(createdAt !== undefined && { createdAt: new Date(createdAt) }),
    ...(modifiedAt !== undefined && { modifiedAt: new Date(modifiedAt) }),
  };
}