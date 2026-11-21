import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { createDocumentParser, getDocumentTableOfContents, getSectionMarkdown, load, persist, saveDocumentMarkdown } from "../dist/index.js";
import { offlineAzure } from "./azure-model.mjs";
import { KbSmartManager } from "workspace-document-parser/kb";

const countTokens = text => text.length;
const csv = { documentId: 1, bytes: Buffer.from("name,price\nBook,10"), fileName: "prices.csv" };

test("persist and load preserve raw Markdown, full metadata and optional pages", async t => {
  const dir = await mkdtemp(join(tmpdir(), "document-persist-"));
  t.after(() => rm(dir, { recursive: true }));
  const folder = join(dir, "archivio", "manuale");
  const description = { summary: "Il manuale", short_description: "Guida", keywords: ["uso"] };
  const doc = {
    markdown: "# Manuale\n\nCittà",
    pages: [{ page: 1, range: [1, 2] }, { page: 2, range: null }, { page: 3, range: [3, 3] }],
    map: { documentId: 42, lineCount: 3, ...description, sections: [
      { id: 1, order: 1, title: "Manuale", range: [1, 3], pageRange: [1, 3], tokens: 6, totalTokens: 6, ...description },
    ] },
  };
  await persist(doc, folder);
  assert.equal(await readFile(join(folder, "document.md"), "utf8"), doc.markdown);
  assert.deepEqual(await load(folder), doc);

  const empty = { markdown: "", map: { ...doc.map, lineCount: 0, sections: [] } };
  await persist(empty, folder);
  assert.deepEqual(await load(folder), empty);
});

test("persist uses the original filename for Markdown and metadata", async t => {
  const dir = await mkdtemp(join(tmpdir(), "document-named-persist-"));
  t.after(() => rm(dir, { recursive: true }));
  const folder = join(dir, "manuale");
  const doc = {
    markdown: "# Manuale",
    map: {
      documentId: 7, originalFileName: "manuale.pdf", lineCount: 1,
      summary: "Manuale", short_description: "Guida", keywords: [], sections: [],
    },
  };

  await persist(doc, folder);

  assert.equal(await readFile(join(folder, "manuale.pdf.md"), "utf8"), doc.markdown);
  assert.deepEqual(JSON.parse(await readFile(join(folder, "manuale.pdf.json"), "utf8")), { map: doc.map });
  assert.deepEqual(await load(folder), doc);
});

test("Markdown export marks physical pages, including empty ones, but not unpaginated text", async t => {
  const dir = await mkdtemp(join(tmpdir(), "document-export-"));
  t.after(() => rm(dir, { recursive: true }));
  const path = join(dir, "export.md");
  const markdown = "# Titolo\n\nPrima riga\nCittà";
  const doc = { markdown, pages: [{ page: 1, range: [1, 3] }, { page: 2, range: null }, { page: 3, range: [4, 4] }] };
  await saveDocumentMarkdown(doc, path);
  assert.equal(await readFile(path, "utf8"), [
    "<!--------------- PAGE 1 ---------------->", "# Titolo", "", "Prima riga",
    "<!--------------- PAGE 2 ---------------->", "<!--------------- PAGE 3 ---------------->", "Città",
  ].join("\n"));
  assert.equal(doc.markdown, markdown);
  await saveDocumentMarkdown({ markdown }, path);
  assert.equal(await readFile(path, "utf8"), markdown);
});

test("Markdown export inserts each optional section marker only at its original start line", async t => {
  const dir = await mkdtemp(join(tmpdir(), "section-export-"));
  t.after(() => rm(dir, { recursive: true }));
  const path = join(dir, "export.md");
  const doc = {
    markdown: "Intro\nTerms\nMore terms",
    map: { sections: [{ id: 1, range: [1, 1] }, { id: 2, range: [2, 3] }] },
  };
  const first = "<!--------------- SECTION 1 --------------->\nIntro";
  const second = "<!--------------- SECTION 2 --------------->\nTerms";
  await saveDocumentMarkdown(doc, path, { sectionMarkers: true });
  assert.equal(await readFile(path, "utf8"), [first, second, "More terms"].join("\n"));

  doc.pages = [{ page: 1, range: [1, 2] }, { page: 2, range: [3, 3] }];
  await saveDocumentMarkdown(doc, path, { sectionMarkers: true });
  assert.equal(await readFile(path, "utf8"), [
    "<!--------------- PAGE 1 ---------------->", first, second,
    "<!--------------- PAGE 2 ---------------->", "More terms",
  ].join("\n"));
});
const section = (startLine, endLine, summary = "Returns") => ({
  title: "Returns", startLine, endLine, summary, short_description: "Resi", keywords: ["returns"],
});

test("physical pages survive a blank page, a cross-page section and JSON round trip", async t => {
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText("Introduction\nFirst condition", { lineHeight: 55 });
  pdf.addPage();
  pdf.addPage().drawText("Second condition");
  const parser = createDocumentParser({
    countTokens,
    llm: offlineAzure((name, messages) => {
      if (name === "summarize_document") return { summary: "Overview", short_description: "Introduzione e condizioni", keywords: [] };
      const end = Number(messages[0].content.match(/through (\d+)/)[1]);
      return { continuesPrevious: false, sections: [
        { ...section(1, 1), title: "Introduction", short_description: "Contesto" },
        section(2, end),
      ] };
    }),
  });
  const bytes = await pdf.save();
  const doc = JSON.parse(JSON.stringify(await parser.parseDocument({
    bytes, documentId: 4, fileName: "uploads\\Manuale originale.pdf",
  })));
  assert.deepEqual(doc.pages[1], { page: 2, range: null });
  const selected = doc.map.sections[1];
  assert.deepEqual(selected.pageRange, [1, 3]);
  assert.equal(selected.totalTokens, countTokens(doc.markdown));
  assert.equal(selected.tokens, countTokens(getSectionMarkdown(doc, selected.id)));
  const tagged = getSectionMarkdown(doc, selected.id, { pageTags: true });
  assert.match(tagged, /^<!-- page: 1 -->[\s\S]*First condition[\s\S]*<!-- page: 3 -->\n[^\n]*Second condition/);
  assert.doesNotMatch(doc.markdown, /<!-- page:/);
  assert.deepEqual(getDocumentTableOfContents(doc), {
    documentId: 4, short_description: "Introduzione e condizioni",
    sections: [
      { id: 1, title: "Introduction", short_description: "Contesto" },
      { id: 2, title: "Returns", short_description: "Resi" },
    ],
  });

  const root = await mkdtemp(join(tmpdir(), "document-kb-"));
  t.after(() => rm(root, { recursive: true }));
  await persist(doc, join(root, "archivio", "manuale"));
  const kb = await KbSmartManager.open(root);
  const fileSource = { documentId: 4, originalFileName: "Manuale originale.pdf" };
  assert.deepEqual((await kb.kbGetTableOfContents()).documents[0].source, fileSource);
  assert.deepEqual((await kb.kbFileGetInfo(4)).source, fileSource);
  assert.deepEqual((await kb.kbFileReadSummary(4)).source, fileSource);
  assert.equal((await kb.kbFileRead(4)).markdown, doc.markdown);

  const passage = await kb.kbFileReadSection(4, selected.id);
  const toc = await kb.kbFileGetTableOfContents(4);
  assert.deepEqual(toc.sections[1].source, passage.source);
  assert.equal(passage.markdown, getSectionMarkdown(doc, selected.id));
  assert.deepEqual(passage.source.pages, [
    { pageNumber: 1, fromLine: selected.range[0], toLine: doc.pages[0].range[1] },
    { pageNumber: 3, fromLine: doc.pages[2].range[0], toLine: selected.range[1] },
  ]);
  const { matches } = await kb.kbFileSearchByKeywords(
    { kind: "keywords", keywords: ["SECOND", "Second condition"] }, { documentIds: [4] },
  );
  assert.equal(matches.length, 1);
  const { source, snippet } = matches[0];
  assert.equal(source.originalFileName, fileSource.originalFileName);
  assert.equal(source.pages[0].pageNumber, 3);
  assert.deepEqual(await kb.kbFileReadSection(4, source.fromLine, source.toLine), { markdown: snippet, source });
  const tools = Object.fromEntries(kb.getTools().map(tool => [tool.name, tool]));
  assert.equal(Object.keys(tools).length, 7);
  const search = await tools.kbFileSearchByKeywords.invoke({
    query: { kind: "regex", pattern: "second condition" }, fileSpec: { documentIds: [4] },
  });
  assert.deepEqual(search.matches, matches);
  for (const [section, expected] of [
    [{ sectionId: selected.id }, passage],
    [{ fromLine: source.fromLine, toLine: source.toLine }, { markdown: snippet, source }],
  ]) {
    assert.deepEqual(await tools.kbFileReadSection.invoke({ documentId: 4, section }), expected);
  }
  await assert.rejects(kb.kbFileReadSection(4, 999), /Unknown section/);
  await assert.rejects(kb.kbFileReadSection(4, 0, 2), /Invalid line range/);
});

test("KB supports legacy maps, lazy text loading, filtered searches and explicit discovery errors", async t => {
  const root = await mkdtemp(join(tmpdir(), "kb-discovery-"));
  t.after(() => rm(root, { recursive: true }));
  const map = { documentId: 1, summary: "Overview", short_description: "Info", keywords: [], sections: [], lineCount: 0 };
  const empty = { map, markdown: "" };
  await persist(empty, root);
  const kb = await KbSmartManager.open(root);
  assert.deepEqual(await kb.kbFileRead(1), { markdown: "", source: { documentId: 1, originalFileName: null } });
  await rm(join(root, "document.md"));
  const other = join(root, "another");
  const doc = { markdown: "Art. 3\nArtX 3", map: { ...map, originalFileName: "Terms.txt", documentId: 2, lineCount: 2 } };
  await persist(doc, other);
  const catalog = await KbSmartManager.open(root);
  assert.equal((await catalog.kbGetTableOfContents()).documents.length, 2);
  await assert.rejects(catalog.kbFileRead(1), { code: "ENOENT" });
  const filter = { documentIds: [2] };
  const literal = await catalog.kbFileSearchByKeywords({ kind: "keywords", keywords: ["art."] }, filter);
  assert.deepEqual(literal.matches.map(hit => hit.snippet), ["Art. 3"]);
  assert.equal(literal.matches[0].source.pages, null);
  const regex = await catalog.kbFileSearchByKeywords({ kind: "regex", pattern: "^art. 3$" }, filter);
  assert.equal(regex.matches.length, 2);
  assert.deepEqual(await catalog.kbFileSearchByKeywords({ kind: "regex", pattern: "zz" }, filter), { matches: [] });
  await assert.rejects(catalog.kbFileSearchByKeywords({ kind: "regex", pattern: "[" }), SyntaxError);

  await persist({ ...doc, map: { ...doc.map, documentId: 3 } }, join(other, "homonym"));
  assert.equal((await (await KbSmartManager.open(root)).kbGetTableOfContents()).documents.length, 3);
  await persist(empty, other);
  await assert.rejects(KbSmartManager.open(root), /Duplicate document 1/);
  await persist({ ...empty, map: { ...map, lineCount: -1 } }, other);
  await assert.rejects(KbSmartManager.open(root), /Invalid metadata in .*another/);
});

test("KB discovers multiple source-named manifests in one folder", async t => {
  const root = await mkdtemp(join(tmpdir(), "kb-multiple-manifests-"));
  t.after(() => rm(root, { recursive: true }));
  const map = { summary: "Overview", short_description: "Info", keywords: [], sections: [], lineCount: 1 };
  await persist({
    markdown: "First document",
    map: { ...map, documentId: 1, originalFileName: "first.pdf" },
  }, root);
  await persist({
    markdown: "Second document",
    map: { ...map, documentId: 2, originalFileName: "second.pdf" },
  }, root);

  const kb = await KbSmartManager.open(root);
  assert.deepEqual((await kb.kbGetTableOfContents()).documents.map(doc => doc.source.documentId), [1, 2]);
  assert.equal((await kb.kbFileRead(1)).markdown, "First document");
  assert.equal((await kb.kbFileRead(2)).markdown, "Second document");
});

test("a blank document has an empty TOC and does not call the model", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const parser = createDocumentParser({ countTokens, llm: offlineAzure(() => assert.fail("Unexpected model call")) });
  const doc = await parser.parseDocument({ documentId: 7, bytes: await pdf.save() });
  assert.deepEqual(getDocumentTableOfContents(doc), { documentId: 7, short_description: "", sections: [] });
});

test("persistent gaps recover the whole window from its original text", async () => {
  const calls = [];
  let recoveredText;
  const parser = createDocumentParser({ countTokens, llm: offlineAzure((name, messages) => {
    calls.push(name);
    if (name === "summarize_section") {
      recoveredText = messages[1].content;
      return { summary: "Prezzi dei libri", short_description: "Prezzi", keywords: ["libri"] };
    }
    return { continuesPrevious: false, sections: [section(2, 3)] };
  }) });
  const doc = await parser.parseDocument(csv);
  assert.deepEqual(calls, ["chunk_document", "chunk_document", "summarize_section"]);
  assert.equal(recoveredText, doc.markdown);
  assert.deepEqual(doc.map.sections.map(s => s.range), [[1, 3]]);
  assert.equal(doc.map.sections[0].summary, "Prezzi dei libri");
});

test("windows merge without losing lines; merged summary sees all fragments", async () => {
  let windows = 0;
  const parser = createDocumentParser({
    countTokens, windowTokens: 230,
    llm: offlineAzure((name, messages) => {
      if (name === "summarize_section") {
        assert.match(messages[1].content, /part-1/);
        assert.match(messages[1].content, /part-2/);
        return { summary: "Combined", short_description: "All terms", keywords: ["all"] };
      }
      const [, start, end] = messages[0].content.match(/assigned lines (\d+) through (\d+)/);
      windows++;
      return { continuesPrevious: windows > 1, sections: [section(+start, +end, `part-${windows}`)] };
    }),
  });
  const bytes = Buffer.from("label,value\n" + ["a", "b", "c"].map(x => `${x},${x.repeat(75)}`).join("\n"));
  const doc = await parser.parseDocument({ ...csv, bytes, sectionSize: { minChars: 100, maxChars: 160 } });
  assert.ok(windows >= 2);
  assert.equal(doc.map.sections.length, 1);
  assert.equal(doc.map.sections[0].summary, "Combined");
  assert.equal(doc.map.sections[0].short_description, "All terms");
  assert.equal(doc.map.short_description, "All terms");
  assert.equal(getSectionMarkdown(doc, 1, { pageTags: true }), doc.markdown);
  assert.equal(doc.pages, undefined);
});

test("independent character targets guide but do not truncate a single-section document", async () => {
  const targetChars = { documentSummary: 12, sectionSummary: 3, shortDescription: 2 };
  const parser = createDocumentParser({ targetChars, countTokens, llm: offlineAzure((name, messages) => {
    const prompt = messages[0].content;
    if (name === "chunk_document") {
      assert.match(prompt, /3 characters for the section summary/);
      assert.match(prompt, /2 characters for short_description/);
      return { continuesPrevious: false, sections: [section(1, 3)] };
    }
    assert.match(prompt, /12 characters for the document summary/);
    assert.match(prompt, /2 characters for short_description/);
    return { summary: "Document overview", short_description: "Catalogo prezzi", keywords: [] };
  }) });
  const { map } = await parser.parseDocument(csv);
  assert.equal(map.summary, "Document overview");
  assert.equal(map.short_description, "Catalogo prezzi");
  assert.equal(map.sections[0].summary, "Returns");
  assert.equal(map.sections[0].short_description, "Resi");
});

test("local OCR reads an Italian scan between a native page and a blank page", async () => {
  const { PDFiumLibrary } = await import("@hyzyla/pdfium");
  const { renderPage } = await import("../dist/parser/ocr.js");
  const { convert } = await import("../dist/parser/convert.js");
  const original = await PDFDocument.create();
  original.addPage([320, 100]).drawText("Fattura numero 1742", { x: 15, y: 50, size: 22 });
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText("Introduzione");
  const library = await PDFiumLibrary.init();
  try {
    const png = await renderPage(library, await original.save());
    pdf.addPage([320, 100]).drawImage(await pdf.embedPng(png), { width: 320, height: 100 });
  } finally {
    library.destroy();
  }
  pdf.addPage();
  const progress = [];
  const { markdown, pages } = await convert({ documentId: 10, bytes: await pdf.save() }, message => progress.push(message));
  const logs = progress.join("\n");
  assert.match(logs, /Pagina 1\/3: completata \(testo nativo/);
  assert.match(logs, /Pagina 2\/3: OCR 100%/);
  assert.match(logs, /Pagina 3\/3: vuota/);
  assert.doesNotMatch(logs, /Introduzione|Fattura numero/);
  assert.match(markdown, /Introduzione\nFattura numero 1742/);
  assert.deepEqual(pages, [
    { page: 1, range: [1, 1] }, { page: 2, range: [2, 2] }, { page: 3, range: null },
  ]);
});

test("ImageBased rejection triggers local OCR and resumes extraction; other unsupported errors propagate", async t => {
  const { default: anydoc } = await import("@firecrawl/anydoc");
  const { convert } = await import("../dist/parser/convert.js");
  const pdf = await PDFDocument.create();
  pdf.addPage([320, 100]).drawText("Fattura numero 29", { x: 15, y: 50, size: 22 });
  pdf.addPage().drawText("Conclusione");
  const input = { documentId: 1, bytes: await pdf.save() };
  const mock = t.mock.method(anydoc, "toMarkdownBytes");
  const reject = message => async () => { throw Object.assign(new Error(message), { code: "unsupported" }); };
  mock.mock.mockImplementationOnce(reject("unsupported input: PDF has no extractable text (ImageBased, 1pages)"));
  const result = await convert(input);
  assert.match(result.markdown, /Fattura numero 29\nConclusione/);
  assert.deepEqual(result.pages.map(p => p.range), [[1, 1], [2, 2]]);
  mock.mock.mockImplementation(reject("unsupported input: unknown PDF feature"));
  await assert.rejects(convert(input), /PDF page 1: unsupported input: unknown PDF feature/);
});

test("batch preserves order and rejects invalid size, unknown files and unreadable scans before inference", async () => {
  let calls = 0;
  const parser = createDocumentParser({ countTokens, llm: offlineAzure(() => {
    calls++;
    return { continuesPrevious: false, sections: [section(1, 3)] };
  }) });
  const docs = await parser.parseDocuments([csv, { ...csv, documentId: 0 }]);
  assert.deepEqual(docs.map(d => d.map.documentId), [1, 0]);
  await assert.rejects(parser.parseDocument({ ...csv, sectionSize: { minChars: 3, maxChars: 1 } }), /sectionSize/);
  await assert.rejects(parser.parseDocument({ documentId: 8, bytes: Buffer.from("unknown") }), /Document 8: Unsupported/);
  const pdf = await PDFDocument.create();
  pdf.addPage().drawImage(await pdf.embedPng(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=", "base64")));
  await assert.rejects(parser.parseDocument({ documentId: 9, bytes: await pdf.save() }), /Document 9: PDF page 1/);
  assert.equal(calls, 2);
});
