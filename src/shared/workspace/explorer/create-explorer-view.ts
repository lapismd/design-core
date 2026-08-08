import type { Component } from "svelte";
import type {
  WorkspaceSvelteViewDefinition,
  WorkspaceViewChrome,
  WorkspaceViewContext,
} from "../core/types.js";

/** Recommended view type id for Lapis file-explorer parity. */
export const EXPLORER_VIEW_TYPE = "file:explorer";

/**
 * Convenience builder for registering an Explorer-backed workspace view.
 * The supplied component owns controller lifecycle (typically constructed once
 * per leaf and passed into `WorkspaceExplorer`).
 */
export function createExplorerViewDefinition(options: {
  type?: string;
  component: Component<WorkspaceViewContext>;
  icon?: string;
  showHeader?: boolean;
  getChrome?: (context: WorkspaceViewContext) => WorkspaceViewChrome;
}): WorkspaceSvelteViewDefinition {
  return {
    kind: "svelte",
    type: options.type ?? EXPLORER_VIEW_TYPE,
    component: options.component,
    icon: options.icon ?? "folder-closed",
    showHeader: options.showHeader ?? false,
    getChrome: options.getChrome,
  };
}
