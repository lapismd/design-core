/**
 * Code syntax highlighting tokens for CodeBlock.
 * Defaults reference catalog theme semantics so light/dark follows colorMode.
 */

export const syntaxTokenDefaults = {
  "--ui-code-syntax-keyword": "var(--ui-code-syntax-keyword-default, #5b21b6)",
  "--ui-code-syntax-string": "var(--ui-code-syntax-string-default, #92400e)",
  "--ui-code-syntax-comment": "var(--muted-foreground)",
  "--ui-code-syntax-number": "var(--ui-code-syntax-number-default, #c2410c)",
  "--ui-code-syntax-function":
    "var(--ui-code-syntax-function-default, #075985)",
  "--ui-code-syntax-type": "var(--ui-code-syntax-type-default, #6b21a8)",
  "--ui-code-syntax-variable": "var(--foreground)",
  "--ui-code-syntax-operator":
    "var(--ui-code-syntax-operator-default, #0e7490)",
  "--ui-code-syntax-constant":
    "var(--ui-code-syntax-constant-default, #c2410c)",
  "--ui-code-syntax-tag": "var(--ui-code-syntax-tag-default, #b91c1c)",
  "--ui-code-syntax-attribute":
    "var(--ui-code-syntax-attribute-default, #0f766e)",
  "--ui-code-syntax-property":
    "var(--ui-code-syntax-property-default, #1d4ed8)",
  "--ui-code-syntax-punctuation": "var(--muted-foreground)",
  "--ui-code-syntax-background": "var(--muted)",
} as const;

export type SyntaxTokenName = keyof typeof syntaxTokenDefaults;
