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

export type FormTokenKey = keyof typeof formTokenNames;
export type FormToken = (typeof formTokenNames)[FormTokenKey];

/**
 * Default bindings from `form.tokens.css`. Keep in sync when changing defaults.
 */
export const formTokenDefaults: Record<FormTokenKey, string> = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  muted: "var(--muted-foreground)",
  mutedSurface: "var(--muted)",
  border: "var(--border)",
  borderMuted: "color-mix(in srgb, var(--border) 70%, transparent)",
  accent: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  selection: "color-mix(in srgb, var(--primary) 12%, transparent)",
  selectionStrong: "color-mix(in srgb, var(--primary) 30%, transparent)",
  activeLine: "color-mix(in srgb, var(--primary) 9%, transparent)",
  gutter: "color-mix(in srgb, var(--muted) 34%, transparent)",
  popover: "var(--popover, var(--card))",
  panelBackground: "var(--ui-form-background)",
  shadow: "rgb(15 23 42 / 22%)",
  mono: "var(--font-mono, ui-monospace, monospace)",
  codeBackground: "color-mix(in srgb, var(--muted) 34%, transparent)",
  codeGutter: "color-mix(in srgb, var(--muted) 52%, transparent)",
  columnGap: "1rem",
  radius: "var(--radius, 0.625rem)",
};
