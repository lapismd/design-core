/** Bundled syntax colors for span and CSS Highlight API rendering. */
import "./highlight-styles.css";

/**
 * Compatibility entry point for existing consumers. Importing this module now
 * loads the static stylesheet, so no runtime style element is required.
 */
export function ensureHighlightStyles(): void {}

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
