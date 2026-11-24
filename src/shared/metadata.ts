import type { DocumentFields, DocumentInfo, DocumentSourceInfo } from '../contracts/types.js';

export function documentFields({ title, author, createdAt, modifiedAt, tags }: DocumentFields): DocumentFields {
  return {
    ...(title !== undefined && { title }), ...(author !== undefined && { author }),
    ...(createdAt !== undefined && { createdAt }), ...(modifiedAt !== undefined && { modifiedAt }),
    ...(tags !== undefined && { tags }),
  };
}

export function documentMetadata(info: DocumentInfo, fields: DocumentFields): DocumentInfo & DocumentFields {
  return { ...info, ...documentFields(fields) };
}

export function sourceInfo({ originalFileName, contentType }: DocumentSourceInfo): DocumentSourceInfo {
  return { ...(originalFileName !== undefined && { originalFileName }), ...(contentType !== undefined && { contentType }) };
}

export function sourceFingerprint(info: DocumentInfo): string {
  return JSON.stringify([info.sha, info.originalFileName, info.contentType]);
}
