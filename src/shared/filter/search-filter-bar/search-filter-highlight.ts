import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

/**
 * Highlight style for filter-query SearchFilterBar, aligned with forms code
 * token variables (`--ui-form-code-*` / `--cv-code-*` fallbacks).
 */
export const searchFilterHighlightStyle = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.controlKeyword, tags.definitionKeyword],
    color: "var(--ui-form-code-keyword, var(--cv-code-keyword, #5b21b6))",
    fontWeight: "600",
  },
  {
    tag: [tags.atom, tags.bool, tags.number],
    color: "var(--ui-form-code-value, var(--cv-code-constant, #0f766e))",
  },
  {
    tag: [tags.string, tags.regexp, tags.special(tags.string)],
    color: "var(--ui-form-code-string, var(--cv-code-string, #92400e))",
  },
  {
    tag: [
      tags.function(tags.variableName),
      tags.function(tags.propertyName),
      tags.propertyName,
      tags.attributeName,
      tags.typeName,
    ],
    color: "var(--ui-form-code-function, var(--cv-code-function, #075985))",
  },
  {
    tag: [
      tags.link,
      tags.tagName,
      tags.labelName,
      tags.variableName,
      tags.local(tags.variableName),
      tags.special(tags.variableName),
    ],
    color: "var(--ui-form-code-property, var(--cv-code-property, #1d4ed8))",
  },
  {
    tag: [tags.operator, tags.logicOperator],
    color: "var(--ui-form-code-operator, var(--ui-form-accent))",
  },
  {
    tag: tags.comment,
    color: "var(--ui-form-muted)",
    fontStyle: "italic",
  },
  {
    tag: tags.invalid,
    color: "var(--destructive, #dc2626)",
  },
]);
