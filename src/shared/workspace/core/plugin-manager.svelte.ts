import type { AppShellController } from "./app-shell-controller.svelte.js";
import type {
  AppShellCommand,
  CommandPaletteProvider,
} from "./command-manager.svelte.js";
import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";
import type { WorkspaceRibbonItem, WorkspaceStatusItem } from "./types.js";
import type {
  WorkspaceClassViewRegistration,
  WorkspaceView,
  WorkspaceViewFactory,
} from "./workspace-view.js";
import type { EditorViewContribution } from "./editor-view-registry.js";
import type { ConfigurationOptionSource } from "../settings/configuration.js";
import type { WorkspaceSettingsSection } from "../settings/types.js";
import type { AppShellOverlayContribution } from "./app-shell-ui-registry.svelte.js";
import type { CommandKeymapScope } from "./command-manager.svelte.js";
import type {
  WorkspaceDiagnosticCollection,
  WorkspaceDiagnosticCollectionOptions,
} from "../problems/types.js";

export type AppShellPluginStatus =
  | "disabled"
  | "enabling"
  | "enabled"
  | "disabling"
  | "failed";

export interface AppShellPluginConstructor {
  new (app: AppShellController, id: string, options: never): AppShellPlugin;
}

export interface AppShellPluginDescriptor<Options = unknown> {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
  required?: boolean;
  plugin: AppShellPluginConstructor;
  enabled?: boolean;
  options?: Options;
}

export interface PluginEnablementPersistence {
  load(): Promise<unknown | null>;
  save(enabledById: Record<string, boolean>): Promise<void>;
}

export interface AppShellPluginState {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  required: boolean;
  status: AppShellPluginStatus;
  enabled: boolean;
  error?: unknown;
}

export interface AppShellPluginManagerEventMap {
  change: [state: AppShellPluginState];
  error: [state: AppShellPluginState];
  ready: [];
  "persistence-error": [event: { operation: "load" | "save"; error: unknown }];
  "persistence-success": [event: { operation: "load" | "save" }];
}

export abstract class AppShellPlugin<Options = unknown> {
  readonly #disposers: Array<() => void> = [];

  constructor(
    readonly app: AppShellController,
    readonly id: string,
    readonly options: Options,
  ) {}

  onload(): void | Promise<void> {}

  onunload(): void | Promise<void> {}

  protected register(disposer: () => void): void {
    this.#disposers.push(disposer);
  }

  protected addCommand(command: AppShellCommand): void {
    this.register(
      this.app.commands.register({
        ...command,
        sourcePlugin: command.sourcePlugin ?? this.id,
      }),
    );
  }

  protected registerPaletteProvider(provider: CommandPaletteProvider): void {
    this.register(this.app.commands.registerPaletteProvider(provider));
  }

  protected registerView<View extends WorkspaceView>(
    type: string,
    factory: WorkspaceViewFactory<View>,
    options?: WorkspaceClassViewRegistration,
  ): void {
    this.register(this.app.views.register(type, factory, options));
  }

  protected registerEditorView(contribution: EditorViewContribution): void {
    this.register(
      this.app.editorViews.register({
        ...contribution,
        pluginId: contribution.pluginId ?? this.id,
        source: contribution.source ?? "plugin",
      }),
    );
  }

  protected registerSettingsSection(section: WorkspaceSettingsSection): void {
    this.register(
      this.app.configuration.register({
        ...section,
        navigationGroupId: section.navigationGroupId ?? "core-plugins",
        sourcePluginId: section.sourcePluginId ?? this.id,
      }),
    );
  }

  protected registerConfigurationOptionSource(
    source: ConfigurationOptionSource,
  ): void {
    this.register(this.app.configuration.optionSources.register(source));
  }

  protected addRibbonItem(item: WorkspaceRibbonItem): void {
    this.register(this.app.ribbon.addItem(item));
  }

  protected addStatusBarItem(item: WorkspaceStatusItem): void {
    this.register(this.app.status.addItem(item));
  }

  protected registerOverlay(contribution: AppShellOverlayContribution): void {
    this.register(this.app.ui.registerOverlay(contribution));
  }

  /** Create an owner-scoped collection that is disposed with this plugin. */
  protected createDiagnosticCollection(
    id: string,
    options: WorkspaceDiagnosticCollectionOptions = {},
  ): WorkspaceDiagnosticCollection {
    const collection = this.app.diagnostics.createCollection(
      `${this.id}:${id}`,
      options,
    );
    this.register(() => collection.dispose());
    return collection;
  }

  protected pushKeymapScope(scope: CommandKeymapScope): void {
    this.register(this.app.commands.pushScope(scope));
  }

  /** @internal */
  async load(): Promise<void> {
    try {
      await this.onload();
    } catch (error) {
      await this.disposeRegistrations();
      throw error;
    }
  }

  /** @internal */
  async unload(): Promise<void> {
    let firstError: unknown;
    try {
      await this.onunload();
    } catch (error) {
      firstError = error;
    }
    try {
      await this.disposeRegistrations();
    } catch (error) {
      firstError ??= error;
    }
    if (firstError) throw firstError;
  }

  private async disposeRegistrations(): Promise<void> {
    let firstError: unknown;
    for (const dispose of this.#disposers.splice(0).reverse()) {
      try {
        await dispose();
      } catch (error) {
        firstError ??= error;
      }
    }
    if (firstError) throw firstError;
  }
}

interface PluginEntry {
  descriptor: AppShellPluginDescriptor;
  instance: AppShellPlugin | null;
  state: AppShellPluginState;
}

export class AppShellPluginManager {
  states = $state<AppShellPluginState[]>([]);
  ready = $state(false);

  readonly #entries = new Map<string, PluginEntry>();
  readonly #events =
    new WorkspaceEventDispatcher<AppShellPluginManagerEventMap>();

  constructor(
    readonly app: AppShellController,
    descriptors: AppShellPluginDescriptor[] = [],
    readonly persistence?: PluginEnablementPersistence,
  ) {
    for (const descriptor of descriptors) {
      if (!descriptor.id) throw new Error("Plugin descriptors require an id");
      if (this.#entries.has(descriptor.id)) {
        throw new Error(`Duplicate plugin id "${descriptor.id}"`);
      }
      this.#entries.set(descriptor.id, {
        descriptor,
        instance: null,
        state: {
          id: descriptor.id,
          name: descriptor.name ?? descriptor.id,
          description: descriptor.description,
          icon: descriptor.icon,
          required: descriptor.required ?? false,
          status: "disabled",
          enabled: descriptor.required ? true : (descriptor.enabled ?? true),
        },
      });
    }
    this.#publish();
  }

  on<Name extends keyof AppShellPluginManagerEventMap>(
    name: Name,
    listener: (...args: AppShellPluginManagerEventMap[Name]) => void,
  ): WorkspaceEventRef<AppShellPluginManagerEventMap, Name> {
    return this.#events.on(name, listener);
  }

  offref<Name extends keyof AppShellPluginManagerEventMap>(
    ref: WorkspaceEventRef<AppShellPluginManagerEventMap, Name>,
  ): void {
    this.#events.offref(ref);
  }

  get(id: string): AppShellPluginState | null {
    const state = this.states.find((entry) => entry.id === id);
    return state ? { ...state } : null;
  }

  async start(): Promise<void> {
    if (this.ready) return;
    try {
      const persisted = await this.persistence?.load();
      if (persisted && typeof persisted === "object") {
        for (const [id, enabled] of Object.entries(
          persisted as Record<string, unknown>,
        )) {
          const entry = this.#entries.get(id);
          if (
            entry &&
            !entry.descriptor.required &&
            typeof enabled === "boolean"
          ) {
            entry.state.enabled = enabled;
          }
        }
      }
      if (this.persistence) {
        this.#events.trigger("persistence-success", { operation: "load" });
      }
    } catch (error) {
      this.#events.trigger("persistence-error", {
        operation: "load",
        error,
      });
    }
    for (const entry of this.#entries.values()) {
      if (entry.state.enabled) await this.#enable(entry, false);
    }
    this.ready = true;
    this.#publish();
    this.#events.trigger("ready");
  }

  async enable(id: string): Promise<boolean> {
    const entry = this.#entries.get(id);
    if (!entry) return false;
    const enabled = await this.#enable(entry, true);
    if (enabled) await this.#save();
    return enabled;
  }

  async disable(id: string): Promise<boolean> {
    const entry = this.#entries.get(id);
    if (!entry || entry.descriptor.required) return false;
    const disabled = await this.#disable(entry);
    if (disabled) await this.#save();
    return disabled;
  }

  async stop(): Promise<void> {
    for (const entry of [...this.#entries.values()].reverse()) {
      await this.#disable(entry, false);
    }
    this.ready = false;
    this.#publish();
  }

  async #enable(entry: PluginEntry, persistChoice: boolean): Promise<boolean> {
    if (entry.state.status === "enabled") return true;
    entry.state = {
      ...this.#metadata(entry),
      status: "enabling",
      enabled: true,
    };
    this.#changed(entry);
    const PluginClass = entry.descriptor.plugin as unknown as new (
      app: AppShellController,
      id: string,
      options: unknown,
    ) => AppShellPlugin;
    const instance = new PluginClass(
      this.app,
      entry.descriptor.id,
      entry.descriptor.options,
    );
    entry.instance = instance;
    try {
      await instance.load();
      entry.state = {
        ...this.#metadata(entry),
        status: "enabled",
        enabled: true,
      };
      this.#changed(entry);
      return true;
    } catch (error) {
      entry.instance = null;
      entry.state = {
        ...this.#metadata(entry),
        status: "failed",
        enabled: persistChoice ? false : entry.state.enabled,
        error,
      };
      this.#changed(entry);
      this.#events.trigger("error", { ...entry.state });
      return false;
    }
  }

  async #disable(entry: PluginEntry, markDisabled = true): Promise<boolean> {
    if (!entry.instance) {
      if (markDisabled) {
        entry.state = {
          ...this.#metadata(entry),
          status: "disabled",
          enabled: false,
        };
        this.#changed(entry);
      }
      return true;
    }
    entry.state = {
      ...this.#metadata(entry),
      status: "disabling",
      enabled: markDisabled ? false : entry.state.enabled,
    };
    this.#changed(entry);
    try {
      await entry.instance.unload();
      entry.instance = null;
      entry.state = {
        ...this.#metadata(entry),
        status: "disabled",
        enabled: markDisabled ? false : entry.state.enabled,
      };
      this.#changed(entry);
      return true;
    } catch (error) {
      entry.state = {
        ...this.#metadata(entry),
        status: "failed",
        enabled: false,
        error,
      };
      this.#changed(entry);
      this.#events.trigger("error", { ...entry.state });
      return false;
    }
  }

  async #save(): Promise<void> {
    if (!this.persistence) return;
    try {
      await this.persistence.save(
        Object.fromEntries(
          [...this.#entries].map(([id, entry]) => [id, entry.state.enabled]),
        ),
      );
      this.#events.trigger("persistence-success", { operation: "save" });
    } catch (error) {
      this.#events.trigger("persistence-error", {
        operation: "save",
        error,
      });
    }
  }

  #changed(entry: PluginEntry): void {
    this.#publish();
    this.#events.trigger("change", { ...entry.state });
  }

  #publish(): void {
    this.states = [...this.#entries.values()].map((entry) => ({
      ...entry.state,
    }));
  }

  #metadata(
    entry: PluginEntry,
  ): Pick<
    AppShellPluginState,
    "id" | "name" | "description" | "icon" | "required"
  > {
    return {
      id: entry.descriptor.id,
      name: entry.descriptor.name ?? entry.descriptor.id,
      description: entry.descriptor.description,
      icon: entry.descriptor.icon,
      required: entry.descriptor.required ?? false,
    };
  }
}

export function createLocalStoragePluginEnablementPersistence(
  key: string,
  storage?: Storage,
): PluginEnablementPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(enabledById) {
      resolveStorage().setItem(key, JSON.stringify(enabledById));
    },
  };
}
