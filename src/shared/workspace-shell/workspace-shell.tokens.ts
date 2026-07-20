/**
 * CSS custom properties for `@stevejuma/ui/workspace-shell`.
 * Defaults live in component styles; override on a shell ancestor.
 */
export const workspaceShellTokenNames = {
  pad: "--ui-workspace-pad",
  aiGap: "--ui-workspace-ai-gap",
  aiWidthExpanded: "--ui-workspace-ai-width-expanded",
  aiWidthCollapsed: "--ui-workspace-ai-width-collapsed",
  radius: "--ui-workspace-radius",
  shadow: "--ui-workspace-shadow",
  shadowDark: "--ui-workspace-shadow-dark",
} as const;

export type WorkspaceShellToken =
  (typeof workspaceShellTokenNames)[keyof typeof workspaceShellTokenNames];
