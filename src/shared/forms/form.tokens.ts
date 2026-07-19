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

/**
 * @deprecated Prefer {@link formTokenNames}.
 * Legacy names remain as read aliases in `form.tokens.css`; set `--ui-form-*` when theming.
 */
export const formLegacyTokenNames = {
  background: "--cv-form-background",
  foreground: "--cv-form-foreground",
  muted: "--cv-form-muted",
  mutedSurface: "--cv-form-muted-surface",
  border: "--cv-form-border",
  borderMuted: "--cv-form-border-muted",
  accent: "--cv-form-accent",
  primaryForeground: "--cv-form-primary-foreground",
  selection: "--cv-form-selection",
  selectionStrong: "--cv-form-selection-strong",
  activeLine: "--cv-form-active-line",
  gutter: "--cv-form-gutter",
  popover: "--cv-form-popover",
  panelBackground: "--cv-form-panel-background",
  shadow: "--cv-form-shadow",
  mono: "--cv-form-mono",
  codeBackground: "--cv-form-code-background",
  codeGutter: "--cv-form-code-gutter",
  columnGap: "--cv-control-column-gap",
} as const;
