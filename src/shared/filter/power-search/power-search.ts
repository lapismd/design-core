import { formatTermExpr } from "../search-filter-bar/search-filter-predicate-chips.js";
import {
  searchFilterFieldByName,
  type SearchFilterSyntax,
} from "../search-filter-bar/search-filter-syntax.js";

/** One structured PowerSearch filter token (field + operator + value). */
export type PowerSearchToken = {
  id: string;
  field: string;
  operator: string;
  /** Display/query value (unquoted). */
  value: string;
};

let tokenSeq = 0;

/** Stable-enough unique id for a new token in the current session. */
export function createPowerSearchTokenId(): string {
  tokenSeq += 1;
  return `ps-token-${Date.now().toString(36)}-${tokenSeq}`;
}

export function createPowerSearchToken(
  parts: Omit<PowerSearchToken, "id"> & { id?: string },
): PowerSearchToken {
  return {
    id: parts.id ?? createPowerSearchTokenId(),
    field: parts.field,
    operator: parts.operator,
    value: parts.value,
  };
}

/**
 * Serialize tokens to a space-joined filter-query string (implicit AND)
 * for hosts that still call `parseFilterQuery`.
 */
export function tokensToFilterQuery(
  tokens: readonly PowerSearchToken[],
): string {
  return tokens
    .map((token) => formatTermExpr(token.field, token.operator, token.value))
    .filter(Boolean)
    .join(" ");
}

const OPERATOR_LABELS: Record<string, string> = {
  ":": "contains",
  "=": "equals",
  "!=": "not equals",
  ">": "greater than",
  ">=": "at least",
  "<": "less than",
  "<=": "at most",
  "~": "matches",
  "!~": "does not match",
};

export function powerSearchOperatorLabel(operator: string): string {
  return OPERATOR_LABELS[operator] ?? operator;
}

/**
 * Commit free text as a token on `contentSearchFieldKey` when set.
 * Returns null when the key is missing or the text is empty.
 */
export function commitContentSearchToken(
  syntax: SearchFilterSyntax | undefined,
  contentSearchFieldKey: string | undefined,
  text: string,
): PowerSearchToken | null {
  const trimmed = text.trim();
  if (!trimmed || !contentSearchFieldKey) return null;
  const field =
    searchFilterFieldByName(syntax, contentSearchFieldKey) ??
    ({
      name: contentSearchFieldKey,
      description: contentSearchFieldKey,
      operators: [":"],
    } as const);
  const operator = field.operators[0] ?? ":";
  return createPowerSearchToken({
    field: field.name,
    operator,
    value: trimmed,
  });
}

/** Match a field by typed query (name, alias, or description prefix). */
export function matchPowerSearchFields(
  syntax: SearchFilterSyntax,
  query: string,
) {
  const needle = query.trim().toLocaleLowerCase();
  return syntax.fields.filter((field) => {
    if (!needle) return true;
    if (field.name.toLocaleLowerCase().includes(needle)) return true;
    if (
      field.aliases?.some((alias) => alias.toLocaleLowerCase().includes(needle))
    ) {
      return true;
    }
    return field.description.toLocaleLowerCase().includes(needle);
  });
}
