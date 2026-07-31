export const codeBlockTokenNames = {
  background: "--ui-code-syntax-background",
  borderColor: "--ui-code-block-border-color",
  borderWidth: "--ui-code-block-border-width",
  radius: "--ui-code-block-radius",
  fontFamily: "--ui-code-block-font-family",
  fontSizeMd: "--ui-code-block-font-size-md",
  fontSizeSm: "--ui-code-block-font-size-sm",
  lineHeight: "--ui-code-block-line-height",
  headerFontSize: "--ui-code-block-header-font-size",
  headerLineHeight: "--ui-code-block-header-line-height",
  paddingInline: "--ui-code-block-padding-inline",
  paddingBlock: "--ui-code-block-padding-block",
  headerPaddingBlock: "--ui-code-block-header-padding-block",
  accentMuted: "--ui-code-block-accent-muted",
  copyHoverBackground: "--ui-code-block-copy-hover-background",
  copyActiveBackground: "--ui-code-block-copy-active-background",
  focusRing: "--ui-code-block-focus-ring",
  durationMedium: "--ui-code-block-duration-medium",
  durationFast: "--ui-code-block-duration-fast",
  ease: "--ui-code-block-ease",
} as const;

export type CodeBlockToken =
  (typeof codeBlockTokenNames)[keyof typeof codeBlockTokenNames];
