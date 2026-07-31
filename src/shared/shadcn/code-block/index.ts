export { default as CodeBlock } from "./CodeBlock.svelte";

export {
  tokenize,
  tokenizeAsync,
  tokenizeStreaming,
  flatTokensToLines,
  SYNC_TOKENIZE_THRESHOLD,
  type SyntaxToken,
  type TokenLine,
} from "./tokenizer.js";

export {
  applyHighlightRangesChunked,
  applyHighlightRangesBatch,
  applyHighlightRangesFlat,
  cleanupRanges,
} from "./highlightRanges.js";

export { ensureHighlightStyles, TOKEN_TYPES } from "./highlightStyles.js";

export {
  SyntaxTheme,
  defineSyntaxTheme,
  syntaxThemeStyle,
  syntaxThemeToCSS,
  resolveSyntaxTokenForMode,
  ALL_SYNTAX_KEYS,
  syntaxTokenDefaults,
  getSyntaxThemeContext,
  setSyntaxThemeContext,
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
  type SyntaxThemeDefinition,
  type SyntaxThemeInput,
  type SyntaxThemeTokenKey,
  type SyntaxThemeTokenMap,
  type SyntaxThemeTokenInput,
  type SyntaxTokenValue,
  type SyntaxTokenName,
} from "./syntax/index.js";

export {
  codeBlockTokenNames,
  type CodeBlockToken,
} from "./code-block.tokens.js";
