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
  WorkspaceLayoutV2,
} from "./types.js";
import { WorkspaceShellController } from "./workspace-controller.svelte.js";

function splitLayout(): WorkspaceLayoutV2 {
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
        layout: WorkspaceLayoutV2,
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
    expect(controller.layout.version).toBe(2);
  });
});
