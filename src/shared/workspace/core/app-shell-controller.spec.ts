import { describe, expect, it, vi } from "vitest";
import {
  AppShellController,
  type AppShellControllerOptions,
  type AppShellLayoutPersistence,
} from "./app-shell-controller.svelte.js";
import {
  COMMAND_PALETTE_TAB_ACTIONS,
  COMMAND_PALETTE_TAB_ALL,
  type Hotkey,
} from "./command-manager.svelte.js";
import {
  AppShellPlugin,
  type AppShellPluginDescriptor,
} from "./plugin-manager.svelte.js";
import { workspaceLayoutToJson } from "./workspace-json.js";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
} from "./layout.js";
import { WorkspaceView } from "./workspace-view.js";
import { APP_SHELL_SETTING_IDS } from "./built-in-settings.svelte.js";

class ContributionPlugin extends AppShellPlugin<{ log?: string[] }> {
  onload() {
    this.options?.log?.push("plugin");
    this.addCommand({
      id: "contribution:run",
      title: "Run contribution",
      callback: () => undefined,
    });
    this.registerPaletteProvider({
      id: "contribution-palette",
      search: () => [],
    });
    this.registerSettingsSection({
      id: "contribution",
      title: "Contribution",
      fields: [
        {
          id: "contribution.enabled",
          title: "Enabled",
          type: "boolean",
          default: true,
        },
      ],
    });
    this.addRibbonItem({
      id: "contribution-ribbon",
      label: "Contribution",
      icon: "puzzle",
      onSelect: () => undefined,
    });
    this.addStatusBarItem({
      id: "contribution-status",
      label: "Ready",
    });
  }
}

class FailingPlugin extends AppShellPlugin {
  onload() {
    this.addCommand({
      id: "failing:temporary",
      title: "Temporary",
      callback: () => undefined,
    });
    throw new Error("failed to load");
  }
}

class MarkdownView extends WorkspaceView {
  getViewType() {
    return "markdown";
  }
}

class TextView extends WorkspaceView {
  getViewType() {
    return "text";
  }
}

describe("AppShellController", () => {
  it("owns the command-palette ribbon and configurable application about action", async () => {
    const app = new AppShellController({
      application: {
        name: "Test Shell",
        version: "2.4.0",
        icon: "book-open",
        buildTime: "2026-07-23T11:41:00.000Z",
        commitHash: "abcdef123456",
        copyright: "Copyright © Test Shell contributors.",
      },
    });

    const palette = app.ribbon.items.find(
      (item) => item.id === "app-shell:open-command-palette",
    );
    expect(palette).toMatchObject({
      label: "Open command palette",
      icon: "terminal",
    });
    app.commands.selectPaletteTab(COMMAND_PALETTE_TAB_ACTIONS);
    palette?.onSelect();
    expect(app.commands.paletteOpen).toBe(true);
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ALL);
    app.commands.closePalette();

    const emptyPalette = app.emptyViewActions.items.find(
      (item) => item.id === "app-shell:open-command-palette",
    );
    expect(emptyPalette).toMatchObject({
      label: "Open Command Palette",
      icon: "terminal",
    });
    app.commands.selectPaletteTab(COMMAND_PALETTE_TAB_ACTIONS);
    emptyPalette?.onSelect();
    expect(app.commands.paletteOpen).toBe(true);
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ALL);
    app.commands.closePalette();

    app.commands.selectPaletteTab(COMMAND_PALETTE_TAB_ACTIONS);
    const preventDefault = vi.fn();
    const hotkey = {
      key: "p",
      ctrlKey: false,
      metaKey: true,
      altKey: false,
      shiftKey: false,
      preventDefault,
    } as unknown as KeyboardEvent;
    const handled = app.commands.handleKeydown(hotkey);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(await handled).toBe(true);
    expect(app.commands.paletteTab).toBe(COMMAND_PALETTE_TAB_ALL);

    const customEmptyAction = vi.fn();
    const removeCustomEmptyAction = app.emptyViewActions.addItem({
      id: "consumer:custom-empty-action",
      label: "Custom empty action",
      onSelect: customEmptyAction,
    });
    app.emptyViewActions.items
      .find((item) => item.id === "consumer:custom-empty-action")
      ?.onSelect();
    expect(customEmptyAction).toHaveBeenCalledOnce();
    removeCustomEmptyAction();
    expect(
      app.emptyViewActions.items.some(
        (item) => item.id === "consumer:custom-empty-action",
      ),
    ).toBe(false);

    const version = app.status.items.find(
      (item) => item.id === "app-shell:version",
    );
    expect(version).toMatchObject({
      label: "v2.4.0",
      tooltip: "About Test Shell",
      icon: "info",
    });
    version?.onSelect?.();
    expect(app.aboutDialogOpen).toBe(true);
    app.closeAboutDialog();
    expect(app.aboutDialogOpen).toBe(false);
    expect(await app.commands.execute("app-shell:about")).toBe(true);
    expect(app.aboutDialogOpen).toBe(true);
    expect(app.applicationInfo).toMatchObject({
      name: "Test Shell",
      version: "2.4.0",
      commitHash: "abcdef123456",
    });

    await app.dispose();
  });

  it("exposes leaf focus mode through the application workspace and commands", async () => {
    const tab = createWorkspaceTab({ id: "focus-tab", title: "Focus" });
    const layout = createDefaultWorkspaceLayout();
    layout.main = createWorkspaceTabs([tab], {
      id: "focus-pane",
      activeItemId: tab.id,
    });
    layout.active = {
      hostId: "root",
      paneId: "focus-pane",
      tabId: tab.id,
    };
    const app = new AppShellController({ layout });
    const focusEvents = vi.fn();
    app.on("focus-mode-change", focusEvents);

    expect(app.workspace.enterFocusMode()).toBe(true);
    expect(app.workspace.focusMode).toEqual({
      tabId: tab.id,
      paneId: "focus-pane",
    });
    expect(focusEvents).toHaveBeenCalledWith({
      tabId: tab.id,
      paneId: "focus-pane",
    });
    expect(await app.commands.execute("app-shell:exit-focus-mode")).toBe(true);
    expect(app.workspace.focusMode).toBeNull();

    expect(await app.commands.execute("app-shell:focus-active-tab")).toBe(true);
    const preventDefault = vi.fn();
    const escape = {
      key: "Escape",
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      shiftKey: false,
      preventDefault,
    } as unknown as KeyboardEvent;
    expect(await app.commands.handleKeydown(escape)).toBe(true);
    expect(preventDefault).toHaveBeenCalledOnce();
    expect(app.workspace.focusMode).toBeNull();

    await app.dispose();
  });

  it("opens bottom-panel leaves and exposes the built-in toggle command", async () => {
    const app = new AppShellController();
    const leaf = app.workspace.openInBottomPanel(
      "empty",
      { source: "test" },
      { title: "Terminal", icon: "terminal" },
    );

    expect(leaf).not.toBeNull();
    expect(app.renderer.layout.bottom.open).toBe(true);
    expect(app.renderer.layout.bottom.root.items[0]).toMatchObject({
      id: leaf?.id,
      title: "Terminal",
    });
    app.workspace.setBottomPanelSize(320);
    expect(app.renderer.layout.bottom.size).toBe(320);
    expect(app.workspace.bottomPanelAlignment).toBe("center");
    expect(app.workspace.setBottomPanelAlignment("left")).toBe(true);
    expect(app.workspace.bottomPanelAlignment).toBe("left");
    expect(
      app.configuration.set(
        APP_SHELL_SETTING_IDS.bottomPanelAlignment,
        "unsupported",
      ),
    ).toBe(false);
    expect(app.workspace.bottomPanelAlignment).toBe("left");
    expect(await app.commands.execute("app-shell:toggle-bottom-panel")).toBe(
      true,
    );
    expect(app.renderer.layout.bottom.open).toBe(false);

    await app.dispose();
  });

  it("registers controller-owned settings by default and supports opting out", async () => {
    const app = new AppShellController();
    expect(app.settings.sections.map((section) => section.id)).toEqual([
      "workspace",
      "appearance",
      "hotkeys",
      "core-plugins",
    ]);
    expect(app.appearance.colorScheme).toBe("system");
    expect(app.mobile.requestedDisplayMode).toBe("auto");
    expect(app.workspace.bottomPanelAlignment).toBe("center");
    expect(
      app.settings.sections.find((section) => section.id === "workspace")
        ?.fields,
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: APP_SHELL_SETTING_IDS.bottomPanelAlignment,
          type: "enum",
          title: "Bottom panel alignment",
          default: "center",
          options: [
            { value: "center", label: "Center" },
            { value: "left", label: "Left" },
            { value: "right", label: "Right" },
            { value: "justify", label: "Justify" },
          ],
        }),
      ]),
    );

    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.appearanceTheme, "dark"),
    ).toBe(true);
    expect(app.appearance.theme).toBe("dark");
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileMode, "always"),
    ).toBe(true);
    expect(app.mobile.requestedDisplayMode).toBe("mobile");
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileBreakpoint, 640),
    ).toBe(true);
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileDefaultPage, "tabs"),
    ).toBe(true);
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileShowBottomNav, false),
    ).toBe(true);
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileIncludeSidebars, false),
    ).toBe(true);
    expect(
      app.configuration.set(
        APP_SHELL_SETTING_IDS.mobileIncludeBottomPanel,
        false,
      ),
    ).toBe(true);
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileIncludeFloating, false),
    ).toBe(true);
    expect(app.mobile.breakpointPx).toBe(640);
    expect(app.mobile.defaultPage).toBe("tabs");
    expect(app.mobile.showBottomNav).toBe(false);
    expect(app.mobile.includeSidebarsInTabs).toBe(false);
    expect(app.mobile.includeBottomPanelInTabs).toBe(false);
    expect(app.mobile.includeFloatingInTabs).toBe(false);
    expect(
      app.configuration.set(APP_SHELL_SETTING_IDS.mobileMode, "never"),
    ).toBe(true);
    expect(app.mobile.requestedDisplayMode).toBe("desktop");

    const bare = new AppShellController({ builtInSettings: false });
    expect(bare.settings.sections).toEqual([]);
    expect(
      bare.configuration.get(APP_SHELL_SETTING_IDS.appearanceTheme),
    ).toBeUndefined();
    expect(bare.workspace.bottomPanelAlignment).toBe("center");
    expect(bare.workspace.setBottomPanelAlignment("right")).toBe(false);
    await app.dispose();
    await bare.dispose();
  });

  it("hydrates plugins, configuration, hotkeys, and layout in order", async () => {
    const order: string[] = [];
    const options: AppShellControllerOptions = {
      plugins: [
        {
          id: "contribution",
          plugin: ContributionPlugin,
          options: { log: order },
        },
      ],
      persistence: {
        plugins: {
          load: async () => {
            order.push("plugin-state");
            return { contribution: true };
          },
          save: async () => undefined,
        },
        configuration: {
          load: async () => {
            order.push("configuration");
            return null;
          },
          save: async () => undefined,
        },
        hotkeys: {
          load: async () => {
            order.push("hotkeys");
            return {};
          },
          save: async () => undefined,
        },
        layout: {
          load: async () => {
            order.push("layout");
            return workspaceLayoutToJson(createDefaultWorkspaceLayout());
          },
          save: async () => undefined,
        },
      },
    };
    const app = new AppShellController(options);
    await app.start();

    expect(order).toEqual([
      "plugin-state",
      "plugin",
      "configuration",
      "hotkeys",
      "layout",
    ]);
    expect(app.ready).toBe(true);
    expect(app.commands.getCommand("contribution:run")).not.toBeNull();
    expect(app.settings.get("contribution.enabled")).toBe(true);
    await app.dispose();
  });

  it("hydrates and persists live shell configuration", async () => {
    const save = vi.fn(async () => undefined);
    const app = new AppShellController({
      persistence: {
        configuration: {
          load: async () => ({
            version: 1,
            values: {
              [APP_SHELL_SETTING_IDS.appearanceTheme]: "dark",
              [APP_SHELL_SETTING_IDS.mobileMode]: "always",
              [APP_SHELL_SETTING_IDS.mobileDefaultPage]: "tabs",
              [APP_SHELL_SETTING_IDS.bottomPanelAlignment]: "right",
            },
          }),
          save,
        },
      },
      saveDebounceMs: 0,
    });
    await app.start();

    expect(app.appearance.theme).toBe("dark");
    expect(app.mobile.requestedDisplayMode).toBe("mobile");
    expect(app.mobile.defaultPage).toBe("tabs");
    expect(app.workspace.bottomPanelAlignment).toBe("right");
    expect(app.workspace.setBottomPanelAlignment("justify")).toBe(true);
    await app.settings.flushSave();
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({
          [APP_SHELL_SETTING_IDS.bottomPanelAlignment]: "justify",
        }),
      }),
      {
        source: "update",
        id: APP_SHELL_SETTING_IDS.bottomPanelAlignment,
      },
    );
    await app.dispose();
  });

  it("persists enablement and disposes every plugin contribution", async () => {
    const save = vi.fn(async () => undefined);
    const descriptor: AppShellPluginDescriptor = {
      id: "contribution",
      plugin: ContributionPlugin,
      enabled: true,
      options: {},
    };
    const app = new AppShellController({
      plugins: [descriptor],
      persistence: {
        plugins: {
          load: async () => ({ contribution: false }),
          save,
        },
      },
    });
    await app.start();
    expect(app.commands.getCommand("contribution:run")).toBeNull();

    expect(await app.plugins.enable("contribution")).toBe(true);
    expect(app.commands.getCommand("contribution:run")).not.toBeNull();
    expect(app.commands.paletteProviders).toHaveLength(1);
    expect(
      app.ribbon.items.some((item) => item.id === "contribution-ribbon"),
    ).toBe(true);

    expect(await app.plugins.disable("contribution")).toBe(true);
    expect(app.commands.getCommand("contribution:run")).toBeNull();
    expect(app.commands.paletteProviders).toHaveLength(0);
    expect(
      app.settings.sections.some((section) => section.id === "contribution"),
    ).toBe(false);
    expect(save).toHaveBeenLastCalledWith({ contribution: false });

    expect(await app.plugins.enable("contribution")).toBe(true);
    expect(app.commands.getCommand("contribution:run")).not.toBeNull();
    expect(app.commands.paletteProviders).toHaveLength(1);
    expect(save).toHaveBeenLastCalledWith({ contribution: true });
    await app.dispose();
  });

  it("rolls back a failed plugin without blocking shell readiness", async () => {
    const app = new AppShellController({
      plugins: [{ id: "failing", plugin: FailingPlugin }],
    });
    await app.start();
    expect(app.ready).toBe(true);
    expect(app.plugins.get("failing")).toMatchObject({ status: "failed" });
    expect(app.commands.getCommand("failing:temporary")).toBeNull();
    await app.dispose();
  });

  it("keeps required plugins enabled despite persisted opt-out state", async () => {
    const save = vi.fn(async () => undefined);
    const app = new AppShellController({
      plugins: [
        {
          id: "required",
          name: "Required contribution",
          plugin: ContributionPlugin,
          required: true,
        },
      ],
      persistence: {
        plugins: {
          load: async () => ({ required: false }),
          save,
        },
      },
    });
    await app.start();

    expect(app.plugins.get("required")).toMatchObject({
      name: "Required contribution",
      required: true,
      enabled: true,
      status: "enabled",
    });
    expect(await app.plugins.disable("required")).toBe(false);
    expect(save).not.toHaveBeenCalled();
    await app.dispose();
  });

  it("resolves editor associations and opens serializable resources", async () => {
    const app = new AppShellController({
      views: [
        {
          type: "markdown",
          factory: (leaf) => new MarkdownView(leaf),
        },
        {
          type: "text",
          factory: (leaf) => new TextView(leaf),
        },
      ],
      editorViews: [
        {
          id: "markdown-editor",
          viewType: "markdown",
          label: "Markdown",
          filenamePatterns: ["*.md"],
          priority: "default",
        },
        {
          id: "text-editor",
          viewType: "text",
          label: "Text",
          filenamePatterns: ["*.txt"],
          priority: "option",
        },
      ],
      configuration: {
        values: {
          [APP_SHELL_SETTING_IDS.editorAssociations]: {
            "*.md": "missing-editor",
            "*.special.md": "text-editor",
          },
        },
      },
    });

    expect(app.workspace.determineViewTypeForPath("Notes/readme.md")).toBe(
      "markdown",
    );
    expect(
      app.workspace.determineViewTypeForPath("Notes/readme.special.md"),
    ).toBe("text");

    const leaf = app.workspace.openResource("Notes/readme.special.md", {
      state: { source: "test" },
    });
    expect(leaf?.title).toBe("readme.special.md");
    expect(leaf?.viewState).toEqual({
      type: "text",
      state: {
        resourcePath: "Notes/readme.special.md",
        source: "test",
      },
    });
  });

  it("reports an unmatched resource without mutating the layout", () => {
    const app = new AppShellController();
    const errors: Array<{ path: string; reason: string }> = [];
    app.on("resource-open-error", (event) => errors.push(event));
    const before = app.getLayout();

    expect(app.workspace.openResource("archive.unknown")).toBeNull();
    expect(app.getLayout()).toEqual(before);
    expect(errors).toEqual([
      { path: "archive.unknown", reason: "no-editor-view" },
    ]);
  });

  it("persists public tab additions and removals with their mutation events", async () => {
    const initialLayout = workspaceLayoutToJson(createDefaultWorkspaceLayout());
    const save = vi.fn<AppShellLayoutPersistence["save"]>(
      async () => undefined,
    );
    const app = new AppShellController({
      layout: initialLayout,
      saveDebounceMs: 60_000,
      persistence: {
        layout: {
          load: async () => initialLayout,
          save,
        },
      },
    });
    await app.start();

    const leaf = app.workspace.openLeaf(
      "empty",
      {},
      { title: "Persisted tab" },
    );
    expect(leaf).not.toBeNull();
    await app.workspace.flushSave();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[1]).toMatchObject({
      source: "tab-add",
      id: leaf?.id,
    });
    expect(JSON.stringify(save.mock.calls[0]?.[0])).toContain(leaf?.id);

    expect(leaf?.close()).toBe(true);
    await app.workspace.flushSave();
    expect(save).toHaveBeenCalledTimes(2);
    expect(save.mock.calls[1]?.[1]).toMatchObject({
      source: "tab-close",
      id: leaf?.id,
    });
    expect(JSON.stringify(save.mock.calls[1]?.[0])).not.toContain(leaf?.id);
    await app.dispose();
  });

  it("opens implicit leaves in the main workspace when a sidebar has focus", () => {
    const layout = createDefaultWorkspaceLayout();
    const explorer = createWorkspaceTab({
      id: "explorer",
      title: "Files",
      view: { type: "empty", state: {} },
    });
    layout.left.open = true;
    layout.left.root = createWorkspaceTabs([explorer], {
      id: "left-sidebar",
      activeItemId: explorer.id,
    });
    layout.active = {
      hostId: "root",
      paneId: layout.left.root.id,
      tabId: explorer.id,
    };
    const app = new AppShellController({ layout });

    const leaf = app.workspace.openLeaf("empty", {}, { title: "Document" });

    expect(leaf).not.toBeNull();
    expect(app.renderer.layout.left.root.kind).toBe("tabs");
    if (app.renderer.layout.left.root.kind === "tabs") {
      expect(app.renderer.layout.left.root.items).toHaveLength(1);
    }
    expect(app.renderer.layout.main.kind).toBe("tabs");
    if (app.renderer.layout.main.kind === "tabs") {
      expect(app.renderer.layout.main.items).toHaveLength(2);
      expect(app.renderer.layout.main.activeItemId).toBe(leaf?.id);
    }
  });

  it("uses Lapis hotkey override semantics and reports conflicts", async () => {
    const app = new AppShellController({
      commands: [
        {
          id: "first",
          title: "First",
          hotkeys: [{ modifiers: ["Mod"], key: "k" }],
          callback: () => undefined,
        },
        {
          id: "second",
          title: "Second",
          hotkeys: [{ modifiers: ["Mod"], key: "k" }],
          callback: () => undefined,
        },
      ],
      persistence: {
        hotkeys: {
          load: async () => ({ first: [] }),
          save: async () => undefined,
        },
      },
    });
    await app.start();
    expect(app.commands.getHotkeys("first")).toEqual([]);
    expect(app.commands.getHotkeys("second")).toHaveLength(1);
    expect(app.commands.getConflicts()).toEqual([]);

    app.commands.resetHotkeys("first");
    expect(app.commands.getConflicts()[0]?.commandIds).toEqual([
      "first",
      "second",
    ]);
    await app.dispose();
  });

  it("adds, removes, explicitly unbinds, and persists multiple hotkeys", async () => {
    const save = vi.fn(async () => undefined);
    const defaultHotkey: Hotkey = { modifiers: ["Mod"], key: "k" };
    const alternateHotkey: Hotkey = { modifiers: ["Alt"], key: "j" };
    const app = new AppShellController({
      commands: [
        {
          id: "editable",
          title: "Editable",
          hotkeys: [defaultHotkey],
          callback: () => undefined,
        },
      ],
      persistence: {
        hotkeys: {
          load: async () => ({}),
          save,
        },
      },
    });
    await app.start();

    expect(app.commands.addHotkey("editable", alternateHotkey)).toBe(true);
    expect(app.commands.getHotkeys("editable")).toHaveLength(2);
    expect(app.commands.removeHotkey("editable", defaultHotkey)).toBe(true);
    expect(app.commands.removeHotkey("editable", alternateHotkey)).toBe(true);
    expect(app.commands.getHotkeys("editable")).toEqual([]);
    await app.commands.saveHotkeys();
    expect(save).toHaveBeenLastCalledWith({ editable: [] });
    await app.dispose();
  });
});
