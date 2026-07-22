import { tagHighlighter, tags } from "@lezer/highlight";

/**
 * Read-only syntax classes for {@link CodeHighlighter}. Class names are stable
 * so the rendered source can use the shared `--ui-form-code-*` palette without a
 * live editor view. Tag mapping mirrors `CodeEditor` highlight coverage.
 */
export const codeHighlighter = tagHighlighter([
  { tag: [tags.comment, tags.meta], class: "ui-form-code-comment" },
  {
    tag: [tags.keyword, tags.atom, tags.bool],
    class: "ui-form-code-keyword",
  },
  {
    tag: [tags.string, tags.regexp, tags.escape, tags.special(tags.string)],
    class: "ui-form-code-string",
  },
  { tag: tags.number, class: "ui-form-code-value" },
  {
    tag: [tags.propertyName, tags.definition(tags.propertyName), tags.typeName],
    class: "ui-form-code-function",
  },
  {
    tag: [
      tags.link,
      tags.variableName,
      tags.local(tags.variableName),
      tags.special(tags.variableName),
      tags.definition(tags.variableName),
    ],
    class: "ui-form-code-property",
  },
  { tag: tags.operator, class: "ui-form-code-operator" },
  { tag: tags.punctuation, class: "ui-form-code-punctuation" },
  { tag: tags.invalid, class: "ui-form-code-invalid" },
]);
