/**
 * Injects ::highlight() CSS rules and span-token fallback classes.
 * Adapted from Astryx CodeBlock highlightStyles for local token names.
 */

import { syntaxTokenDefaults } from "./syntax/tokens.js";

const FALLBACK_TOKENS = `:root {\n${Object.entries(syntaxTokenDefaults)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join("\n")}\n}`;

const HIGHLIGHT_STYLES = `
${FALLBACK_TOKENS}

[data-ui-component="code-block"] code::highlight(ui-code-keyword) { color: var(--ui-code-syntax-keyword); }
[data-ui-component="code-block"] code::highlight(ui-code-string) { color: var(--ui-code-syntax-string); }
[data-ui-component="code-block"] code::highlight(ui-code-comment) { color: var(--ui-code-syntax-comment); }
[data-ui-component="code-block"] code::highlight(ui-code-number) { color: var(--ui-code-syntax-number); }
[data-ui-component="code-block"] code::highlight(ui-code-function) { color: var(--ui-code-syntax-function); }
[data-ui-component="code-block"] code::highlight(ui-code-type) { color: var(--ui-code-syntax-type); }
[data-ui-component="code-block"] code::highlight(ui-code-tag) { color: var(--ui-code-syntax-tag); }
[data-ui-component="code-block"] code::highlight(ui-code-attribute) { color: var(--ui-code-syntax-attribute); }
[data-ui-component="code-block"] code::highlight(ui-code-property) { color: var(--ui-code-syntax-property); }
[data-ui-component="code-block"] code::highlight(ui-code-operator) { color: var(--ui-code-syntax-operator); }
[data-ui-component="code-block"] code::highlight(ui-code-constant) { color: var(--ui-code-syntax-constant); }
[data-ui-component="code-block"] code::highlight(ui-code-punctuation) { color: var(--ui-code-syntax-punctuation); }
[data-ui-component="code-block"] code::highlight(ui-code-variable) { color: var(--ui-code-syntax-variable); }

.ui-code-token-keyword { color: var(--ui-code-syntax-keyword); }
.ui-code-token-string { color: var(--ui-code-syntax-string); }
.ui-code-token-comment { color: var(--ui-code-syntax-comment); }
.ui-code-token-number { color: var(--ui-code-syntax-number); }
.ui-code-token-function { color: var(--ui-code-syntax-function); }
.ui-code-token-type { color: var(--ui-code-syntax-type); }
.ui-code-token-tag { color: var(--ui-code-syntax-tag); }
.ui-code-token-attribute { color: var(--ui-code-syntax-attribute); }
.ui-code-token-property { color: var(--ui-code-syntax-property); }
.ui-code-token-operator { color: var(--ui-code-syntax-operator); }
.ui-code-token-constant { color: var(--ui-code-syntax-constant); }
.ui-code-token-punctuation { color: var(--ui-code-syntax-punctuation); }
.ui-code-token-variable { color: var(--ui-code-syntax-variable); }
`;

let inserted = false;

/** Injects highlight CSS into document head once. SSR-safe. */
export function ensureHighlightStyles(): void {
  if (inserted) {
    return;
  }
  if (typeof document === "undefined") {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-ui-code-highlight-styles", "");
  style.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(style);
  inserted = true;
}

export const TOKEN_TYPES = [
  "keyword",
  "string",
  "comment",
  "number",
  "function",
  "type",
  "tag",
  "attribute",
  "property",
  "operator",
  "constant",
  "punctuation",
  "variable",
] as const;
