import { getContext, setContext } from "svelte";
import type { AppShellController } from "./app-shell-controller.svelte.js";

const APP_SHELL_CONTEXT = Symbol("ui-minimal-app-shell");

export function setAppShellContext(
  controller: AppShellController,
): AppShellController {
  return setContext(APP_SHELL_CONTEXT, controller);
}

/**
 * Returns the controller from the nearest `AppShell.Root`.
 *
 * Call this during component initialization, as required by Svelte context.
 */
export function useAppShell(): AppShellController {
  const controller = getContext<AppShellController | undefined>(
    APP_SHELL_CONTEXT,
  );
  if (!controller) {
    throw new Error(
      "AppShell components must be rendered inside AppShell.Root",
    );
  }
  return controller;
}
