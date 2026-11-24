import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import { z } from 'zod';
import type { KnowledgeBase } from '../contracts/interfaces.js';

const id = z.string().min(1);
const positive = z.number().int().positive();
const sectionInput = z.strictObject({
  documentId: id.describe('Document ID from the table of contents'),
  sectionId: positive.describe('Numeric section ID from the table of contents, not its position'),
});
const terms = z.union([z.string(), z.array(z.string())]).optional();
const instant = z.iso.datetime({ offset: true });
const date = z.union([instant, z.strictObject({ gte: instant.optional(), lte: instant.optional() })]).optional();
const filter = z.strictObject({
  title: terms, author: terms, tags: terms, originalFileName: terms, contentType: terms,
  createdAt: date, modifiedAt: date,
});
const options = z.strictObject({ topK: positive.optional(), filter: filter.optional() });
const search = z.strictObject({ text: z.string().min(1), opts: options.optional() });

function dateCriterion(value: Exclude<z.infer<typeof date>, undefined>) {
  return typeof value === 'string' ? new Date(value) : {
    ...(value.gte !== undefined && { gte: new Date(value.gte) }),
    ...(value.lte !== undefined && { lte: new Date(value.lte) }),
  };
}

function searchOptions(opts?: z.infer<typeof options>) {
  if (!opts?.filter) return opts;
  const { createdAt, modifiedAt, ...fields } = opts.filter;
  return { ...opts, filter: { ...fields,
    ...(createdAt !== undefined && { createdAt: dateCriterion(createdAt) }),
    ...(modifiedAt !== undefined && { modifiedAt: dateCriterion(modifiedAt) }),
  } };
}

export function createLangchainTools(kb: KnowledgeBase, { semantic = true } = {}): StructuredToolInterface[] {
  const toolName = (operation: string) => `${kb.id}_${operation}`;
  const context = `Knowledge base: ${kb.name}.${kb.description ? ` ${kb.description}` : ''}`;
  const metadata = (operation: string, description: string) => ({
    name: toolName(operation), description: `${description} ${context}`,
  });
  const sectionNotFound = `Section not found. Use ${toolName('getDocumentsToc')} to check the document and section IDs.`;
  const tools: StructuredToolInterface[] = [
    tool(({ idPrefix, cursor }) => kb.list(idPrefix, cursor), {
      ...metadata('list', 'List document IDs by optional prefix. Pass the returned nextCursor to continue.'),
      schema: z.strictObject({ idPrefix: z.string().optional(), cursor: z.string().optional() }),
    }),
    tool(({ documentId, lines }) => kb.read(documentId, lines), {
      ...metadata('read', 'Read document Markdown, optionally restricted to a one-based inclusive line range.'),
      schema: z.strictObject({ documentId: id, lines: z.strictObject({ start: positive, end: positive }).optional() }),
    }),
    tool(async ({ documentId, sectionId }) => {
      const section = await kb.documentStore.readDocumentSection(documentId, sectionId);
      return section ? { documentId, ...section } : sectionNotFound;
    }, {
      ...metadata('readSection', 'Read verbatim Markdown and line coordinates for a section identified in a document table of contents.'),
      schema: sectionInput,
    }),
    tool(async ({ documentId, sectionId }) => {
      const map = await kb.documentStore.readDocumentMap(documentId);
      const section = map?.sections.find(section => section.sectionId === sectionId);
      if (!section) return sectionNotFound;
      const { title, summary, lineStart, lineEnd } = section;
      return { documentId, sectionId, title, summary, lineStart, lineEnd };
    }, {
      ...metadata('readSectionSummary', 'Read the stored summary and line coordinates for a section without returning its source Markdown.'),
      schema: sectionInput,
    }),
    tool(({ documentIds }) => kb.getDocumentsToc(documentIds), {
      ...metadata('getDocumentsToc', 'Get complete tables of contents for one or more document IDs.'),
      schema: z.strictObject({ documentIds: z.union([id, z.array(id)]) }),
    }),
    tool(({ mode = 'keyword', text, opts }) => kb.searchDocumentsToc(mode, text, searchOptions(opts)), {
      ...metadata('searchDocumentsToc', 'Return complete tables of contents of matching documents in relevance order. Omit mode for keyword search.'),
      schema: search.extend({ mode: (semantic ? z.enum(['keyword', 'semantic']) : z.enum(['keyword'])).optional() }),
    }),
    tool(({ text, opts }) => kb.searchKeyword(text, searchOptions(opts)), {
      ...metadata('searchKeyword', 'Find documents and matching passages by keyword.'), schema: search,
    }),
  ];
  if (semantic) tools.push(tool(({ text, opts }) => kb.searchSemantic(text, searchOptions(opts)), {
    ...metadata('searchSemantic', 'Find documents and passages by meaning. Requires semantic search support.'), schema: search,
  }));
  return tools;
}
