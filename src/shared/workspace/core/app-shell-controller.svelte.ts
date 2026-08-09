import type {
  WorkspaceSettingsControllerOptions,
  WorkspaceSettingsPersistence,
  WorkspaceSettingsSection,
} from "../settings/types.js";
import { ConfigurationSchema } from "../settings/configuration.js";
import { WorkspaceSettingsController } from "../settings/settings-controller.svelte.js";
import {
  CommandKeymapScope,
  CommandManager,
  type AppShellCommand,
  type HotkeyPersistence,
} from "./command-manager.svelte.js";
import {
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";
import {
  AppShellPluginManager,
  type AppShellPluginDescriptor,
  type AppShellPluginState,
  type PluginEnablementPersistence,
} from "./plugin-manager.svelte.js";
import { NoticeManager } from "./notice-manager.svelte.js";
import {
  NotificationManager,
  type NotificationPersistence,
} from "./notification-manager.svelte.js";
import { AppShellUiRegistry } from "./app-shell-ui-registry.svelte.js";
import type {
  WorkspaceEventMap,
  WorkspaceLayoutChangeEvent,
  WorkspaceLayoutPersistence,
  WorkspaceAction,
  AppShellApplicationInfo,
  WorkspaceRibbonItem,
  WorkspaceStatusItem,
} from "./types.js";
import { AppWorkspace } from "./app-workspace.js";
import {
  WorkspaceViewManager,
  type WorkspaceClassViewRegistration,
  type WorkspaceViewFactory,
} from "./workspace-view.js";
import {
  workspaceLayoutFromJson,
  workspaceLayoutToJson,
  type WorkspaceJson,
} from "./workspace-json.js";
import {
  WorkspaceShellController,
  type WorkspaceItemRegistry,
} from "./workspace-controller.svelte.js";
import {
  AppShellAppearanceSettings,
  AppShellMobileSettings,
  createBuiltInSettingsNavigationGroups,
  createBuiltInSettingsSections,
} from "./built-in-settings.svelte.js";
import {
  EditorViewRegistry,
  type EditorViewContribution,
} from "./editor-view-registry.js";
import type { WorkspaceResourceOpenError } from "./app-workspace.js";

export interface AppShellLayoutPersistence {
  load(): Promise<unknown | null>;
  save(layout: WorkspaceJson, event: WorkspaceLayoutChangeEvent): Promise<void>;
}

export interface AppShellPersistence {
  layout?: AppShellLayoutPersistence;
  configuration?: WorkspaceSettingsPersistence;
  hotkeys?: HotkeyPersistence;
  plugins?: PluginEnablementPersistence;
  notifications?: NotificationPersistence;
}

export interface AppShellViewRegistration {
  type: string;
  factory: WorkspaceViewFactory;
  options?: WorkspaceClassViewRegistration;
}

export interface AppShellControllerOptions {
  layout?: unknown;
  application?: AppShellApplicationInfo;
  views?: AppShellViewRegistration[];
  configuration?: Omit<WorkspaceSettingsControllerOptions, "persistence">;
  commands?: AppShellCommand[];
  plugins?: AppShellPluginDescriptor[];
  editorViews?: EditorViewContribution[];
  builtInSettings?: boolean;
  persistence?: AppShellPersistence;
  saveDebounceMs?: number;
  notificationSaveDebounceMs?: number;
}

export interface AppShellEventMap extends WorkspaceEventMap {
  ready: [];
  stop: [];
  "plugin-error": [state: AppShellPluginState];
  "resource-open-error": [event: WorkspaceResourceOpenError];
  "notification-persistence-error": [
    event: { operation: "load" | "save"; error: unknown },
  ];
}

const forwardedWorkspaceEvents: Array<keyof WorkspaceEventMap> = [
  "active-tab-change",
  "display-mode-change",
  "focus-mode-change",
  "resize",
  "layout-ready",
  "layout-change",
  "layout-drag-start",
  "layout-drag-end",
  "layout-will-show-overlay",
  "layout-will-drop",
  "layout-did-drop",
  "persistence-error",
];

/**
 * Application-owned shell controller. It coordinates registration and hydration
 * without installing a global and exposes the compatibility renderer only to
 * package components.
 */
export class AppShellController {
  readonly workspace: AppWorkspace;
  readonly views: WorkspaceViewManager;
  readonly editorViews: EditorViewRegistry;
  readonly settings: WorkspaceSettingsController;
  readonly configuration: ConfigurationSchema;
  readonly appearance: AppShellAppearanceSettings;
  readonly mobile: AppShellMobileSettings;
  readonly commands: CommandManager;
  readonly commandPalette: CommandManager;
  readonly keymap: CommandKeymapScope;
  readonly plugins: AppShellPluginManager;
  readonly notifications: NotificationManager;
  readonly notices: NoticeManager;
  readonly ui: AppShellUiRegistry;
  readonly ribbon: WorkspaceItemRegistry<WorkspaceRibbonItem>;
  readonly status: WorkspaceItemRegistry<WorkspaceStatusItem>;
  /** Host and plugin actions shown after the built-in Create Tab action. */
  readonly emptyViewActions: WorkspaceItemRegistry<WorkspaceAction>;
  readonly applicationInfo: Readonly<AppShellApplicationInfo> | null;

  ready = $state(false);
  started = $state(false);
  aboutDialogOpen = $state(false);

  /** @internal Used only by package renderers and compatibility wrappers. */
  readonly renderer: WorkspaceShellController;

  readonly #events = new WorkspaceEventDispatcher<AppShellEventMap>();
  readonly #workspaceDisposers: Array<() => void> = [];
  #startPromise: Promise<void> | null = null;
  #disposed = false;

  constructor(options: AppShellControllerOptions = {}) {
    const layoutPersistence = options.persistence?.layout;
    const bridgePersistence: WorkspaceLayoutPersistence | undefined =
      layoutPersistence
        ? {
            load: async () => {
              const value = await layoutPersistence.load();
              return workspaceLayoutFromJson(value);
            },
            save: async (layout, event) => {
              await layoutPersistence.save(
                workspaceLayoutToJson(layout),
                event,
              );
            },
          }
        : undefined;
    this.renderer = new WorkspaceShellController({
      layout: workspaceLayoutFromJson(options.layout),
      persistence: bridgePersistence,
      saveDebounceMs: options.saveDebounceMs,
    });
    this.notifications = new NotificationManager(
      options.persistence?.notifications,
      options.notificationSaveDebounceMs,
    );
    this.notices = new NoticeManager(this.notifications);
    this.ui = new AppShellUiRegistry();
    this.views = new WorkspaceViewManager(this.renderer);
    this.editorViews = new EditorViewRegistry();
    const builtInSections =
      options.builtInSettings === false ? [] : createBuiltInSettingsSections();
    const builtInNavigationGroups =
      options.builtInSettings === false
        ? []
        : createBuiltInSettingsNavigationGroups();
    const suppliedSections = options.configuration?.sections ?? [];
    const suppliedNavigationGroups =
      options.configuration?.navigationGroups ?? [];
    this.settings = new WorkspaceSettingsController({
      ...(options.configuration ?? {}),
      sections: mergeById(builtInSections, suppliedSections),
      navigationGroups: mergeById(
        builtInNavigationGroups,
        suppliedNavigationGroups,
      ),
      persistence: options.persistence?.configuration,
    });
    this.configuration = new ConfigurationSchema(this.settings);
    this.appearance = new AppShellAppearanceSettings(this.configuration);
    this.mobile = new AppShellMobileSettings(this.configuration);
    this.settings.setOptionSourceLoader((sourceId, context) =>
      this.configuration.optionSources.load(sourceId, context),
    );
    this.configuration.optionSources.register({
      id: "workspace.editorViews",
      load: () =>
        this.editorViews.getAll().map((view) => ({
          value: view.id,
          label: view.label,
          description: view.description,
        })),
    });
    this.workspace = new AppWorkspace(
      this.renderer,
      this.views,
      this.editorViews,
      this.configuration,
      (event) => this.#events.trigger("resource-open-error", event),
    );
    this.commands = new CommandManager(this, options.persistence?.hotkeys);
    this.commandPalette = this.commands;
    this.keymap = new CommandKeymapScope();
    this.commands.pushScope(this.keymap);
    this.ribbon = this.renderer.ribbon;
    this.status = this.renderer.statusBar;
    this.emptyViewActions = this.renderer.emptyViewActions;
    this.applicationInfo = options.application
      ? Object.freeze({ ...options.application })
      : null;

    for (const registration of options.views ?? []) {
      this.views.register(
        registration.type,
        registration.factory,
        registration.options,
      );
    }
    for (const contribution of options.editorViews ?? []) {
      this.editorViews.register(contribution);
    }
    for (const command of options.commands ?? []) {
      this.commands.register(command);
    }
    this.commands.register({
      id: "app-shell:open-command-palette",
      title: "Open command palette",
      category: "App Shell",
      icon: "search",
      hotkeys: [{ modifiers: ["Mod"], key: "p" }],
      callback: () => this.commands.openPalette(),
    });
    this.commands.register({
      id: "app-shell:focus-active-tab",
      title: "Workspace: Focus active tab",
      category: "Workspace",
      icon: "focus",
      when: ({ leaf }) => Boolean(leaf),
      callback: ({ leaf }) =>
        leaf ? this.workspace.enterFocusMode(leaf) : false,
    });
    this.commands.register({
      id: "app-shell:toggle-bottom-panel",
      title: "View: Toggle bottom panel",
      category: "Workspace",
      icon: "panel-bottom",
      callback: () => this.workspace.toggleBottomPanel(),
    });
    this.commands.register({
      id: "app-shell:exit-focus-mode",
      title: "Workspace: Exit focus mode",
      category: "Workspace",
      icon: "shrink",
      when: () => Boolean(this.renderer.focusMode),
      callback: () => this.workspace.exitFocusMode(),
    });
    this.keymap.register({ modifiers: [], key: "Escape" }, () =>
      this.workspace.exitFocusMode(),
    );
    this.ribbon.addItem({
      id: "app-shell:open-command-palette",
      label: "Open command palette",
      icon: "terminal",
      priority: -1000,
      onSelect: () => this.commands.openPalette(),
    });
    this.emptyViewActions.addItem({
      id: "app-shell:open-command-palette",
      label: "Open Command Palette",
      icon: "terminal",
      onSelect: () => this.commands.openPalette(),
    });
    if (this.applicationInfo) {
      const aboutTitle = `About ${this.applicationInfo.name}`;
      this.commands.register({
        id: "app-shell:about",
        title: aboutTitle,
        category: "App Shell",
        icon: "info",
        callback: () => this.openAboutDialog(),
      });
      this.status.addItem({
        id: "app-shell:version",
        align: "right",
        priority: 1000,
        icon: "info",
        label: `v${this.applicationInfo.version}`,
        tooltip: aboutTitle,
        onSelect: () => {
          this.openAboutDialog();
        },
      });
    }
    this.commands.register({
      id: "app-shell:increase-font-size",
      title: "Increase font size",
      category: "Appearance",
      hotkeys: [{ modifiers: ["Mod"], key: "=" }],
      when: () => this.appearance.quickFontSizeAdjustment,
      callback: () => this.appearance.adjustFontSize(1),
    });
    this.commands.register({
      id: "app-shell:decrease-font-size",
      title: "Decrease font size",
      category: "Appearance",
      hotkeys: [{ modifiers: ["Mod"], key: "-" }],
      when: () => this.appearance.quickFontSizeAdjustment,
      callback: () => this.appearance.adjustFontSize(-1),
    });
    this.commands.register({
      id: "app-shell:reset-font-size",
      title: "Reset font size",
      category: "Appearance",
      hotkeys: [{ modifiers: ["Mod"], key: "0" }],
      when: () => this.appearance.quickFontSizeAdjustment,
      callback: () => this.appearance.resetFontSize(),
    });

    this.plugins = new AppShellPluginManager(
      this,
      options.plugins ?? [],
      options.persistence?.plugins,
    );
    this.plugins.on("error", (state) => {
      this.#events.trigger("plugin-error", state);
    });
    this.plugins.on("persistence-error", ({ operation, error }) => {
      this.notices.show(`Plugin ${operation} failed: ${String(error)}`);
    });
    const notificationPersistenceRef = this.notifications.on(
      "persistence-error",
      (event) => {
        this.#events.trigger("notification-persistence-error", event);
      },
    );
    this.#workspaceDisposers.push(() =>
      this.notifications.offref(notificationPersistenceRef),
    );

    const workspaceEvents = this
      .#events as unknown as WorkspaceEventDispatcher<WorkspaceEventMap>;
    const forward = <Name extends keyof WorkspaceEventMap>(name: Name) => {
      const ref = this.renderer.on(name, (...args) => {
        workspaceEvents.trigger(name, ...args);
      });
      this.#workspaceDisposers.push(() => this.renderer.offref(ref));
    };
    forwardedWorkspaceEvents.forEach(forward);
  }

  on<Name extends keyof AppShellEventMap>(
    name: Name,
    listener: (...args: AppShellEventMap[Name]) => void,
  ): WorkspaceEventRef<AppShellEventMap, Name> {
    return this.#events.on(name, listener);
  }

  once<Name extends keyof AppShellEventMap>(
    name: Name,
    listener: (...args: AppShellEventMap[Name]) => void,
  ): WorkspaceEventRef<AppShellEventMap, Name> {
    return this.#events.once(name, listener);
  }

  off<Name extends keyof AppShellEventMap>(
    name: Name,
    listener: (...args: AppShellEventMap[Name]) => void,
  ): void {
    this.#events.off(name, listener);
  }

  async start(): Promise<void> {
    if (this.#disposed) throw new Error("The app shell controller is disposed");
    if (this.ready) return;
    if (this.#startPromise) return this.#startPromise;
    this.started = true;
    this.#startPromise = this.#start();
    try {
      await this.#startPromise;
    } finally {
      this.#startPromise = null;
    }
  }

  async #start(): Promise<void> {
    await this.notifications.load();
    await this.plugins.start();
    if (!this.settings.ready) await this.settings.load();
    if (!this.commands.ready) await this.commands.loadHotkeys();
    if (!this.renderer.layoutReady) await this.renderer.restoreLayout();
    this.ready = true;
    this.#events.trigger("ready");
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    await Promise.all([
      this.renderer.flushSave(),
      this.settings.flushSave(),
      this.commands.saveHotkeys(),
      this.notifications.flushSave(),
    ]);
    await this.plugins.stop();
    this.ready = false;
    this.started = false;
    this.#events.trigger("stop");
  }

  async dispose(): Promise<void> {
    if (this.#disposed) return;
    await this.stop();
    this.#disposed = true;
    for (const dispose of this.#workspaceDisposers.splice(0)) dispose();
    this.views.clear();
    this.editorViews.clear();
    this.commands.destroy();
    this.notices.clear();
    this.notifications.destroy();
    this.ui.destroy();
    this.settings.destroy();
    this.renderer.destroy();
    this.#events.clear();
  }

  getLayout(): WorkspaceJson {
    return this.workspace.getLayout();
  }

  changeLayout(value: unknown): void {
    this.workspace.changeLayout(value);
  }

  openAboutDialog(): boolean {
    if (!this.applicationInfo) return false;
    this.aboutDialogOpen = true;
    return true;
  }

  closeAboutDialog(): void {
    this.aboutDialogOpen = false;
  }

  registerSettingsSection(section: WorkspaceSettingsSection): () => void {
    return this.configuration.register(section);
  }
}

function mergeById<T extends { id: string }>(
  defaults: T[],
  supplied: T[],
): T[] {
  const entries = new Map(defaults.map((entry) => [entry.id, entry]));
  for (const entry of supplied) entries.set(entry.id, entry);
  return [...entries.values()];
}

export function createLocalStorageAppShellLayoutPersistence(
  key: string,
  storage?: Storage,
): AppShellLayoutPersistence {
  const resolveStorage = () => storage ?? globalThis.localStorage;
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
