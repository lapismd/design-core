import { getContext, setContext } from "svelte";
import type { AppShellSide } from "./app-shell-controller.svelte.js";

const APP_SHELL_SIDEBAR_CONTEXT = Symbol("ui-minimal-app-shell-sidebar");

export interface AppShellSidebarContext {
  readonly side: AppShellSide;
  readonly closeable: boolean;
}

export function setAppShellSidebarContext(
  context: AppShellSidebarContext,
): AppShellSidebarContext {
  return setContext(APP_SHELL_SIDEBAR_CONTEXT, context);
}

export function useAppShellSidebar(): AppShellSidebarContext {
  const context = getContext<AppShellSidebarContext | undefined>(
    APP_SHELL_SIDEBAR_CONTEXT,
  );
  if (!context) {
    throw new Error(
      "AppShell.Sidebar compound parts must be rendered inside AppShell.Sidebar",
    );
  }
  return context;
}
