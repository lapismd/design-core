/**
 * Public CSS custom properties for `@stevejuma/ui/forms`.
 * Defaults are applied in `form.tokens.css` (theme-token fallbacks).
 *
 * Override on `:root`, `.ui-structured-form`, or any form ancestor, e.g.
 * `--ui-form-accent: oklch(...)`.
 */
export const formTokenNames = {
  background: "--ui-form-background",
  foreground: "--ui-form-foreground",
  muted: "--ui-form-muted",
  mutedSurface: "--ui-form-muted-surface",
  border: "--ui-form-border",
  borderMuted: "--ui-form-border-muted",
  accent: "--ui-form-accent",
  primaryForeground: "--ui-form-primary-foreground",
  selection: "--ui-form-selection",
  selectionStrong: "--ui-form-selection-strong",
  activeLine: "--ui-form-active-line",
  gutter: "--ui-form-gutter",
  popover: "--ui-form-popover",
  panelBackground: "--ui-form-panel-background",
  shadow: "--ui-form-shadow",
  mono: "--ui-form-mono",
  codeBackground: "--ui-form-code-background",
  codeGutter: "--ui-form-code-gutter",
  columnGap: "--ui-form-column-gap",
  radius: "--ui-form-radius",
} as const;

export type FormToken =
  (typeof formTokenNames)[keyof typeof formTokenNames];
