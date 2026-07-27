import { getContext, setContext } from "svelte";

export type AppShellBodyLayout = "scroll" | "regions";

export interface AppShellBodyContext {
  readonly layout: AppShellBodyLayout;
}

const APP_SHELL_BODY_CONTEXT = Symbol("ui-minimal-app-shell-body");

export function setAppShellBodyContext(
  context: AppShellBodyContext,
): AppShellBodyContext {
  return setContext(APP_SHELL_BODY_CONTEXT, context);
}

/** Returns the nearest `AppShell.Body` compound context. */
export function useAppShellBody(): AppShellBodyContext {
  const context = getContext<AppShellBodyContext | undefined>(
    APP_SHELL_BODY_CONTEXT,
  );
  if (!context) {
    throw new Error(
      "AppShell.Body compound parts must be rendered inside AppShell.Body",
    );
  }
  return context;
}
