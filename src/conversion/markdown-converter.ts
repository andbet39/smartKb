import { toMarkdown } from '../services/document-to-markdown/index.js';
import type { MarkdownConverter } from '../contracts/interfaces.js';
import type { MarkdownPage } from '../contracts/types.js';

export const documentMarkdownConverter: MarkdownConverter = {
  async convert(body, contentType, onProgress) {
    let pages: MarkdownPage[] | undefined;
    const markdown = await toMarkdown(body, { contentType, onProgress, onPages: value => { pages = value; } });
    return { markdown, pages };
  },
};
