import { getContext, setContext } from "svelte";
import type { AppShellController } from "../core/app-shell-controller.svelte.js";
import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";

const APP_SHELL_CONTEXT = Symbol("ui-workspace-app-shell");

export interface AppShellContext {
  readonly controller: AppShellController;
  readonly drag: WorkspaceDragState;
  readonly root: HTMLElement | null;
}

export function setAppShellContext(
  controller: AppShellController,
  drag: WorkspaceDragState,
  resolveRoot: () => HTMLElement | null,
): AppShellContext {
  const context: AppShellContext = {
    controller,
    drag,
    get root() {
      return resolveRoot();
    },
  };
  setContext(APP_SHELL_CONTEXT, context);
  return context;
}

export function getAppShellContext(): AppShellContext {
  const context = getContext<AppShellContext | undefined>(APP_SHELL_CONTEXT);
  if (!context) {
    throw new Error(
      "AppShell components must be rendered inside AppShell.Root",
    );
  }
  return context;
}
