import { createLlmIngestionEngine } from '../dist/index.js';

// Offline provider used only by store, search and CLI integration tests.
export const ingestionEngine = createLlmIngestionEngine({
  withStructuredOutput(_schema, { name }) {
    return { async invoke(messages) {
      const text = messages[1].content;
      if (name === 'document_metadata') {
        return { title: /^# (.+)/.exec(text)?.[1] ?? null, author: null, createdAt: null, modifiedAt: null, tags: [] };
      }
      const sections = [];
      for (const row of text.split('\n').slice(1)) {
        const [, n, line] = /^(\d+): (.*)$/.exec(row);
        if (!sections.length || line.startsWith('# ')) {
          sections.push({ lineStart: Number(n), title: line.replace(/^# /, ''), summary: '', shortDescription: '', keywords: ['fixture'] });
        }
        const section = sections.at(-1);
        section.lineEnd = Number(n);
        if (!line.startsWith('# ')) section.summary = `${section.summary} ${line}`.trim();
      }
      return { sections };
    } };
  },
});
