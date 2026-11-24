import { KbError } from '../../contracts/errors.js';
import type { DocumentFields, DocumentSourceInfo, Filter } from '../../contracts/types.js';

type SearchableMetadata = DocumentFields & DocumentSourceInfo;

export function compileFilter(filter?: Filter): (metadata: SearchableMetadata) => boolean {
  const criteria = Object.entries(filter ?? {}).map(([field, criterion]) => compileCriterion(field, criterion));
  return metadata => criteria.every(matches => matches(metadata));
}

function compileCriterion(field: string, criterion: unknown): (metadata: SearchableMetadata) => boolean {
  switch (field) {
    case 'title': case 'author': case 'contentType': case 'originalFileName': case 'tags': {
      const values = Array.isArray(criterion) ? criterion : [criterion];
      if (!values.every(value => typeof value === 'string')) throw unsupported(field);
      return metadata => {
        const actual = metadata[field];
        return Array.isArray(actual) ? actual.some(tag => values.includes(tag)) :
          actual !== undefined && values.includes(actual);
      };
    }
    case 'createdAt': case 'modifiedAt': {
      if (criterion instanceof Date) {
        const expected = timestamp(criterion, field);
        return metadata => metadata[field]?.getTime() === expected;
      }
      if (!criterion || typeof criterion !== 'object' || Array.isArray(criterion)) throw unsupported(field);
      const range = criterion as Record<string, unknown>;
      const keys = Object.keys(range);
      if (!keys.length || keys.some(key => key !== 'gte' && key !== 'lte')) throw unsupported(field);
      const min = 'gte' in range ? timestamp(range.gte, field) : -Infinity;
      const max = 'lte' in range ? timestamp(range.lte, field) : Infinity;
      return metadata => {
        const actual = metadata[field]?.getTime();
        return actual !== undefined && actual >= min && actual <= max;
      };
    }
    default: throw unsupported(field);
  }
}

function timestamp(value: unknown, field: string): number {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) throw unsupported(field);
  return value.getTime();
}

function unsupported(field: string): KbError {
  return new KbError('unsupported_filter', `Unsupported filter on ${field}`);
}