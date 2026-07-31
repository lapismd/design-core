export { syntaxTokenDefaults, type SyntaxTokenName } from "./tokens.js";

export {
  defineSyntaxTheme,
  syntaxThemeStyle,
  syntaxThemeToCSS,
  resolveSyntaxTokenForMode,
  ALL_SYNTAX_KEYS,
  type SyntaxThemeDefinition,
  type SyntaxThemeInput,
  type SyntaxThemeTokenKey,
  type SyntaxThemeTokenMap,
  type SyntaxThemeTokenInput,
  type SyntaxTokenValue,
} from "./defineSyntaxTheme.js";

export { default as SyntaxTheme } from "./SyntaxTheme.svelte";
export {
  getSyntaxThemeContext,
  setSyntaxThemeContext,
} from "./syntax-theme-context.svelte.js";

export {
  oneDarkPro,
  dracula,
  monokai,
  nord,
  tokyoNight,
  catppuccinMocha,
  githubDark,
  githubLight,
  solarizedLight,
  oneLight,
  catppuccinLatte,
  tokyoNightLight,
  darkSyntaxPresets,
  lightSyntaxPresets,
  allSyntaxPresets,
} from "./presets.js";
