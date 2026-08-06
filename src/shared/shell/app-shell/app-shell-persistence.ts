import type { AppShellSide } from "./app-shell-controller.svelte.js";

export const APP_SHELL_LAYOUT_VERSION = 1 as const;
export const APP_SHELL_DEFAULT_STORAGE_KEY =
  "@lapismd/design-core/app-shell-layout";

export interface AppShellSidebarLayout {
  side: AppShellSide;
  collapsed: boolean;
  closed: boolean;
  width?: number;
}

export interface AppShellLayoutV1 {
  version: typeof APP_SHELL_LAYOUT_VERSION;
  panels: Record<string, AppShellSidebarLayout>;
}

export type AppShellLayoutChangeSource =
  | "collapse"
  | "close"
  | "resize"
  | "reset-width"
  | "register"
  | "unregister";

export interface AppShellLayoutChangeEvent {
  source: AppShellLayoutChangeSource;
  panelId: string;
}

export interface AppShellLayoutPersistence {
  load(): Promise<unknown | null>;
  save(
    layout: AppShellLayoutV1,
    event: AppShellLayoutChangeEvent,
  ): Promise<void>;
}

export interface AppShellPersistenceErrorEvent {
  operation: "load" | "save";
  error: unknown;
}

/**
 * Browser storage adapter for the App Shell's versioned sidebar layout.
 * Pass a Storage implementation in tests or non-window browser contexts.
 */
export function createLocalStorageAppShellLayoutPersistence(
  key = APP_SHELL_DEFAULT_STORAGE_KEY,
  storage?: Storage,
): AppShellLayoutPersistence {
  const resolveStorage = (): Storage => {
    const resolved = storage ?? globalThis.localStorage;
    if (!resolved) {
      throw new Error("App Shell localStorage is not available.");
    }
    return resolved;
  };

  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(layout) {
      resolveStorage().setItem(key, JSON.stringify(layout));
    },
  };
}
