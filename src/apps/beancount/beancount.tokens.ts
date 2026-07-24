/**
 * Normalized visual token names for Beancount-specific presentation.
 *
 * Values are defined in `beancount.tokens.css` and deliberately alias the
 * shared theme. App components may consume these roles, but must not introduce
 * raw palette or spacing values for the same concepts.
 */
export const beancountTokenNames = {
  canvas: "--ui-beancount-canvas",
  surface: "--ui-beancount-surface",
  surfaceMuted: "--ui-beancount-surface-muted",
  foreground: "--ui-beancount-foreground",
  mutedForeground: "--ui-beancount-muted-foreground",
  border: "--ui-beancount-border",
  sidebar: "--ui-beancount-sidebar",
  sidebarForeground: "--ui-beancount-sidebar-foreground",
  sidebarAccent: "--ui-beancount-sidebar-accent",
  sidebarAccentForeground: "--ui-beancount-sidebar-accent-foreground",
  radiusPanel: "--ui-beancount-radius-panel",
  shadowPanel: "--ui-beancount-shadow-panel",
  focusRing: "--ui-beancount-focus-ring",
  codeActiveLine: "--ui-beancount-code-active-line",
  codeComment: "--ui-beancount-code-comment",
  codeKeyword: "--ui-beancount-code-keyword",
  codeString: "--ui-beancount-code-string",
  codeValue: "--ui-beancount-code-value",
  codeProperty: "--ui-beancount-code-property",
  codePunctuation: "--ui-beancount-code-punctuation",
  controlHeight: "--ui-beancount-control-height",
  compactControlHeight: "--ui-beancount-compact-control-height",
  space1: "--ui-beancount-space-1",
  space2: "--ui-beancount-space-2",
  space3: "--ui-beancount-space-3",
  space4: "--ui-beancount-space-4",
  space5: "--ui-beancount-space-5",
} as const;

export type BeancountToken =
  (typeof beancountTokenNames)[keyof typeof beancountTokenNames];
