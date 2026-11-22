import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import { validate as validateUuid, version as uuidVersion } from "uuid";
import {
  convertDocument, createDocumentParser, createPosixStore, getDocumentTableOfContents, getSectionMarkdown,
  KbSmartManager, KbStoreError, POSIXSearchEngine, saveDocumentMarkdown,
} from "smartDocKb";
import { convertToMarkdown } from "../dist/parser/convert.js";
import { offlineAzure } from "./azure-model.mjs";
import { makeDocument, openKb, tempFolder } from "./kb-fixtures.mjs";

const countTokens = text => text.length;
const csv = { documentId: 1, bytes: Buffer.from("name,price\nBook,10"), fileName: "prices.csv" };
const noModel = () => offlineAzure(() => assert.fail("Unexpected model call"));
const uuid = "019ab123-4567-7abc-8def-0123456789ab";

function assertUuidV7(id) {
  assert.ok(validateUuid(id), `Expected a UUID, got ${id}`);
  assert.equal(uuidVersion(id), 7);
  assert.equal(id, id.toLowerCase());
}

test("Markdown export marks physical pages, including empty ones, but not unpaginated text", async t => {
  const path = join(await tempFolder(t, "document-export-"), "export.md");
  const markdown = "# Titolo\n\nPrima riga\nCittà";
  const doc = { markdown, pages: [{ pageNumber: 1, fromLine: 1, toLine: 3 }, { pageNumber: 2 }, { pageNumber: 3, fromLine: 4, toLine: 4 }] };
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
  const path = join(await tempFolder(t, "section-export-"), "export.md");
  const doc = {
    markdown: "Intro\nTerms\nMore terms",
    map: { sections: [{ sectionId: 1, fromLine: 1, toLine: 1 }, { sectionId: 2, fromLine: 2, toLine: 3 }] },
  };
  const first = "<!--------------- SECTION 1 --------------->\nIntro";
  const second = "<!--------------- SECTION 2 --------------->\nTerms";
  await saveDocumentMarkdown(doc, path, { sectionMarkers: true });
  assert.equal(await readFile(path, "utf8"), [first, second, "More terms"].join("\n"));

  doc.pages = [{ pageNumber: 1, fromLine: 1, toLine: 2 }, { pageNumber: 2, fromLine: 3, toLine: 3 }];
  await saveDocumentMarkdown(doc, path, { sectionMarkers: true });
  assert.equal(await readFile(path, "utf8"), [
    "<!--------------- PAGE 1 ---------------->", first, second,
    "<!--------------- PAGE 2 ---------------->", "More terms",
  ].join("\n"));
});

const section = (fromLine, toLine, summary = "Returns") => ({
  title: "Returns", fromLine, toLine, summary, shortDescription: "Resi", keywords: ["returns"],
});

test("physical pages survive a blank page, a cross-page section and the store round trip", async t => {
  const pdf = await PDFDocument.create();
  pdf.addPage().drawText("Introduction\nFirst condition", { lineHeight: 55 });
  pdf.addPage();
  pdf.addPage().drawText("Second condition");
  const parser = createDocumentParser({
    countTokens,
    llm: offlineAzure((name, messages) => {
      if (name === "summarize_document") return { summary: "Overview", shortDescription: "Introduzione e condizioni", keywords: [] };
      const end = Number(messages[0].content.match(/through (\d+)/)[1]);
      return { continuesPrevious: false, sections: [
        { ...section(1, 1), title: "Introduction", shortDescription: "Contesto" },
        section(2, end),
      ] };
    }),
  });
  const doc = JSON.parse(JSON.stringify(await parser.parseDocument({
    bytes: await pdf.save(), documentId: 4, fileName: "uploads\\Manuale originale.pdf",
  })));
  assert.deepEqual(doc.pages[1], { pageNumber: 2 });
  const selected = doc.map.sections[1];
  assert.deepEqual([selected.fromPage, selected.toPage], [1, 3]);
  assert.equal(selected.totalTokens, countTokens(doc.markdown));
  assert.equal(selected.tokens, countTokens(getSectionMarkdown(doc, selected.sectionId)));
  const tagged = getSectionMarkdown(doc, selected.sectionId, { pageTags: true });
  assert.match(tagged, /^<!-- page: 1 -->[\s\S]*First condition[\s\S]*<!-- page: 3 -->\n[^\n]*Second condition/);
  assert.doesNotMatch(doc.markdown, /<!-- page:/);
  const fileSource = { documentId: 4, originalFileName: "Manuale originale.pdf" };
  const toc = getDocumentTableOfContents(doc);
  assert.deepEqual([toc.source, toc.shortDescription], [fileSource, "Introduzione e condizioni"]);
  assert.deepEqual(toc.sections.map(({ source, shortDescription }) => [source.sectionId, source.sectionTitle, shortDescription]), [
    [1, "Introduction", "Contesto"], [2, "Returns", "Resi"],
  ]);

  const kb = await openKb(t, [doc]);
  assert.deepEqual(await kb.kbDocumentGetTableOfContents(4), toc);
  const [card] = (await kb.kbGetTableOfContents()).documents;
  assert.deepEqual([card.documentId, card.originalFileName], [4, fileSource.originalFileName]);
  assert.equal((await kb.kbDocumentGetInfo(4)).originalFileName, fileSource.originalFileName);
  assert.deepEqual((await kb.kbDocumentReadSummary(4)).source, fileSource);
  assert.equal((await kb.kbDocumentRead(4)).markdown, doc.markdown);

  const passage = await kb.kbDocumentReadSection(4, selected.sectionId);
  assert.deepEqual(toc.sections[1].source, passage.source);
  assert.equal(passage.markdown, getSectionMarkdown(doc, selected.sectionId));
  assert.deepEqual(passage.source.pages, [
    { pageNumber: 1, fromLine: selected.fromLine, toLine: doc.pages[0].toLine },
    { pageNumber: 3, fromLine: doc.pages[2].fromLine, toLine: selected.toLine },
  ]);
  const { matches } = await kb.kbDocumentSearchByKeywords({ kind: "keywords", keywords: ["SECOND", "Second condition"] }, [4]);
  assert.equal(matches.length, 1);
  const { source, snippet } = matches[0];
  assert.equal(source.originalFileName, fileSource.originalFileName);
  assert.equal(source.pages[0].pageNumber, 3);
  assert.deepEqual(await kb.kbDocumentReadSection(4, source.fromLine, source.toLine), { markdown: snippet, source });
  const tools = Object.fromEntries(kb.getTools().map(tool => [tool.name, tool]));
  assert.equal(Object.keys(tools).length, 7);
  const search = await tools.kbDocumentSearchByKeywords.invoke({
    query: { kind: "regex", pattern: "second condition" }, documentIds: [4],
  });
  assert.deepEqual(search.matches, matches);
  for (const [target, expected] of [
    [{ sectionId: selected.sectionId }, passage],
    [{ fromLine: source.fromLine, toLine: source.toLine }, { markdown: snippet, source }],
  ]) {
    assert.deepEqual(await tools.kbDocumentReadSection.invoke({ documentId: 4, section: target }), expected);
  }
  await assert.rejects(kb.kbDocumentReadSection(4, 999), /Unknown section/);
  await assert.rejects(kb.kbDocumentReadSection(4, 0, 2), /Invalid line range/);
});

test("the manager reads empty documents, filters searches and deletes through the store", async t => {
  const empty = makeDocument(1, undefined, "Info", "");
  const terms = makeDocument(2, "Terms.txt", "Terms", "Art. 3\nArtX 3");
  delete terms.pages;
  const kb = await openKb(t, [empty, terms]);
  assert.deepEqual(await kb.kbDocumentRead(1), { markdown: "", source: { documentId: 1 } });
  const literal = await kb.kbDocumentSearchByKeywords({ kind: "keywords", keywords: ["art."] }, [2]);
  assert.deepEqual(literal.matches.map(hit => hit.snippet), ["Art. 3"]);
  assert.equal(literal.matches[0].source.pages, null);
  const regex = await kb.kbDocumentSearchByKeywords({ kind: "regex", pattern: "^art. 3$" }, [2]);
  assert.equal(regex.matches.length, 2);
  assert.deepEqual(await kb.kbDocumentSearchByKeywords({ kind: "regex", pattern: "zz" }, [2]), { matches: [] });
  await assert.rejects(kb.kbDocumentRead(9), error => error instanceof KbStoreError && error.code === "NOT_FOUND");

  await kb.deleteDocument(2);
  await assert.rejects(kb.kbDocumentRead(2), /Unknown document 2/);
  await assert.rejects(kb.deleteDocument(2), /Unknown document 2/);
  assert.deepEqual((await kb.kbGetTableOfContents()).documents.map(doc => doc.documentId), [1]);
});

test("a blank document has an empty TOC and does not call the model", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const doc = await createDocumentParser({ countTokens, llm: noModel() }).parseDocument({ documentId: 7, bytes: await pdf.save() });
  assert.deepEqual(getDocumentTableOfContents(doc), { source: { documentId: 7 }, shortDescription: "", sections: [] });
});

test("callers parse and add uploads directly with generated or explicit IDs", async t => {
  const root = await tempFolder(t, "parser-import-");
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const parser = createDocumentParser({ countTokens, llm: noModel() });
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const input = { bytes: await pdf.save(), fileName: "upload.pdf" };
  const first = await parser.parseDocument(input);
  const second = await parser.parseDocument(input);
  assertUuidV7(first.map.documentId);
  assertUuidV7(second.map.documentId);
  assert.notEqual(first.map.documentId, second.map.documentId);
  const explicit = await parser.parseDocument({ ...input, documentId: uuid });
  assert.equal(explicit.map.documentId, uuid);
  for (const doc of [first, second, explicit]) await store.add(doc);

  const engine = await POSIXSearchEngine.open({ root });
  t.after(() => engine.close());
  const kb = await KbSmartManager.open(store, engine);
  assert.equal((await kb.kbDocumentGetInfo(first.map.documentId)).originalFileName, "upload.pdf");
  assert.equal((await kb.kbDocumentGetInfo(uuid)).documentId, uuid);
  for (const documentId of [uuid.toUpperCase(), "550e8400-e29b-41d4-a716-446655440000", "2"]) {
    await assert.rejects(parser.parseDocument({ ...input, documentId }), { name: "DocumentParseError", documentId });
  }
});

test("persistent gaps recover the whole window from its original text", async () => {
  const calls = [];
  let recoveredText;
  const parser = createDocumentParser({ countTokens, llm: offlineAzure((name, messages) => {
    calls.push(name);
    if (name === "summarize_section") {
      recoveredText = messages[1].content;
      return { summary: "Prezzi dei libri", shortDescription: "Prezzi", keywords: ["libri"] };
    }
    return { continuesPrevious: false, sections: [section(2, 3)] };
  }) });
  const doc = await parser.parseDocument(csv);
  assert.deepEqual(calls, ["chunk_document", "chunk_document", "summarize_section"]);
  assert.equal(recoveredText, doc.markdown);
  assert.deepEqual(doc.map.sections.map(s => [s.fromLine, s.toLine]), [[1, 3]]);
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
        return { summary: "Combined", shortDescription: "All terms", keywords: ["all"] };
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
  assert.equal(doc.map.sections[0].shortDescription, "All terms");
  assert.equal(doc.map.shortDescription, "All terms");
  assert.equal(getSectionMarkdown(doc, 1, { pageTags: true }), doc.markdown);
  assert.equal(doc.pages, undefined);
});

test("independent character targets guide but do not truncate a single-section document", async () => {
  const targetChars = { documentSummary: 12, sectionSummary: 3, shortDescription: 2 };
  const parser = createDocumentParser({ targetChars, countTokens, llm: offlineAzure((name, messages) => {
    const prompt = messages[0].content;
    if (name === "chunk_document") {
      assert.match(prompt, /3 characters for the section summary/);
      assert.match(prompt, /2 characters for shortDescription/);
      return { continuesPrevious: false, sections: [section(1, 3)] };
    }
    assert.match(prompt, /12 characters for the document summary/);
    assert.match(prompt, /2 characters for shortDescription/);
    return { summary: "Document overview", shortDescription: "Catalogo prezzi", keywords: [] };
  }) });
  const { map } = await parser.parseDocument(csv);
  assert.equal(map.summary, "Document overview");
  assert.equal(map.shortDescription, "Catalogo prezzi");
  assert.equal(map.sections[0].summary, "Returns");
  assert.equal(map.sections[0].shortDescription, "Resi");
});

test("local OCR reads an Italian scan between a native page and a blank page", async () => {
  const { PDFiumLibrary } = await import("@hyzyla/pdfium");
  const { renderPage } = await import("../dist/parser/ocr.js");
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
  const bytes = await pdf.save();
  const { markdown, pages } = await convertToMarkdown({ bytes }, event => progress.push(event));
  assert.equal(await convertDocument({ bytes }), markdown);
  assert.ok(progress.every(e => !("documentId" in e) && e.phase === "conversion" && e.format === "pdf" && e.totalPages === 3 && e.unit === "pages"));
  for (let i = 1; i < progress.length; i++) {
    assert.ok(progress[i].percent >= progress[i - 1].percent);
  }
  assert.equal(progress[0].step, "start");
  assert.equal(progress[0].percent, 0);
  assert.deepEqual(
    progress.filter(e => e.step === "page-done").map(e => ({ page: e.page, source: e.pageSource, current: e.current, phasePercent: e.phasePercent })),
    [
      { page: 1, source: "native", current: 1, phasePercent: 33 },
      { page: 2, source: "ocr", current: 2, phasePercent: 66 },
      { page: 3, source: "blank", current: 3, phasePercent: 100 },
    ],
  );
  assert.ok(progress.some(e => e.step === "ocr-progress" && e.page === 2 && e.ocrPercent === 100));
  assert.equal(progress.at(-1).step, "done");
  assert.equal(progress.at(-1).percent, 100);
  const logs = progress.map(e => e.message).join("\n");
  assert.match(logs, /Pagina 1\/3: completata \(testo nativo/);
  assert.match(logs, /Pagina 2\/3: OCR 100%/);
  assert.match(logs, /Pagina 3\/3: vuota/);
  assert.doesNotMatch(logs, /Introduzione|Fattura numero/);
  assert.match(markdown, /Introduzione\nFattura numero 1742/);
  assert.deepEqual(pages, [
    { pageNumber: 1, fromLine: 1, toLine: 1 }, { pageNumber: 2, fromLine: 2, toLine: 2 }, { pageNumber: 3 },
  ]);
});

test("ImageBased rejection triggers local OCR and resumes extraction; other unsupported errors propagate", async t => {
  const { default: anydoc } = await import("@firecrawl/anydoc");
  const pdf = await PDFDocument.create();
  pdf.addPage([320, 100]).drawText("Fattura numero 29", { x: 15, y: 50, size: 22 });
  pdf.addPage().drawText("Conclusione");
  const input = { documentId: 1, bytes: await pdf.save() };
  const mock = t.mock.method(anydoc, "toMarkdownBytes");
  const reject = message => async () => { throw Object.assign(new Error(message), { code: "unsupported" }); };
  mock.mock.mockImplementationOnce(reject("unsupported input: PDF has no extractable text (ImageBased, 1pages)"));
  const result = await convertToMarkdown(input);
  assert.match(result.markdown, /Fattura numero 29\nConclusione/);
  assert.deepEqual(result.pages.map(p => [p.fromLine, p.toLine]), [[1, 1], [2, 2]]);
  mock.mock.mockImplementation(reject("unsupported input: unknown PDF feature"));
  await assert.rejects(convertDocument(input), /PDF page 1: unsupported input: unknown PDF feature/);
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

test("onProgress emits structured phase and batch progress with monotonic percentages", async () => {
  const events = [];
  let windowCalls = 0;
  const parser = createDocumentParser({
    countTokens,
    windowTokens: 230,
    targetChars: { documentSummary: 40 },
    onProgress: event => events.push(event),
    llm: offlineAzure((name, messages) => {
      if (name === "summarize_section") {
        return { summary: "Merged section", shortDescription: "Merged", keywords: ["k"] };
      }
      if (name === "summarize_document") {
        return { summary: "Doc overview", shortDescription: "Overview", keywords: ["doc"] };
      }
      const [, start, end] = messages[0].content.match(/assigned lines (\d+) through (\d+)/);
      windowCalls++;
      if (windowCalls === 1) {
        return { continuesPrevious: false, sections: [section(+start + 1, +end)] }; // trigger retry on attempt 1
      }
      return { continuesPrevious: +start > 1, sections: [section(+start, +end, `part-${windowCalls}`)] };
    }),
  });

  const multiWindowBytes = Buffer.from("label,value\n" + ["a", "b", "c"].map(x => `${x},${x.repeat(75)}`).join("\n"));
  const blankPdf = await PDFDocument.create();
  blankPdf.addPage();

  const [multi, blank] = await parser.parseDocuments([
    { fileName: "dir\\multi.csv", bytes: multiWindowBytes, sectionSize: { minChars: 100, maxChars: 160 } },
    { documentId: uuid, fileName: "empty.pdf", bytes: await blankPdf.save() },
  ]);
  assertUuidV7(multi.map.documentId);
  assert.equal(blank.map.documentId, uuid);
  assert.deepEqual([...new Set(events.map(e => e.documentId))], [multi.map.documentId, uuid]);

  for (let i = 1; i < events.length; i++) {
    assert.ok(events[i].batch.percent >= events[i - 1].batch.percent);
  }
  assert.equal(events[0].batch.percent, 0);
  assert.equal(events.at(-1).batch.percent, 100);

  const doc11 = events.filter(e => e.documentId === multi.map.documentId);
  assert.ok(doc11.every(e => e.fileName === "multi.csv" && e.batch.current === 1 && e.batch.total === 2));
  for (let i = 1; i < doc11.length; i++) {
    assert.ok(doc11[i].percent >= doc11[i - 1].percent);
    if (doc11[i].percent < 100) assert.notEqual(doc11[i].phase, "completed");
  }
  assert.equal(doc11[0].percent, 0);
  assert.equal(doc11.at(-1).phase, "completed");
  assert.equal(doc11.at(-1).percent, 100);
  assert.equal(doc11.at(-1).sectionCount, 1);

  const seenPhases = doc11.map(e => e.phase).filter((phase, idx, arr) => phase !== arr[idx - 1]);
  assert.deepEqual(seenPhases, ["conversion", "segmentation", "sections", "overview", "completed"]);

  const retry = doc11.find(e => e.phase === "segmentation" && e.step === "window-request" && e.attempt === 2);
  assert.ok(retry);
  assert.equal(retry.maxAttempts, 2);
  assert.equal(retry.window, 1);
  assert.ok(retry.totalWindows >= 2);
  assert.ok(doc11.some(e => e.phase === "sections" && e.step === "llm-request" && e.sectionIndex === 1 && e.totalSections === 1));
  assert.ok(doc11.some(e => e.phase === "overview" && e.step === "llm-request" && e.attempt === 1));

  const doc12 = events.filter(e => e.documentId === uuid);
  assert.ok(doc12.every(e => e.fileName === "empty.pdf" && e.batch.current === 2 && e.batch.total === 2));
  assert.deepEqual(
    doc12.map(e => e.phase).filter((phase, idx, arr) => phase !== arr[idx - 1]),
    ["conversion", "completed"],
  );
  assert.equal(doc12.at(-1).sectionCount, 0);
  assert.equal(doc12.at(-1).lineCount, 0);
  assert.equal(doc12.at(-1).percent, 100);
});
