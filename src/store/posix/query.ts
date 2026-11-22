import { KbStoreError } from "../errors.ts";

// Builds FTS5 MATCH expressions from user input. Every term becomes a quoted phrase,
// so FTS5 operators typed by the user (AND, NEAR, *, ^, column filters) are taken literally.

/** Any of the keywords, each as a phrase: `"a b" OR "c"`. */
export function anyPhrase(keywords: readonly string[]): string {
  if (!keywords.length || keywords.some(word => typeof word !== "string" || !word.trim())) {
    throw new KbStoreError("INVALID_QUERY", "Expected at least one non-empty keyword");
  }
  return keywords.map(quote).join(" OR ");
}

/** All the words of the text, in any order: `"a" "b"`. */
export function allWords(text: string): string | undefined {
  const words = text.split(/\s+/).filter(Boolean);
  return words.length ? words.map(quote).join(" ") : undefined;
}

function quote(term: string): string {
  return `"${term.replaceAll('"', '""')}"`;
}
