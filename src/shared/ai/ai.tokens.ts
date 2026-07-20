/**
 * CSS custom properties for `@stevejuma/ui/ai`.
 * Defaults live in component styles; override on an AI ancestor.
 */
export const aiTokenNames = {
  widthExpanded: "--ui-ai-width-expanded",
  widthCollapsed: "--ui-ai-width-collapsed",
  radius: "--ui-ai-radius",
  shadow: "--ui-ai-shadow",
  zIndex: "--ui-ai-z-index",
} as const;

export type AiToken = (typeof aiTokenNames)[keyof typeof aiTokenNames];
