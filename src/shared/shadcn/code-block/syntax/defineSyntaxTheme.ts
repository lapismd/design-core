import { syntaxTokenDefaults, type SyntaxTokenName } from "./tokens.js";

/** Human-readable syntax token name (without CSS custom property prefix). */
export type SyntaxThemeTokenKey =
  | "keyword"
  | "string"
  | "comment"
  | "number"
  | "function"
  | "type"
  | "variable"
  | "operator"
  | "constant"
  | "tag"
  | "attribute"
  | "property"
  | "punctuation"
  | "background";

/** Token value — string or [light, dark] tuple. */
export type SyntaxTokenValue = string | [light: string, dark: string];

export type SyntaxThemeTokenInput = Record<
  SyntaxThemeTokenKey,
  SyntaxTokenValue
>;

export type SyntaxThemeTokenMap = Record<SyntaxThemeTokenKey, string>;

export interface SyntaxThemeInput {
  name: string;
  tokens: SyntaxThemeTokenInput;
}

export interface SyntaxThemeDefinition {
  name: string;
  tokens: SyntaxThemeTokenMap;
  __inputTokens: SyntaxThemeTokenInput;
}

const CSS_PREFIX = "--ui-code-syntax-";

function toCSSProperty(key: SyntaxThemeTokenKey): SyntaxTokenName {
  return (CSS_PREFIX + key) as SyntaxTokenName;
}

export const ALL_SYNTAX_KEYS: SyntaxThemeTokenKey[] = Object.keys(
  syntaxTokenDefaults,
).map((k) => k.replace(CSS_PREFIX, "") as SyntaxThemeTokenKey);

function resolveTokenValue(value: SyntaxTokenValue): string {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

export function resolveSyntaxTokenForMode(
  value: SyntaxTokenValue,
  mode: "light" | "dark",
): string {
  if (Array.isArray(value)) {
    return mode === "dark" ? value[1] : value[0];
  }
  const match = value.match(/^light-dark\(([^,]+),([^)]+)\)$/);
  if (match) {
    return mode === "dark" ? match[2].trim() : match[1].trim();
  }
  return value;
}

/** Create a syntax theme from a complete 14-token map. */
export function defineSyntaxTheme(
  input: SyntaxThemeInput,
): SyntaxThemeDefinition {
  const missing = ALL_SYNTAX_KEYS.filter((key) => !(key in input.tokens));
  if (missing.length > 0) {
    console.warn(
      `[defineSyntaxTheme] "${input.name}": missing tokens: ${missing.join(", ")}. All 14 syntax tokens are required.`,
    );
  }

  const resolved: Partial<SyntaxThemeTokenMap> = {};
  for (const key of ALL_SYNTAX_KEYS) {
    resolved[key] = resolveTokenValue(input.tokens[key]);
  }

  return {
    name: input.name,
    tokens: resolved as SyntaxThemeTokenMap,
    __inputTokens: { ...input.tokens },
  };
}

/** CSS custom property map for inline style / SyntaxTheme host. */
export function syntaxThemeStyle(
  theme: SyntaxThemeDefinition,
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of ALL_SYNTAX_KEYS) {
    vars[toCSSProperty(key)] = theme.tokens[key];
  }
  return vars;
}

/** Convert a syntax theme to CSS declarations (no selector wrapper). */
export function syntaxThemeToCSS(theme: SyntaxThemeDefinition): string {
  return ALL_SYNTAX_KEYS.map(
    (key) => toCSSProperty(key) + ": " + theme.tokens[key] + ";",
  ).join("\n  ");
}
