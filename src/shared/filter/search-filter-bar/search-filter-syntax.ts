import type { Component } from "svelte";
import type {
  Completion,
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from "@codemirror/autocomplete";
import { pickedCompletion } from "@codemirror/autocomplete";

/** A value that can be inserted after a field operator. */
export type SearchFilterValue = {
  value: string;
  label?: string;
  description?: string;
  /** Defaults to `value`; callers may supply quoted or otherwise safe syntax. */
  apply?: string;
};

export type SearchFilterValueKind =
  | "text"
  | "enum"
  | "number"
  | "boolean"
  | "date";

export type SearchFilterValueEditorProps = {
  value: string;
  field: SearchFilterField;
  disabled?: boolean;
  onValueChange: (next: string) => void;
};

/** A canonical query field and the syntax it accepts in one search context. */
export type SearchFilterField = {
  name: string;
  description: string;
  operators: readonly string[];
  aliases?: readonly string[];
  values?: readonly (SearchFilterValue | string)[];
  /** Value control in the chip editor; defaults to `text`. */
  valueKind?: SearchFilterValueKind;
  /** Host component; wins over `valueKind`. Stories may pass forms controls. */
  ValueEditor?: Component<SearchFilterValueEditorProps>;
};

export type SearchFilterExample = {
  query: string;
  description: string;
};

/**
 * Opt-in completion and help content for one filter-query search context.
 * The host owns domain fields and values; SearchFilterBar only renders and
 * completes this display model.
 */
export type SearchFilterSyntax = {
  title?: string;
  description?: string;
  fields: readonly SearchFilterField[];
  examples?: readonly SearchFilterExample[];
  notes?: readonly string[];
};

const MAX_VALUE_SUGGESTIONS = 100;
const FIELD_TOKEN = /[A-Za-z][A-Za-z0-9.*$_-]*/;
const VALUE_TOKEN = /[^\s()]+/;
const OPERATOR_TOKEN = />=|<=|!=|!~|>|<|=|~|:/;
const VALUE_CONTEXT =
  /(?:^|[\s(,])([A-Za-z][A-Za-z0-9.*$_-]*)\s*(>=|<=|!=|!~|>|<|=|~|:)\s*([^\s()]*)$/;
const OPERATOR_CONTEXT =
  /(?:^|[\s(,])([A-Za-z][A-Za-z0-9.*$_-]*)\s+([!<>=~:]*)$/;
const FIELD_BEFORE_OPERATOR = /(?:^|[\s(,])([A-Za-z][A-Za-z0-9.*$_-]*)\s*$/;

type ValueCompletionContext = {
  field: SearchFilterField;
  value: string;
};

type OperatorCompletionContext = {
  field: SearchFilterField;
  from: number;
  /** Replace an already-present operator that sits to the cursor's right. */
  to?: number;
};

function uniqueValues(field: SearchFilterField): SearchFilterValue[] {
  const values = new Map<string, SearchFilterValue>();
  for (const value of field.values ?? []) {
    const normalized = typeof value === "string" ? { value } : value;
    const key = normalized.value.trim().toLocaleLowerCase();
    if (!key || values.has(key)) continue;
    values.set(key, normalized);
  }
  return [...values.values()]
    .sort((left, right) =>
      (left.label ?? left.value).localeCompare(
        right.label ?? right.value,
        undefined,
        {
          sensitivity: "base",
        },
      ),
    )
    .slice(0, MAX_VALUE_SUGGESTIONS);
}

/** Normalized suggestion list for a field (chip editor + completions). */
export function searchFilterFieldValues(
  field: SearchFilterField,
): SearchFilterValue[] {
  return uniqueValues(field);
}

function fieldForName(syntax: SearchFilterSyntax, name: string) {
  const normalizedName = name.toLocaleLowerCase();
  return syntax.fields.find(
    (field) =>
      field.name.toLocaleLowerCase() === normalizedName ||
      field.aliases?.some(
        (alias) => alias.toLocaleLowerCase() === normalizedName,
      ),
  );
}

/** Resolve a field by name or alias from a syntax model. */
export function searchFilterFieldByName(
  syntax: SearchFilterSyntax | undefined,
  name: string,
): SearchFilterField | undefined {
  if (!syntax) return undefined;
  return fieldForName(syntax, name);
}

function valueCompletionContext(
  syntax: SearchFilterSyntax,
  query: string,
  position: number,
): ValueCompletionContext | null {
  const match = query.slice(0, position).match(VALUE_CONTEXT);
  if (!match) return null;

  const field = fieldForName(syntax, match[1]!);
  return field ? { field, value: match[3]! } : null;
}

function operatorCompletionContext(
  syntax: SearchFilterSyntax,
  query: string,
  position: number,
): OperatorCompletionContext | null {
  const before = query.slice(0, position);
  const directMatch = before.match(OPERATOR_CONTEXT);
  if (directMatch) {
    const field = fieldForName(syntax, directMatch[1]!);
    if (field) {
      const operatorToRight = query
        .slice(position)
        .match(new RegExp(`^\\s*(${OPERATOR_TOKEN.source})`));
      return {
        field,
        from: position - directMatch[2]!.length,
        ...(operatorToRight
          ? { to: position + operatorToRight[0].length }
          : {}),
      };
    }
  }

  const fieldMatch = before.match(FIELD_BEFORE_OPERATOR);
  const operatorToRight = query
    .slice(position)
    .match(new RegExp(`^\\s*(${OPERATOR_TOKEN.source})`));
  if (!fieldMatch || !operatorToRight) return null;

  const field = fieldForName(syntax, fieldMatch[1]!);
  return field
    ? { field, from: position, to: position + operatorToRight[0].length }
    : null;
}

export type SearchFilterCompletionStage = "field" | "operator" | "value";

/**
 * Identify the next syntax token at a query position. SearchFilterBar uses
 * this to distinguish the compact field/operator menus from the scrollable
 * dynamic-value menu.
 */
export function searchFilterCompletionStage(
  syntax: SearchFilterSyntax,
  query: string,
  position = query.length,
): SearchFilterCompletionStage | null {
  const before = query.slice(0, position);

  if (valueCompletionContext(syntax, query, position)) return "value";

  if (operatorCompletionContext(syntax, query, position)) {
    return "operator";
  }

  const fieldMatch = before.match(new RegExp(`${FIELD_TOKEN.source}$`));
  if (
    fieldMatch &&
    syntax.fields.some((field) =>
      field.name
        .toLocaleLowerCase()
        .startsWith(fieldMatch[0]!.toLocaleLowerCase()),
    )
  ) {
    return "field";
  }

  return null;
}

function fieldCompletions(syntax: SearchFilterSyntax): Completion[] {
  return syntax.fields.map((field) => ({
    label: field.name,
    detail: field.description,
    type: "property",
    apply: `${field.name} `,
  }));
}

function operatorCompletions(
  field: SearchFilterField,
  replaceTo?: number,
): Completion[] {
  return field.operators.map((operator) => ({
    label: operator,
    detail: operatorDescription(operator),
    type: "operator",
    apply:
      replaceTo === undefined
        ? `${operator} `
        : (view, completion, from) => {
            view.dispatch({
              changes: { from, to: replaceTo, insert: `${operator} ` },
              annotations: pickedCompletion.of(completion),
            });
          },
  }));
}

function operatorDescription(operator: string) {
  return (
    {
      ":": "matches",
      "=": "equals",
      "!=": "does not equal",
      ">": "greater than",
      ">=": "greater than or equal to",
      "<": "less than",
      "<=": "less than or equal to",
      "~": "contains",
      "!~": "does not contain",
    }[operator] ?? "comparison"
  );
}

function valueCompletions(field: SearchFilterField): Completion[] {
  return uniqueValues(field).map((value) => ({
    label: value.label ?? value.value,
    detail: value.description,
    type: "constant",
    apply: value.apply ?? value.value,
  }));
}

function result(
  from: number,
  options: Completion[],
  validFor: RegExp,
): CompletionResult | null {
  return options.length ? { from, options, validFor } : null;
}

/**
 * Build a CodeMirror completion source for a supplied filter schema.
 * It only opens automatically for a field prefix, a known field operator, or
 * a known field value; arbitrary free text keeps its unobstructed behaviour.
 */
export function searchFilterCompletion(
  syntax: SearchFilterSyntax,
): CompletionSource {
  return (context: CompletionContext) => {
    const query = context.state.doc.toString();
    const stage = searchFilterCompletionStage(syntax, query, context.pos);

    if (stage === "value") {
      const valueContext = valueCompletionContext(syntax, query, context.pos);
      if (valueContext) {
        return result(
          context.pos - valueContext.value.length,
          valueCompletions(valueContext.field),
          VALUE_TOKEN,
        );
      }
    }

    if (stage === "operator") {
      const operatorContext = operatorCompletionContext(
        syntax,
        query,
        context.pos,
      );
      if (operatorContext) {
        return result(
          operatorContext.from,
          operatorCompletions(operatorContext.field, operatorContext.to),
          /[!<>=~:]*/,
        );
      }
    }

    if (stage !== "field" && !context.explicit) return null;
    const fieldMatch = context.matchBefore(FIELD_TOKEN);
    if (
      fieldMatch &&
      !syntax.fields.some((field) =>
        field.name
          .toLocaleLowerCase()
          .startsWith(fieldMatch.text.toLocaleLowerCase()),
      )
    ) {
      return null;
    }
    return result(
      fieldMatch?.from ?? context.pos,
      fieldCompletions(syntax),
      FIELD_TOKEN,
    );
  };
}
