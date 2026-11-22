import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from "smartDocKb";

export async function tempFolder(t, prefix = "kb-") {
  const root = await mkdtemp(join(tmpdir(), prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

/** A one-section, one-page document whose section ID is 5 (no sections when empty). */
export function makeDocument(documentId, originalFileName, title, markdown, extra = {}) {
  const description = { summary: title, shortDescription: title, keywords: [] };
  const lineCount = markdown ? markdown.split("\n").length : 0;
  if (!lineCount) {
    return { markdown, pages: [{ pageNumber: 1 }], map: { documentId, originalFileName, lineCount, ...description, ...extra, sections: [] } };
  }
  return {
    markdown,
    pages: [{ pageNumber: 1, fromLine: 1, toLine: lineCount }],
    map: {
      documentId, originalFileName, lineCount, ...description, ...extra,
      sections: [{ sectionId: 5, order: 1, title, fromLine: 1, toLine: lineCount, tokens: 6, totalTokens: 6, ...description }],
    },
  };
}

export async function openStore(t, options = {}) {
  const root = options.root ?? await tempFolder(t, "kb-store-");
  const store = await createPosixStore({ ...options, root });
  t.after(() => store.close());
  return store;
}

/** A manager over a new temporary store that already contains `documents`. */
export async function openKb(t, documents = [], options = {}) {
  const root = await tempFolder(t, "kb-manager-");
  const store = await openStore(t, { root });
  for (const doc of documents) await store.add(doc);
  const engine = await POSIXSearchEngine.open({ root });
  t.after(() => engine.close());
  return KbSmartManager.open(store, engine, options);
}

/** Deterministic embeddings: one dimension per word of the vocabulary. */
export function fakeEmbeddings(vocabulary) {
  const embed = text => {
    const words = text.toLowerCase().split(/\W+/);
    const vector = vocabulary.map(word => words.filter(item => item === word).length);
    return vector.some(Boolean) ? vector : vocabulary.map(() => 0.001);
  };
  return {
    calls: [],
    async embedDocuments(texts) { this.calls.push(texts); return texts.map(embed); },
    async embedQuery(text) { return embed(text); },
  };
}
