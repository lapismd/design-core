import { getContext, setContext } from "svelte";
import type { AppShellController } from "../core/app-shell-controller.svelte.js";
import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";

const APP_SETTINGS_CONTEXT = Symbol("ui-workspace-app-settings");

export class AppSettingsState {
  query = $state("");

  constructor(
    readonly controller: WorkspaceSettingsController,
    readonly app?: AppShellController,
  ) {}
}

export function setAppSettingsContext(
  controller: WorkspaceSettingsController,
  app?: AppShellController,
): AppSettingsState {
  const state = new AppSettingsState(controller, app);
  setContext(APP_SETTINGS_CONTEXT, state);
  return state;
}

export function getAppSettingsContext(): AppSettingsState {
  const state = getContext<AppSettingsState | undefined>(APP_SETTINGS_CONTEXT);
  if (!state) {
    throw new Error(
      "AppSettings components must be rendered inside AppSettings.Root",
    );
  }
  return state;
}
