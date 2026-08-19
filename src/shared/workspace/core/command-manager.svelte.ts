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

export interface PaletteTabPersistence {
  load(): string | null;
  save(tab: string): void;
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

export const COMMAND_PALETTE_TAB_ALL = "all";
export const COMMAND_PALETTE_TAB_ACTIONS = "actions";
export const COMMAND_PALETTE_TAB_SETTINGS = "settings";
export const COMMAND_PALETTE_TAB_STORAGE_KEY =
  "ui-workspace-command-palette.tab";

export const ALL_TAB_EMPTY_LIMITS = {
  actions: 6,
  settings: 5,
  provider: 5,
} as const;

export interface CommandPaletteTab {
  id: string;
  label: string;
  order?: number;
}

export interface CommandPaletteSearchOptions {
  tab?: string;
}

export interface CommandPaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  hotkeys?: Hotkey[];
  providerId: string;
  tab?: string;
  group?: string;
  trailing?: string;
  run(): void | Promise<unknown>;
}

export interface CommandPaletteProvider {
  id: string;
  prefix?: string;
  tab?: CommandPaletteTab;
  emptyQueryLimit?: number;
  search(
    query: string,
    context: AppShellCommandContext,
  ): CommandPaletteItem[] | Promise<CommandPaletteItem[]>;
}

export interface CommandPaletteGroup {
  heading: string;
  items: CommandPaletteItem[];
}

export function groupPaletteItems(
  items: CommandPaletteItem[],
): CommandPaletteGroup[] {
  const groups = new Map<string, CommandPaletteItem[]>();
  const order: string[] = [];
  for (const item of items) {
    const heading = item.group?.trim() ?? "";
    if (!groups.has(heading)) {
      groups.set(heading, []);
      order.push(heading);
    }
    groups.get(heading)?.push(item);
  }
  return order.map((heading) => ({
    heading,
    items: groups.get(heading) ?? [],
  }));
}

export function actionPaletteGroup(command: AppShellCommand): string {
  return command.sourcePlugin?.trim() || command.category?.trim() || "Commands";
}

function limitItems(
  items: CommandPaletteItem[],
  limit?: number,
): CommandPaletteItem[] {
  return limit == null ? items : items.slice(0, limit);
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
  paletteTab = $state(COMMAND_PALETTE_TAB_ALL);

  readonly #events = new WorkspaceEventDispatcher<CommandManagerEventMap>();
  readonly #scopes: CommandKeymapScope[] = [];
  #persistence?: HotkeyPersistence;
  readonly #paletteTabPersistence: PaletteTabPersistence;
  #rememberedTab: string | null = null;

  constructor(
    readonly app: AppShellController,
    persistence?: HotkeyPersistence,
    paletteTabPersistence: PaletteTabPersistence = createLocalStoragePaletteTabPersistence(),
  ) {
    this.#persistence = persistence;
    this.#paletteTabPersistence = paletteTabPersistence;
    this.#rememberedTab = paletteTabPersistence.load();
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

  listPaletteTabs(): CommandPaletteTab[] {
    const tabs = new Map<string, CommandPaletteTab>();
    tabs.set(COMMAND_PALETTE_TAB_ALL, {
      id: COMMAND_PALETTE_TAB_ALL,
      label: "All",
      order: 0,
    });
    tabs.set(COMMAND_PALETTE_TAB_ACTIONS, {
      id: COMMAND_PALETTE_TAB_ACTIONS,
      label: "Actions",
      order: 30,
    });
    if (this.app.settings.sections.length > 0) {
      tabs.set(COMMAND_PALETTE_TAB_SETTINGS, {
        id: COMMAND_PALETTE_TAB_SETTINGS,
        label: "Settings",
        order: 40,
      });
    }
    for (const provider of this.paletteProviders) {
      if (!provider.tab) continue;
      tabs.set(provider.tab.id, {
        ...provider.tab,
        order: provider.tab.order ?? 20,
      });
    }
    return [...tabs.values()].sort(
      (left, right) =>
        (left.order ?? 0) - (right.order ?? 0) ||
        left.label.localeCompare(right.label),
    );
  }

  resolvePaletteTab(tab?: string): string {
    if (!tab || tab === COMMAND_PALETTE_TAB_ALL) {
      return COMMAND_PALETTE_TAB_ALL;
    }
    return this.listPaletteTabs().some((entry) => entry.id === tab)
      ? tab
      : COMMAND_PALETTE_TAB_ALL;
  }

  async searchPalette(
    query: string,
    options: CommandPaletteSearchOptions = {},
  ): Promise<CommandPaletteItem[]> {
    const tab = this.resolvePaletteTab(options.tab ?? this.paletteTab);
    const normalized = query.trim().toLocaleLowerCase();
    const empty = normalized.length === 0;
    const context = this.createContext("palette");
    const extraTabs = this.listPaletteTabs().filter(
      (entry) => entry.id !== COMMAND_PALETTE_TAB_ALL,
    );
    const curated =
      empty && tab === COMMAND_PALETTE_TAB_ALL && extraTabs.length > 1;
    const actions = this.commands
      .filter((command) => this.isAvailable(command, context))
      .filter((command) =>
        `${command.title} ${command.name ?? ""} ${command.category ?? ""} ${command.sourcePlugin ?? ""}`
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
          tab: COMMAND_PALETTE_TAB_ACTIONS,
          group: actionPaletteGroup(command),
          run: () => this.execute(command.id, { source: "palette" }),
        }),
      );
    const provided = await Promise.all(
      this.paletteProviders
        .filter(
          (provider) =>
            !provider.prefix || query.trimStart().startsWith(provider.prefix),
        )
        .map(async (provider) => {
          const items = await provider.search(query, context);
          return items.map(
            (item): CommandPaletteItem => ({
              ...item,
              tab: item.tab ?? provider.tab?.id ?? COMMAND_PALETTE_TAB_ACTIONS,
              group: item.group,
            }),
          );
        }),
    );
    const providerItems = provided.flat();
    const settings = this.listSettingsPaletteItems(query);

    if (tab === COMMAND_PALETTE_TAB_ACTIONS) {
      return [
        ...actions,
        ...providerItems.filter(
          (item) =>
            (item.tab ?? COMMAND_PALETTE_TAB_ACTIONS) ===
            COMMAND_PALETTE_TAB_ACTIONS,
        ),
      ];
    }
    if (tab === COMMAND_PALETTE_TAB_SETTINGS) {
      return settings;
    }
    if (tab !== COMMAND_PALETTE_TAB_ALL) {
      return providerItems.filter((item) => item.tab === tab);
    }

    const chunks: CommandPaletteItem[] = [];
    for (const provider of this.paletteProviders) {
      const providerTab = provider.tab?.id;
      if (!providerTab) continue;
      const limit = curated
        ? (provider.emptyQueryLimit ?? ALL_TAB_EMPTY_LIMITS.provider)
        : undefined;
      chunks.push(
        ...limitItems(
          providerItems.filter((item) => item.tab === providerTab),
          limit,
        ),
      );
    }
    chunks.push(
      ...limitItems(
        [
          ...actions,
          ...providerItems.filter(
            (item) =>
              (item.tab ?? COMMAND_PALETTE_TAB_ACTIONS) ===
              COMMAND_PALETTE_TAB_ACTIONS,
          ),
        ],
        curated ? ALL_TAB_EMPTY_LIMITS.actions : undefined,
      ),
    );
    chunks.push(
      ...limitItems(
        settings,
        curated ? ALL_TAB_EMPTY_LIMITS.settings : undefined,
      ),
    );
    return chunks;
  }

  listSettingsPaletteItems(query: string): CommandPaletteItem[] {
    return this.app.settings.listPaletteEntries(query).map((result) => ({
      id: `settings:${result.sectionId}:${result.fieldId ?? "section"}:${result.path.join("/")}`,
      title: result.title,
      subtitle: result.path.join(" › "),
      icon: "settings",
      providerId: "settings",
      tab: COMMAND_PALETTE_TAB_SETTINGS,
      group: result.path[0] ?? "Settings",
      run: () => {
        this.app.settings.open({
          sectionId: result.sectionId,
          fieldId: result.fieldId ?? undefined,
        });
      },
    }));
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

  selectPaletteTab(tab: string): void {
    this.paletteTab = this.resolvePaletteTab(tab);
    this.#rememberedTab = this.paletteTab;
    this.#paletteTabPersistence.save(this.paletteTab);
  }

  openPalette(options: CommandPaletteSearchOptions = {}): void {
    this.paletteOpen = true;
    if (options.tab !== undefined) {
      this.selectPaletteTab(options.tab);
      return;
    }
    this.paletteTab = this.resolvePaletteTab(
      this.#rememberedTab ?? this.paletteTab,
    );
  }

  closePalette(): void {
    this.paletteOpen = false;
  }

  destroy(): void {
    this.commands = [];
    this.paletteProviders = [];
    this.paletteOpen = false;
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

function resolveBrowserStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function createLocalStoragePaletteTabPersistence(
  key = COMMAND_PALETTE_TAB_STORAGE_KEY,
  storage?: Storage,
): PaletteTabPersistence {
  return {
    load() {
      try {
        return resolveBrowserStorage(storage)?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    save(tab) {
      try {
        resolveBrowserStorage(storage)?.setItem(key, tab);
      } catch {
        // Private mode or quota must not block the palette.
      }
    },
  };
}

export function createMemoryPaletteTabPersistence(
  initial?: string | null,
): PaletteTabPersistence {
  let value = initial ?? null;
  return {
    load: () => value,
    save(tab) {
      value = tab;
    },
  };
}
