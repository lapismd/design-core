export const codeTokenNames = {
  fontFamily: "--ui-code-font-family",
  fontSize: "--ui-code-font-size",
  background: "--ui-code-background",
  color: "--ui-code-color",
  colorSecondary: "--ui-code-color-secondary",
  paddingInline: "--ui-code-padding-inline",
  paddingBlock: "--ui-code-padding-block",
  radius: "--ui-code-radius",
} as const;

export type CodeToken = (typeof codeTokenNames)[keyof typeof codeTokenNames];
