import type {
  WorkspaceSettingsChangeEvent,
  WorkspaceSettingsPersistence,
  WorkspaceSettingsSnapshotV1,
} from "./types.js";

export function createLocalStorageWorkspaceSettingsPersistence(
  key: string,
  storage?: Storage,
): WorkspaceSettingsPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(
      snapshot: WorkspaceSettingsSnapshotV1,
      _event: WorkspaceSettingsChangeEvent,
    ) {
      resolveStorage().setItem(key, JSON.stringify(snapshot));
    },
  };
}
