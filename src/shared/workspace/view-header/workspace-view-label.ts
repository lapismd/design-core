import type {
  WorkspaceTab,
  WorkspaceViewBadge,
  WorkspaceViewChrome,
  WorkspaceViewContext,
} from "../core/types.js";
import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";

export interface ResolvedWorkspaceViewLabel {
  title: string;
  badge?: WorkspaceViewBadge;
  accessibleLabel: string;
}

export function createWorkspaceViewContext(
  controller: WorkspaceShellController,
  tab: WorkspaceTab,
  hostId: string,
  paneId: string,
): WorkspaceViewContext {
  return {
    tab,
    hostId,
    paneId,
    active: controller.activeTabId === tab.id,
    showInlineTitle: controller.showInlineTitle,
    activate: () => controller.selectTab(tab.id),
    close: () => controller.closeTab(tab.id),
    setState: (state) => controller.updateViewState(tab.id, state),
  };
}

export function resolveWorkspaceViewChrome(
  controller: WorkspaceShellController,
  tab: WorkspaceTab,
  hostId: string,
  paneId: string,
): WorkspaceViewChrome {
  const definition = controller.registry.resolve(tab.view.type);
  return (
    definition?.getChrome?.(
      createWorkspaceViewContext(controller, tab, hostId, paneId),
    ) ?? {}
  );
}

export function resolveWorkspaceViewLabel(
  controller: WorkspaceShellController,
  tab: WorkspaceTab,
  hostId: string,
  paneId: string,
  fallbackTitle = tab.title,
): ResolvedWorkspaceViewLabel {
  const chrome = resolveWorkspaceViewChrome(controller, tab, hostId, paneId);
  const title = (chrome.title ?? fallbackTitle) || tab.id;
  return {
    title,
    badge: chrome.badge,
    accessibleLabel: chrome.badge ? `${title}, ${chrome.badge.label}` : title,
  };
}
