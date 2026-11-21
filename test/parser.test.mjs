import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument } from "pdf-lib";
import { createDocumentParser, getDocumentTableOfContents, getSectionMarkdown, load, persist, saveDocumentMarkdown } from "../dist/index.js";
import { offlineAzure } from "./azure-model.mjs";

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

test("physical pages survive a blank page, a cross-page section and JSON round trip", async () => {
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
  const doc = JSON.parse(JSON.stringify(await parser.parseDocument({ bytes, documentId: 4 })));
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
});

test("a blank document has an empty TOC and does not call the model", async () => {
  const pdf = await PDFDocument.create();
  pdf.addPage();
  const parser = createDocumentParser({ countTokens, llm: offlineAzure(() => assert.fail("Unexpected model call")) });
  const doc = await parser.parseDocument({ documentId: 7, bytes: await pdf.save() });
  assert.deepEqual(getDocumentTableOfContents(doc), { documentId: 7, short_description: "", sections: [] });
});

test("coverage errors get one correction; persistent gaps fail with document ID and window", async () => {
  let calls = 0;
  const parser = createDocumentParser({ countTokens, llm: offlineAzure(() => {
    calls++;
    return { continuesPrevious: false, sections: [section(2, 3)] };
  }) });
  await assert.rejects(parser.parseDocument(csv), {
    name: "DocumentParseError", documentId: 1, message: /Document 1: Invalid LLM output for lines 1-3/,
  });
  assert.equal(calls, 2);
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

test("batch preserves order and rejects invalid size, unknown files and image-only PDFs before inference", async () => {
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
