import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { parser } from "./query.js";

export { filterHighlighting } from "./highlight.js";
export * from "./filters.js";
export {
  isValidNumber,
  parseQuery,
  readString,
  type QueryParserOptions,
} from "./parser.js";
export { parseQuery as parseFilterQuery } from "./parser.js";

/** Lezer language for the structured filter query syntax. */
export const filterQueryLanguage = LRLanguage.define({
  name: "filterQuery",
  parser,
});

/** CodeMirror language support for filter-query editing. */
export function filterQuery() {
  return new LanguageSupport(filterQueryLanguage);
}
