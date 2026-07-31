import { getContext, setContext } from "svelte";
import type { AppShellSide } from "./app-shell-controller.svelte.js";

export type AppShellBodyLayout = "scroll" | "regions";

export interface AppShellBodyPanelRegistration {
  readonly id: string;
  readonly side: AppShellSide;
  readonly open: boolean;
  readonly setOpen: (open: boolean) => void;
}

export interface AppShellBodyContext {
  readonly layout: AppShellBodyLayout;
  readonly panels: readonly AppShellBodyPanelRegistration[];
  readonly registerPanel: (panel: AppShellBodyPanelRegistration) => () => void;
  readonly getPanel: (id: string) => AppShellBodyPanelRegistration | undefined;
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
