import type {
  WorkspaceLayoutChangeEvent,
  WorkspaceLayoutPersistence,
  WorkspaceLayout,
} from "./types.js";

export function createLocalStorageWorkspacePersistence(
  key: string,
  storage?: Storage,
): WorkspaceLayoutPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(layout: WorkspaceLayout, _event: WorkspaceLayoutChangeEvent) {
      resolveStorage().setItem(key, JSON.stringify(layout));
    },
  };
}
