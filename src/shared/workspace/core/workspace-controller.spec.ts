import { describe, expect, it, vi } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspacePane,
  findWorkspaceTab,
} from "./layout.js";
import type {
  WorkspaceLayoutChangeEvent,
  WorkspaceLayoutPersistence,
  WorkspaceLayout,
} from "./types.js";
import { WorkspaceShellController } from "./workspace-controller.svelte.js";

function splitLayout(): WorkspaceLayout {
  const first = createWorkspaceTab({ id: "first", title: "First" });
  const second = createWorkspaceTab({ id: "second", title: "Second" });
  return {
    ...createDefaultWorkspaceLayout(),
    main: {
      kind: "split",
      id: "root-split",
      direction: "horizontal",
      sizes: [50, 50],
      children: [
        createWorkspaceTabs([first], { id: "first-pane" }),
        createWorkspaceTabs([second], { id: "second-pane" }),
      ],
    },
    active: { hostId: "root", paneId: "first-pane", tabId: "first" },
  };
}

describe("WorkspaceShellController", () => {
  it("tracks active pane, tab, and snapshot identity", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    expect(controller.selectTab("second")).toBe(true);
    expect(controller.activePaneId).toBe("second-pane");
    expect(controller.activeTab?.title).toBe("Second");
    const snapshot = controller.getLayout();
    snapshot.active.tabId = "changed-outside";
    expect(controller.activeTabId).toBe("second");
  });

  it("does not emit layout-change when selecting the already-active tab", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    const changes: string[] = [];
    controller.on("layout-change", (event) => changes.push(event.source));
    expect(controller.selectTab("first")).toBe(true);
    expect(changes).toEqual([]);
    expect(controller.selectTab("second")).toBe(true);
    expect(changes).toEqual(["tab-select"]);
  });

  it("applies the user-created tab activation policy independently of explicit adds", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });

    controller.activateNewTabs = false;
    expect(
      controller.addCreatedTab(
        "first-pane",
        createWorkspaceTab({ id: "background", title: "Background" }),
      ),
    ).toBe(true);
    expect(controller.activeTabId).toBe("first");

    controller.activateNewTabs = true;
    expect(
      controller.addCreatedTab(
        "first-pane",
        createWorkspaceTab({ id: "focused", title: "Focused" }),
      ),
    ).toBe(true);
    expect(controller.activeTabId).toBe("focused");

    controller.activateNewTabs = false;
    expect(
      controller.addTab(
        "first-pane",
        createWorkspaceTab({ id: "explicit", title: "Explicit" }),
        true,
      ),
    ).toBe(true);
    expect(controller.activeTabId).toBe("explicit");
  });

  it("keeps main-pane focus transient and emits dedicated state changes", async () => {
    const save = vi.fn(async () => undefined);
    const controller = new WorkspaceShellController({
      layout: splitLayout(),
      persistence: { load: async () => null, save },
      saveDebounceMs: 0,
    });
    const before = controller.getLayout();
    const changes: Array<{ tabId: string; paneId: string } | null> = [];
    controller.on("focus-mode-change", (state) => changes.push(state));

    expect(controller.enterFocusMode("first")).toBe(true);
    expect(controller.focusMode).toEqual({
      tabId: "first",
      paneId: "first-pane",
    });
    expect(controller.isFocusModeForPane("first-pane")).toBe(true);
    expect(controller.enterFocusMode("first")).toBe(false);
    expect(controller.getLayout()).toEqual(before);
    await controller.flushSave();
    expect(save).not.toHaveBeenCalled();

    expect(controller.exitFocusMode()).toBe(true);
    expect(controller.exitFocusMode()).toBe(false);
    expect(changes).toEqual([{ tabId: "first", paneId: "first-pane" }, null]);
  });

  it("rejects non-main focus targets and clears focus when its tab detaches", () => {
    const files = createWorkspaceTab({ id: "files", title: "Files" });
    const layout = splitLayout();
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([files], { id: "left-sidebar" }),
    };
    const controller = new WorkspaceShellController({ layout });

    expect(controller.enterFocusMode("files")).toBe(false);
    expect(controller.enterFocusMode("missing")).toBe(false);
    expect(controller.enterFocusMode("first")).toBe(true);
    expect(controller.dropTab("first", "second-pane", "center")).toBe(true);
    expect(controller.focusMode).toBeNull();

    expect(controller.enterFocusMode("first")).toBe(true);
    controller.changeLayout(splitLayout());
    expect(controller.focusMode).toBeNull();
  });

  it("keeps the pane focused when another tab is selected within it", () => {
    const layout = splitLayout();
    const pane = findWorkspacePane(layout, "first-pane");
    const next = createWorkspaceTab({ id: "next", title: "Next" });
    if (!pane) throw new Error("Expected first pane");
    pane.items.push(next);
    const controller = new WorkspaceShellController({ layout });

    expect(controller.enterFocusMode("first")).toBe(true);
    expect(controller.selectTab(next.id)).toBe(true);
    expect(controller.focusMode).toEqual({
      tabId: next.id,
      paneId: "first-pane",
    });
    expect(controller.closeTab(next.id)).toBe(true);
    expect(controller.focusMode).toBeNull();
  });

  it("clears focus before splitting its pane", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    expect(controller.enterFocusMode("first")).toBe(true);
    expect(
      controller.splitPane(
        "first-pane",
        "bottom",
        createWorkspaceTab({ id: "split-focus", title: "Split focus" }),
      ),
    ).toBe(true);
    expect(controller.focusMode).toBeNull();
  });

  it("uses one cancelable drop path and emits commit order", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    const order: string[] = [];
    controller.on("layout-will-drop", () => order.push("will"));
    controller.on("layout-did-drop", () => order.push("did"));
    controller.on("layout-change", (event) =>
      order.push(`change:${event.source}`),
    );

    expect(controller.dropTab("first", "second-pane", "center", "api", 0)).toBe(
      true,
    );
    expect(order).toEqual(["will", "did", "change:drag-drop"]);
    expect(findWorkspaceTab(controller.layout, "first")?.pane.id).toBe(
      "second-pane",
    );

    controller.on("layout-will-drop", (event) => event.preventDefault());
    expect(controller.dropTab("first", "second-pane", "left")).toBe(false);
    expect(controller.layout.main.kind).toBe("tabs");
    expect(findWorkspaceTab(controller.layout, "first")?.pane.id).toBe(
      "second-pane",
    );
  });

  it("reorders tabs in both directions and ignores same-slot drops", async () => {
    const alpha = createWorkspaceTab({ id: "alpha", title: "Alpha" });
    const beta = createWorkspaceTab({ id: "beta", title: "Beta" });
    const gamma = createWorkspaceTab({ id: "gamma", title: "Gamma" });
    const pane = createWorkspaceTabs([alpha, beta, gamma], {
      id: "reorder-pane",
      activeItemId: alpha.id,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.main = pane;
    layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: alpha.id,
    };
    const save = vi.fn(async () => undefined);
    const controller = new WorkspaceShellController({
      layout,
      persistence: { load: async () => null, save },
      saveDebounceMs: 0,
    });
    const livePane = findWorkspacePane(controller.layout, pane.id);
    if (!livePane) throw new Error("Expected reorder pane");
    const order: string[] = [];
    controller.on("layout-will-drop", () => order.push("will"));
    controller.on("layout-did-drop", () => order.push("did"));
    controller.on("active-tab-change", (tab) =>
      order.push(`active:${tab?.id ?? "none"}`),
    );
    controller.on("layout-change", (event) =>
      order.push(`change:${event.source}`),
    );

    expect(controller.dropTab("alpha", pane.id, "center", "api", 3)).toBe(true);
    expect(livePane.items.map((item) => item.id)).toEqual([
      "beta",
      "gamma",
      "alpha",
    ]);
    expect(livePane.activeItemId).toBe("alpha");
    expect(controller.activeTabId).toBe("alpha");
    expect(order).toEqual(["will", "did", "active:alpha", "change:drag-drop"]);
    await controller.flushSave();
    expect(save).toHaveBeenCalledTimes(1);

    order.length = 0;
    save.mockClear();
    expect(controller.dropTab("alpha", pane.id, "center", "api", 0)).toBe(true);
    expect(livePane.items.map((item) => item.id)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
    await controller.flushSave();
    expect(save).toHaveBeenCalledTimes(1);

    order.length = 0;
    save.mockClear();
    expect(controller.dropTab("beta", pane.id, "center", "api", 2)).toBe(false);
    expect(livePane.items.map((item) => item.id)).toEqual([
      "alpha",
      "beta",
      "gamma",
    ]);
    expect(order).toEqual([]);
    await controller.flushSave();
    expect(save).not.toHaveBeenCalled();
  });

  it("inserts a cross-pane tab at the requested index and activates it", () => {
    const layout = splitLayout();
    const target = findWorkspacePane(layout, "second-pane");
    if (!target) throw new Error("Expected second pane");
    target.items.push(createWorkspaceTab({ id: "third", title: "Third" }));
    const controller = new WorkspaceShellController({ layout });
    const liveTarget = findWorkspacePane(controller.layout, target.id);
    if (!liveTarget) throw new Error("Expected live second pane");

    expect(controller.dropTab("first", liveTarget.id, "center", "api", 1)).toBe(
      true,
    );
    expect(liveTarget.items.map((item) => item.id)).toEqual([
      "second",
      "first",
      "third",
    ]);
    expect(liveTarget.activeItemId).toBe("first");
    expect(controller.activeTabId).toBe("first");
  });

  it("splits, floats, changes window state, and redocks tabs", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    expect(
      controller.splitPane(
        "first-pane",
        "bottom",
        createWorkspaceTab({ id: "third", title: "Third" }),
      ),
    ).toBe(true);
    const floating = controller.floatTab("second", { x: 50, y: 60 });
    expect(floating?.state).toBe("normal");
    expect(controller.activeWindow?.id).toBe(floating?.id);
    expect(controller.setWindowState(floating!.id, "maximized")).toBe(true);
    expect(controller.dockWindow(floating!.id, "first-pane")).toBe(true);
    expect(
      findWorkspacePane(controller.layout, "first-pane")?.items.some(
        (item) => item.id === "second",
      ),
    ).toBe(true);
  });

  it("removes an empty child pane and collapses its parent split", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });

    expect(controller.closeTab("first")).toBe(true);
    expect(controller.layout.main.kind).toBe("tabs");
    expect(controller.layout.main.id).toBe("second-pane");
    expect(findWorkspacePane(controller.layout, "first-pane")).toBeNull();
    expect(controller.activePaneId).toBe("second-pane");
    expect(controller.activeTabId).toBe("second");
  });

  it("prunes a source split after moving its final tab", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });

    expect(controller.dropTab("first", "second-pane", "center", "api", 0)).toBe(
      true,
    );
    expect(controller.layout.main.kind).toBe("tabs");
    if (controller.layout.main.kind !== "tabs") return;
    expect(controller.layout.main.id).toBe("second-pane");
    expect(controller.layout.main.items.map((item) => item.id)).toEqual([
      "first",
      "second",
    ]);
  });

  it("groups and ungroups direct sidebar tabs without losing their order", () => {
    const files = createWorkspaceTab({ id: "files", title: "Files" });
    const search = createWorkspaceTab({ id: "search", title: "Search" });
    const layout = splitLayout();
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([files, search], { id: "left-sidebar" }),
    };
    const controller = new WorkspaceShellController({ layout });

    const group = controller.groupSidebarTabs("left", ["files", "search"], {
      id: "explorer",
      title: "Explorer",
      icon: "files",
    });
    expect(group?.tabs.map((tab) => tab.id)).toEqual(["files", "search"]);
    expect(findWorkspaceTab(controller.layout, "files")?.group?.id).toBe(
      "explorer",
    );
    expect(
      controller
        .createPaneMenu("files")
        .entries.some(
          (item) =>
            item.kind === "item" && item.title === "Ungroup into sidebar tabs",
        ),
    ).toBe(true);

    expect(
      controller.ungroupSidebarGroup("explorer").map((tab) => tab.id),
    ).toEqual(["files", "search"]);
    expect(findWorkspaceTab(controller.layout, "files")?.group).toBeUndefined();
    expect(
      controller
        .createPaneMenu("files")
        .entries.some(
          (item) =>
            item.kind === "item" && item.title === "Convert to sidebar group",
        ),
    ).toBe(true);
  });

  it("opens, sizes, groups, and constrains the bottom dock", () => {
    const terminal = createWorkspaceTab({ id: "terminal", title: "Terminal" });
    const output = createWorkspaceTab({ id: "output", title: "Output" });
    const layout = splitLayout();
    layout.bottom = {
      open: false,
      size: 240,
      root: createWorkspaceTabs([terminal, output], { id: "bottom-panel" }),
    };
    const controller = new WorkspaceShellController({ layout });
    const sources: string[] = [];
    controller.on("layout-change", (event) => sources.push(event.source));

    controller.setDockOpen("bottom", true);
    controller.setDockSize("bottom", 800);
    expect(controller.layout.bottom).toMatchObject({ open: true, size: 640 });

    const group = controller.groupDockTabs("bottom", [terminal.id, output.id], {
      id: "diagnostics",
      title: "Diagnostics",
    });
    expect(group?.tabs.map((tab) => tab.id)).toEqual(["terminal", "output"]);
    expect(findWorkspaceTab(controller.layout, terminal.id)?.group?.id).toBe(
      "diagnostics",
    );
    expect(
      controller.splitPane(
        "bottom-panel",
        "right",
        createWorkspaceTab({ id: "split", title: "Split" }),
      ),
    ).toBe(false);
    expect(controller.dropTab("first", "bottom-panel", "top")).toBe(false);
    expect(sources).toEqual(["bottom-panel", "resize", "sidebar-group"]);
  });

  it("does not persist unchanged grouped panel sizes", () => {
    const properties = createWorkspaceTab({
      id: "properties",
      title: "Properties",
    });
    const layout = splitLayout();
    layout.bottom = {
      open: true,
      size: 240,
      root: createWorkspaceTabs([properties], { id: "bottom-panel" }),
    };
    const controller = new WorkspaceShellController({ layout });
    const group = controller.groupDockTabs("bottom", [properties.id], {
      id: "properties-group",
      title: "Properties",
    })!;
    const changes: WorkspaceLayoutChangeEvent[] = [];
    controller.on("layout-change", (event) => changes.push(event));

    expect(
      controller.setSidebarPanelSizes(group.id, { [properties.id]: 100 }),
    ).toBe(true);
    expect(changes).toEqual([]);

    expect(
      controller.setSidebarPanelSizes(group.id, { [properties.id]: 75 }),
    ).toBe(true);
    expect(group.panelSizesByTabId[properties.id]).toBe(75);
    expect(changes).toEqual([
      {
        source: "resize",
        id: group.id,
        operation: "sidebar-panel",
      },
    ]);
  });

  it("updates persisted sidebar-group metadata and exposes panel actions", async () => {
    const files = createWorkspaceTab({ id: "files", title: "Files" });
    const search = createWorkspaceTab({ id: "search", title: "Search" });
    const layout = splitLayout();
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([files, search], { id: "left-sidebar" }),
    };
    const save = vi.fn<
      (
        layout: WorkspaceLayout,
        event: WorkspaceLayoutChangeEvent,
      ) => Promise<void>
    >(async () => undefined);
    const controller = new WorkspaceShellController({
      layout,
      persistence: { load: async () => null, save },
      saveDebounceMs: 0,
    });
    const group = controller.groupSidebarTabs("left", ["files", "search"], {
      id: "explorer",
      title: "Explorer",
      icon: "files",
    })!;
    await controller.flushSave();
    save.mockClear();

    expect(
      controller.updateSidebarGroup(group.id, {
        title: "Project",
        icon: "folder-tree",
      }),
    ).toBe(true);
    await controller.flushSave();
    expect(group).toMatchObject({
      title: "Project",
      icon: "folder-tree",
    });
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[0].left.root).toMatchObject({
      items: [
        {
          id: "explorer",
          title: "Project",
          icon: "folder-tree",
        },
      ],
    });
    expect(save.mock.calls[0]?.[1]).toMatchObject({
      source: "sidebar-group",
      id: "explorer",
      operation: "metadata",
    });

    const panelMenu = controller.createPaneMenu("files", "sidebar-group-panel");
    expect(
      panelMenu.entries
        .filter((entry) => entry.kind === "item")
        .map((entry) => entry.title),
    ).toEqual(
      expect.arrayContaining([
        "Hide this panel",
        "Move to normal sidebar tabs",
      ]),
    );
    expect(controller.moveSidebarPanelToTabs("explorer", "files")).toBe(true);
    expect(findWorkspaceTab(controller.layout, "files")?.group).toBeUndefined();
    expect(
      controller.layout.left.root.kind === "tabs"
        ? controller.layout.left.root.items.map((item) => item.id)
        : [],
    ).toEqual(["explorer", "files"]);
  });

  it("allows sidebar edge drops to create recursive sidebar splits", () => {
    const sidebar = createWorkspaceTab({ id: "files", title: "Files" });
    const layout = splitLayout();
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([sidebar], { id: "left-sidebar" }),
    };
    const controller = new WorkspaceShellController({ layout });

    expect(controller.dropTab("first", "left-sidebar", "top")).toBe(true);
    expect(controller.layout.left.root.kind).toBe("split");
    if (controller.layout.left.root.kind !== "split") return;
    expect(controller.layout.left.root.direction).toBe("vertical");
    expect(controller.layout.left.root.children).toHaveLength(2);
    expect(controller.layout.left.root.children[0]?.kind).toBe("tabs");
    expect(findWorkspaceTab(controller.layout, "first")?.pane.id).not.toBe(
      "left-sidebar",
    );
  });

  it("drops tabs into sidebar groups at source top and bottom positions", () => {
    const files = createWorkspaceTab({ id: "files", title: "Files" });
    const search = createWorkspaceTab({ id: "search", title: "Search" });
    const layout = splitLayout();
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([files, search], { id: "left-sidebar" }),
    };
    const controller = new WorkspaceShellController({ layout });
    controller.groupSidebarTabs("left", ["files", "search"], {
      id: "explorer",
    });

    expect(
      controller.dropTabIntoSidebarGroup("first", "explorer", 1, "top", "api"),
    ).toBe(true);
    expect(findWorkspaceTab(controller.layout, "first")?.group?.id).toBe(
      "explorer",
    );
    const grouped = findWorkspaceTab(controller.layout, "files")?.group;
    expect(grouped?.tabs.map((tab) => tab.id)).toEqual([
      "files",
      "first",
      "search",
    ]);
    expect(controller.layout.main.kind).toBe("tabs");
    expect(controller.layout.main.id).toBe("second-pane");

    expect(
      controller.dropTabIntoSidebarGroup(
        "files",
        "explorer",
        3,
        "bottom",
        "api",
      ),
    ).toBe(true);
    expect(grouped?.tabs.map((tab) => tab.id)).toEqual([
      "first",
      "search",
      "files",
    ]);
  });

  it("restores once and serializes debounced persistence", async () => {
    const restored = splitLayout();
    restored.active = {
      hostId: "root",
      paneId: "second-pane",
      tabId: "second",
    };
    const save = vi.fn<
      (
        layout: WorkspaceLayout,
        event: WorkspaceLayoutChangeEvent,
      ) => Promise<void>
    >(async () => undefined);
    const persistence: WorkspaceLayoutPersistence = {
      load: vi.fn(async () => restored),
      save,
    };
    const controller = new WorkspaceShellController({
      persistence,
      saveDebounceMs: 0,
    });
    const ready = vi.fn();
    controller.on("layout-ready", ready);
    await controller.restoreLayout();
    await controller.restoreLayout();
    expect(persistence.load).toHaveBeenCalledTimes(1);
    expect(ready).toHaveBeenCalledTimes(1);
    expect(controller.activeTabId).toBe("second");

    controller.setSidebarOpen("left", true);
    await controller.flushSave();
    expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0]?.[1]).toMatchObject({ source: "sidebar" });
  });

  it("moves a tab into a dock from the pane menu Move to submenu", () => {
    const controller = new WorkspaceShellController({ layout: splitLayout() });
    const menu = controller.createPaneMenu("first");
    const moveTo = menu.entries.find(
      (entry) => entry.kind === "submenu" && entry.title === "Move to",
    );
    expect(moveTo?.kind).toBe("submenu");
    if (moveTo?.kind !== "submenu") return;
    const destinations = moveTo.menu.entries.filter(
      (entry) => entry.kind === "item",
    );
    expect(
      destinations.map((entry) =>
        entry.kind === "item" ? [entry.title, entry.icon, entry.disabled] : [],
      ),
    ).toEqual([
      ["Left Sidebar", "panel-left", false],
      ["Right Sidebar", "panel-right", false],
      ["Bottom Sidebar", "panel-bottom", false],
    ]);

    const left = destinations[0];
    expect(left?.kind).toBe("item");
    if (left?.kind !== "item") return;
    left.callback?.();
    expect(findWorkspaceTab(controller.layout, "first")?.pane.id).toBe(
      "left-sidebar",
    );
    expect(controller.layout.left.open).toBe(true);
    expect(controller.activeTabId).toBe("first");

    const docked = controller.createPaneMenu("first");
    const dockedMoveTo = docked.entries.find(
      (entry) => entry.kind === "submenu" && entry.title === "Move to",
    );
    expect(dockedMoveTo?.kind).toBe("submenu");
    if (dockedMoveTo?.kind !== "submenu") return;
    expect(
      dockedMoveTo.menu.entries
        .filter((entry) => entry.kind === "item")
        .map((entry) =>
          entry.kind === "item" ? [entry.title, entry.disabled] : [],
        ),
    ).toEqual([
      ["Left Sidebar", true],
      ["Right Sidebar", false],
      ["Bottom Sidebar", false],
    ]);
    expect(controller.moveTabToDock("first", "left")).toBe(false);
    expect(controller.moveTabToDock("first", "bottom")).toBe(true);
    expect(findWorkspaceTab(controller.layout, "first")?.pane.id).toBe(
      "bottom-panel",
    );
    expect(controller.layout.bottom.open).toBe(true);
  });

  it("reports load and save failures while retaining usable state", async () => {
    const errors: string[] = [];
    const controller = new WorkspaceShellController({
      persistence: {
        load: async () => {
          throw new Error("load failed");
        },
        save: async () => {
          throw new Error("save failed");
        },
      },
      saveDebounceMs: 0,
    });
    controller.on("persistence-error", (event) => errors.push(event.operation));
    await controller.restoreLayout();
    controller.setSidebarOpen("left", true);
    await controller.flushSave();
    expect(errors).toEqual(["load", "save"]);
    expect(controller.layout.version).toBe(3);
  });
});
