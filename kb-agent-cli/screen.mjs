import { stripVTControlCharacters as clean } from "node:util";
import { createElement as h, useState } from "react";
import { Box, render, Static, Text } from "ink";
import TextInput from "ink-text-input";
import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

const markdown = new Marked(markedTerminal({ showSectionPrefix: false }));
function Markdown({ children }) {
  return h(Text, null, markdown.parse(clean(children)).trimEnd());
}

function Input({ onSubmit }) {
  const [value, setValue] = useState("");
  return h(Box, null, h(Text, { color: "cyan" }, "› "), h(TextInput, {
    value, onChange: setValue, onSubmit(line) {
      setValue("");
      return onSubmit(line);
    },
  }));
}

export function openScreen(folder, model, submit, interactive) {
  const events = interactive ? [{
    title: "Benvenuto in KB Studio",
    detail: (process.stdout.rows >= 16 && process.stdout.columns >= 42
      ? "    _____ _____\n   /     V     \\\n  /  === | ===  \\\n /_______|_______\\\n\n" : "")
      + "Interroga i tuoi documenti, aggiungi un file con /add o rimuovilo con /delete.",
    color: "cyan",
  }] : [];
  let documents = [], progress = "", busy = false;
  const view = () => h(Box, { flexDirection: "column" },
    h(Static, { items: [...events] }, ({ title, detail, color, elapsed, panel, format }, key) =>
      h(Box, { key, flexDirection: "column", paddingX: 1, borderStyle: panel ? "round" : undefined, borderColor: color },
        h(Text, { bold: true, color }, clean(title), elapsed == null ? "" : `  +${elapsed} ms`),
        detail && (format === "markdown" ? h(Markdown, null, detail) : h(Text, null, clean(detail))))),
    h(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 1 },
      h(Box, { width: "55%", flexDirection: "column", paddingRight: 1 },
        h(Text, { bold: true, color: "cyan" }, "KB Studio"),
        h(Text, null, clean(`${folder} · ${model ?? "Azure"}`)),
        h(Text, { dimColor: true }, "/add <percorso> · /delete <ID> · /tools on|off · Invio a vuoto per uscire"),
        busy ? h(Text, { dimColor: true }, "Elaborazione in corso…") : interactive && h(Input, { onSubmit: submit })),
      h(Box, { width: "45%", flexDirection: "column" },
        h(Text, { bold: true }, `Documenti in KB (${documents.length})`),
        ...documents.map(({ source: s, characters }) => h(Text, { key: s.documentId },
          `#${s.documentId} ${clean(s.originalFileName ?? s.title ?? "Senza nome")}`,
          h(Text, { dimColor: true }, ` · ${characters.toLocaleString("it-IT")} car.`))),
        progress && h(Text, { color: "yellow" }, clean(progress)))));
  // Start at the bottom of a clean viewport; Ink's static trace can still scroll normally.
  if (interactive) process.stdout.write(`\x1b[2J\x1b[${process.stdout.rows};1H`);
  const ui = render(view(), { patchConsole: false });
  const refresh = () => ui.rerender(view());
  return {
    documents(list) { documents = list; refresh(); },
    progress(text) { progress = text; refresh(); },
    busy(value) { busy = value; refresh(); },
    append(event) { events.push(event); refresh(); },
    close: ui.unmount,
    wait: ui.waitUntilExit,
  };
}
