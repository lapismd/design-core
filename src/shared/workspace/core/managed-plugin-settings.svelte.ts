import type { AppShellPluginManager } from "./plugin-manager.svelte.js";

export type ManagedPluginDistribution = "bundled" | "first-party-external";

export type ManagedPluginStatus =
  | "disabled"
  | "enabling"
  | "enabled"
  | "disabling"
  | "failed";

export interface ManagedPluginSettingsEntry {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  required: boolean;
  enabled: boolean;
  status: ManagedPluginStatus;
  distribution: ManagedPluginDistribution;
  error?: unknown;
}

export interface ManagedPluginSettingsSource {
  /** Stable source identity used to disambiguate plugin ids across runtimes. */
  id: string;
  getEntries(): readonly ManagedPluginSettingsEntry[];
  enable(id: string): Promise<boolean>;
  disable(id: string): Promise<boolean>;
  subscribe?(listener: () => void): () => void;
}

export interface ManagedPluginSettingsState extends ManagedPluginSettingsEntry {
  /** Source-qualified identity used by settings controls. */
  key: string;
  sourceId: string;
}

interface RegisteredSource {
  source: ManagedPluginSettingsSource;
  unsubscribe?: () => void;
}

/**
 * Presentation-facing registry for managed plugin settings. Consumers retain
 * plugin lifecycle, persistence, provenance, and failure policy.
 */
export class ManagedPluginSettingsRegistry {
  states = $state<ManagedPluginSettingsState[]>([]);

  readonly #sources = new Map<string, RegisteredSource>();

  registerSource(source: ManagedPluginSettingsSource): () => void {
    if (!source.id) throw new Error("Managed plugin sources require an id");
    if (this.#sources.has(source.id)) {
      throw new Error(`Duplicate managed plugin source "${source.id}"`);
    }

    const registered: RegisteredSource = { source };
    this.#sources.set(source.id, registered);
    registered.unsubscribe = source.subscribe?.(() => this.#publish());
    this.#publish();

    return () => {
      const current = this.#sources.get(source.id);
      if (current !== registered) return;
      current.unsubscribe?.();
      this.#sources.delete(source.id);
      this.#publish();
    };
  }

  async enable(key: string): Promise<boolean> {
    const resolved = this.#resolve(key);
    if (!resolved) return false;
    const enabled = await resolved.source.enable(resolved.id);
    this.#publish();
    return enabled;
  }

  async disable(key: string): Promise<boolean> {
    const resolved = this.#resolve(key);
    if (!resolved || resolved.entry.required) return false;
    const disabled = await resolved.source.disable(resolved.id);
    this.#publish();
    return disabled;
  }

  dispose(): void {
    for (const registered of this.#sources.values()) {
      registered.unsubscribe?.();
    }
    this.#sources.clear();
    this.#publish();
  }

  #resolve(key: string): {
    source: ManagedPluginSettingsSource;
    id: string;
    entry: ManagedPluginSettingsEntry;
  } | null {
    const state = this.states.find((entry) => entry.key === key);
    const source = state ? this.#sources.get(state.sourceId)?.source : null;
    if (!state || !source) return null;
    return { source, id: state.id, entry: state };
  }

  #publish(): void {
    this.states = [...this.#sources.values()].flatMap(({ source }) =>
      source.getEntries().map((entry) => ({
        ...entry,
        key: `${source.id}:${entry.id}`,
        sourceId: source.id,
      })),
    );
  }
}

export function createAppShellManagedPluginSource(
  manager: AppShellPluginManager,
): ManagedPluginSettingsSource {
  return {
    id: "app-shell",
    getEntries: () =>
      manager.states.map((state) => ({
        ...state,
        distribution: "bundled" as const,
      })),
    enable: (id) => manager.enable(id),
    disable: (id) => manager.disable(id),
    subscribe(listener) {
      const change = manager.on("change", listener);
      const error = manager.on("error", listener);
      const ready = manager.on("ready", listener);
      return () => {
        manager.offref(change);
        manager.offref(error);
        manager.offref(ready);
      };
    },
  };
}
