import { getContext, setContext } from "svelte";
import type { SyntaxThemeDefinition } from "./defineSyntaxTheme.js";

const SYNTAX_THEME_KEY = Symbol("ui-code-syntax-theme");

export type SyntaxThemeContext = {
  get theme(): SyntaxThemeDefinition;
};

export function setSyntaxThemeContext(ctx: SyntaxThemeContext): void {
  setContext(SYNTAX_THEME_KEY, ctx);
}

export function getSyntaxThemeContext(): SyntaxThemeDefinition | null {
  const ctx = getContext<SyntaxThemeContext | null>(SYNTAX_THEME_KEY);
  return ctx?.theme ?? null;
}
