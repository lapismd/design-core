import type { AppShellController } from "./app-shell-controller.svelte.js";
import { cloneSerializable } from "./serializable.js";
import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";
import type { WorkspaceLeaf, WorkspaceView } from "./workspace-view.js";

export type HotkeyModifier = "Mod" | "Ctrl" | "Meta" | "Alt" | "Shift";

export interface Hotkey {
  modifiers: HotkeyModifier[];
  key: string;
}

export type HotkeyOverrides = Record<string, Hotkey[]>;

export interface HotkeyPersistence {
  load(): Promise<unknown | null>;
  save(overrides: HotkeyOverrides): Promise<void>;
}

export interface AppShellCommandContext {
  app: AppShellController;
  leaf: WorkspaceLeaf | null;
  view: WorkspaceView | null;
  source: "api" | "hotkey" | "palette";
  data?: unknown;
}

export interface AppShellCommand {
  id: string;
  name?: string;
  title: string;
  category?: string;
  icon?: string;
  sourcePlugin?: string;
  hotkeys?: Hotkey[];
  when?: (context: AppShellCommandContext) => boolean;
  callback(
    context: AppShellCommandContext,
  ): void | boolean | Promise<void | boolean>;
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  hotkeys?: Hotkey[];
  providerId: string;
  run(): void | Promise<unknown>;
}

export interface CommandPaletteProvider {
  id: string;
  prefix?: string;
  search(
    query: string,
    context: AppShellCommandContext,
  ): CommandPaletteItem[] | Promise<CommandPaletteItem[]>;
}

export interface CommandConflict {
  hotkey: Hotkey;
  commandIds: string[];
}

export interface CommandHotkeyAssignment {
  commandId: string;
  command: AppShellCommand;
  hotkeys: Hotkey[];
  customized: boolean;
}

export interface CommandManagerEventMap {
  change: [];
  execute: [command: AppShellCommand, context: AppShellCommandContext];
  "hotkeys-change": [overrides: HotkeyOverrides];
  "persistence-error": [event: { operation: "load" | "save"; error: unknown }];
}

function normalizeKey(key: string): string {
  return key.length === 1 ? key.toLocaleLowerCase() : key;
}

function normalizeHotkey(hotkey: Hotkey): Hotkey {
  const modifiers = [...new Set(hotkey.modifiers)].sort();
  return { modifiers, key: normalizeKey(hotkey.key) };
}

export function getHotkeyId(hotkey: Hotkey): string {
  const normalized = normalizeHotkey(hotkey);
  return `${normalized.modifiers.join("+")}+${normalized.key}`;
}

function isHotkey(value: unknown): value is Hotkey {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<Hotkey>;
  return (
    typeof input.key === "string" &&
    Array.isArray(input.modifiers) &&
    input.modifiers.every((modifier) =>
      ["Mod", "Ctrl", "Meta", "Alt", "Shift"].includes(String(modifier)),
    )
  );
}

function eventMatchesHotkey(event: KeyboardEvent, hotkey: Hotkey): boolean {
  const modifiers = new Set(hotkey.modifiers);
  const platformMod =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform)
      ? event.metaKey
      : event.ctrlKey;
  return (
    normalizeKey(event.key) === normalizeKey(hotkey.key) &&
    event.ctrlKey ===
      (modifiers.has("Ctrl") || (modifiers.has("Mod") && !event.metaKey)) &&
    event.metaKey ===
      (modifiers.has("Meta") ||
        (modifiers.has("Mod") && platformMod && event.metaKey)) &&
    event.altKey === modifiers.has("Alt") &&
    event.shiftKey === modifiers.has("Shift")
  );
}

export class CommandKeymapScope {
  readonly #bindings: Array<{
    hotkey: Hotkey;
    handler: (event: KeyboardEvent) => boolean | void | Promise<boolean | void>;
  }> = [];
  readonly #captureHandlers: Array<
    (event: KeyboardEvent) => boolean | void | Promise<boolean | void>
  > = [];

  register(
    hotkey: Hotkey,
    handler: (event: KeyboardEvent) => boolean | void | Promise<boolean | void>,
  ): () => void {
    const binding = { hotkey: normalizeHotkey(hotkey), handler };
    this.#bindings.push(binding);
    return () => {
      const index = this.#bindings.indexOf(binding);
      if (index >= 0) this.#bindings.splice(index, 1);
    };
  }

  registerAny(
    handler: (event: KeyboardEvent) => boolean | void | Promise<boolean | void>,
  ): () => void {
    this.#captureHandlers.push(handler);
    return () => {
      const index = this.#captureHandlers.indexOf(handler);
      if (index >= 0) this.#captureHandlers.splice(index, 1);
    };
  }

  async handle(event: KeyboardEvent): Promise<boolean> {
    for (const handler of [...this.#captureHandlers].reverse()) {
      if ((await handler(event)) !== false) return true;
    }
    for (const binding of [...this.#bindings].reverse()) {
      if (!eventMatchesHotkey(event, binding.hotkey)) continue;
      if ((await binding.handler(event)) !== false) return true;
    }
    return false;
  }
}

export class CommandManager {
  commands = $state<AppShellCommand[]>([]);
  paletteProviders = $state<CommandPaletteProvider[]>([]);
  hotkeyOverrides = $state<HotkeyOverrides>({});
  ready = $state(false);
  paletteOpen = $state(false);

  readonly #events = new WorkspaceEventDispatcher<CommandManagerEventMap>();
  readonly #scopes: CommandKeymapScope[] = [];
  #persistence?: HotkeyPersistence;

  constructor(
    readonly app: AppShellController,
    persistence?: HotkeyPersistence,
  ) {
    this.#persistence = persistence;
  }

  on<Name extends keyof CommandManagerEventMap>(
    name: Name,
    listener: (...args: CommandManagerEventMap[Name]) => void,
  ): WorkspaceEventRef<CommandManagerEventMap, Name> {
    return this.#events.on(name, listener);
  }

  offref<Name extends keyof CommandManagerEventMap>(
    ref: WorkspaceEventRef<CommandManagerEventMap, Name>,
  ): void {
    this.#events.offref(ref);
  }

  register(command: AppShellCommand): () => void {
    if (this.commands.some((candidate) => candidate.id === command.id)) {
      throw new Error(`A command is already registered for "${command.id}"`);
    }
    this.commands = [...this.commands, command];
    this.#events.trigger("change");
    return () => this.unregister(command.id);
  }

  unregister(id: string): void {
    const next = this.commands.filter((command) => command.id !== id);
    if (next.length === this.commands.length) return;
    this.commands = next;
    this.#events.trigger("change");
  }

  registerPaletteProvider(provider: CommandPaletteProvider): () => void {
    if (this.paletteProviders.some((entry) => entry.id === provider.id)) {
      throw new Error(
        `A command palette provider is already registered for "${provider.id}"`,
      );
    }
    this.paletteProviders = [...this.paletteProviders, provider];
    this.#events.trigger("change");
    return () => {
      this.paletteProviders = this.paletteProviders.filter(
        (entry) => entry.id !== provider.id,
      );
      this.#events.trigger("change");
    };
  }

  getCommand(id: string): AppShellCommand | null {
    return this.commands.find((command) => command.id === id) ?? null;
  }

  getHotkeys(id: string): Hotkey[] {
    if (Object.hasOwn(this.hotkeyOverrides, id)) {
      return cloneSerializable(this.hotkeyOverrides[id] ?? []);
    }
    return cloneSerializable(this.getCommand(id)?.hotkeys ?? []);
  }

  setHotkeys(id: string, hotkeys: Hotkey[]): boolean {
    if (!this.getCommand(id)) return false;
    this.hotkeyOverrides = {
      ...this.hotkeyOverrides,
      [id]: hotkeys.map(normalizeHotkey),
    };
    this.#events.trigger("hotkeys-change", this.getHotkeyOverrides());
    void this.saveHotkeys();
    return true;
  }

  addHotkey(id: string, hotkey: Hotkey): boolean {
    if (!this.getCommand(id)) return false;
    const normalized = normalizeHotkey(hotkey);
    const current = this.getHotkeys(id);
    if (
      current.some(
        (candidate) => getHotkeyId(candidate) === getHotkeyId(normalized),
      )
    ) {
      return true;
    }
    return this.setHotkeys(id, [...current, normalized]);
  }

  removeHotkey(id: string, hotkey: Hotkey): boolean {
    if (!this.getCommand(id)) return false;
    const target = getHotkeyId(hotkey);
    return this.setHotkeys(
      id,
      this.getHotkeys(id).filter(
        (candidate) => getHotkeyId(candidate) !== target,
      ),
    );
  }

  resetHotkeys(id: string): void {
    if (!Object.hasOwn(this.hotkeyOverrides, id)) return;
    const next = { ...this.hotkeyOverrides };
    delete next[id];
    this.hotkeyOverrides = next;
    this.#events.trigger("hotkeys-change", this.getHotkeyOverrides());
    void this.saveHotkeys();
  }

  getHotkeyOverrides(): HotkeyOverrides {
    return cloneSerializable(this.hotkeyOverrides);
  }

  getHotkeyAssignments(): CommandHotkeyAssignment[] {
    return this.commands.map((command) => ({
      commandId: command.id,
      command,
      hotkeys: this.getHotkeys(command.id),
      customized: Object.hasOwn(this.hotkeyOverrides, command.id),
    }));
  }

  getConflicts(): CommandConflict[] {
    const byHotkey = new Map<string, { hotkey: Hotkey; ids: string[] }>();
    for (const command of this.commands) {
      for (const hotkey of this.getHotkeys(command.id)) {
        const key = getHotkeyId(hotkey);
        const entry = byHotkey.get(key) ?? {
          hotkey: normalizeHotkey(hotkey),
          ids: [],
        };
        entry.ids.push(command.id);
        byHotkey.set(key, entry);
      }
    }
    return [...byHotkey.values()]
      .filter((entry) => entry.ids.length > 1)
      .map((entry) => ({ hotkey: entry.hotkey, commandIds: entry.ids }));
  }

  isAvailable(
    command: AppShellCommand,
    context = this.createContext("api"),
  ): boolean {
    return command.when?.(context) ?? true;
  }

  async execute(
    id: string,
    input: Partial<Omit<AppShellCommandContext, "app">> = {},
  ): Promise<boolean> {
    const command = this.getCommand(id);
    if (!command) return false;
    const context: AppShellCommandContext = {
      ...this.createContext(input.source ?? "api"),
      ...input,
      app: this.app,
    };
    if (!this.isAvailable(command, context)) return false;
    const result = await command.callback(context);
    if (result === false) return false;
    this.#events.trigger("execute", command, context);
    return true;
  }

  createContext(
    source: AppShellCommandContext["source"],
    data?: unknown,
  ): AppShellCommandContext {
    const leaf = this.app.workspace.activeLeaf;
    return {
      app: this.app,
      leaf,
      view: leaf ? this.app.views.getViewForLeaf(leaf) : null,
      source,
      data,
    };
  }

  pushScope(scope: CommandKeymapScope): () => void {
    this.#scopes.push(scope);
    return () => {
      const index = this.#scopes.indexOf(scope);
      if (index >= 0) this.#scopes.splice(index, 1);
    };
  }

  async handleKeydown(event: KeyboardEvent): Promise<boolean> {
    for (const scope of [...this.#scopes].reverse()) {
      if (await scope.handle(event)) {
        event.preventDefault();
        return true;
      }
    }
    for (const command of this.commands) {
      if (
        !this.isAvailable(command, this.createContext("hotkey")) ||
        !this.getHotkeys(command.id).some((hotkey) =>
          eventMatchesHotkey(event, hotkey),
        )
      ) {
        continue;
      }
      event.preventDefault();
      return this.execute(command.id, { source: "hotkey" });
    }
    return false;
  }

  async searchPalette(query: string): Promise<CommandPaletteItem[]> {
    const normalized = query.trim().toLocaleLowerCase();
    const context = this.createContext("palette");
    const commands = this.commands
      .filter((command) => this.isAvailable(command, context))
      .filter((command) =>
        `${command.title} ${command.name ?? ""} ${command.category ?? ""}`
          .toLocaleLowerCase()
          .includes(normalized),
      )
      .map(
        (command): CommandPaletteItem => ({
          id: command.id,
          title: command.title,
          subtitle: command.category,
          icon: command.icon,
          hotkeys: this.getHotkeys(command.id),
          providerId: "commands",
          run: () => this.execute(command.id, { source: "palette" }),
        }),
      );
    const provided = await Promise.all(
      this.paletteProviders
        .filter(
          (provider) =>
            !provider.prefix || query.trimStart().startsWith(provider.prefix),
        )
        .map((provider) => provider.search(query, context)),
    );
    return [...commands, ...provided.flat()];
  }

  async loadHotkeys(): Promise<void> {
    try {
      const value = await this.#persistence?.load();
      if (value && typeof value === "object") {
        this.hotkeyOverrides = Object.fromEntries(
          Object.entries(value as Record<string, unknown>)
            .filter(([, hotkeys]) => Array.isArray(hotkeys))
            .map(([id, hotkeys]) => [
              id,
              (hotkeys as unknown[])
                .filter(isHotkey)
                .map((hotkey) => normalizeHotkey(hotkey)),
            ]),
        );
      }
    } catch (error) {
      this.#events.trigger("persistence-error", {
        operation: "load",
        error,
      });
    } finally {
      this.ready = true;
      this.#events.trigger("change");
    }
  }

  async saveHotkeys(): Promise<void> {
    if (!this.#persistence) return;
    try {
      await this.#persistence.save(this.getHotkeyOverrides());
    } catch (error) {
      this.#events.trigger("persistence-error", {
        operation: "save",
        error,
      });
    }
  }

  openPalette(): void {
    this.paletteOpen = true;
  }

  closePalette(): void {
    this.paletteOpen = false;
  }

  destroy(): void {
    this.commands = [];
    this.paletteProviders = [];
    this.#scopes.splice(0);
    this.#events.clear();
  }
}

export function createLocalStorageHotkeyPersistence(
  key: string,
  storage?: Storage,
): HotkeyPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(overrides) {
      resolveStorage().setItem(key, JSON.stringify(overrides));
    },
  };
}
