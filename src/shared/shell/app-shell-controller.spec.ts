import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AppShellController,
  AppShellSidebarController,
} from "./app-shell-controller.svelte.js";
import {
  APP_SHELL_DEFAULT_STORAGE_KEY,
  APP_SHELL_LAYOUT_VERSION,
  createLocalStorageAppShellLayoutPersistence,
  type AppShellLayoutPersistence,
  type AppShellLayoutV1,
} from "./app-shell-persistence.js";

describe("AppShellController", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts both sidebars expanded", () => {
    const controller = new AppShellController();

    expect(controller.left.collapsed).toBe(false);
    expect(controller.left.closed).toBe(false);
    expect(controller.left.state).toBe("expanded");
    expect(controller.right.collapsed).toBe(false);
    expect(controller.right.closed).toBe(false);
    expect(controller.right.state).toBe("expanded");
  });

  it("honors configured initial sidebar state", () => {
    const controller = new AppShellController({
      leftCollapsed: true,
      rightCollapsed: false,
      rightClosed: true,
      leftWidth: 320,
      rightWidth: 420,
    });

    expect(controller.left.state).toBe("collapsed");
    expect(controller.right.state).toBe("closed");
    expect(controller.left.width).toBe(320);
    expect(controller.right.width).toBe(420);
  });

  it("mutates the two sidebars independently", () => {
    const controller = new AppShellController();

    controller.left.collapse();
    expect(controller.left.state).toBe("collapsed");
    expect(controller.right.state).toBe("expanded");

    controller.right.toggle();
    expect(controller.right.state).toBe("collapsed");

    controller.left.expand();
    controller.right.setCollapsed(false);
    expect(controller.left.state).toBe("expanded");
    expect(controller.right.state).toBe("expanded");

    controller.right.close();
    expect(controller.right.state).toBe("closed");
    expect(controller.left.state).toBe("expanded");

    controller.right.toggle();
    expect(controller.right.state).toBe("expanded");
    expect(controller.right.closed).toBe(false);

    controller.right.collapse();
    controller.right.close();
    controller.right.open();
    expect(controller.right.state).toBe("collapsed");
  });

  it("resizes independently and clamps to shared bounds", () => {
    const controller = new AppShellController({
      sidebarMinWidth: 240,
      sidebarMaxWidth: 480,
    });

    expect(controller.left.width).toBeUndefined();
    expect(controller.right.width).toBeUndefined();

    controller.left.setWidth(360);
    controller.right.setWidth(900);
    expect(controller.left.width).toBe(360);
    expect(controller.right.width).toBe(480);

    controller.left.resizeBy(-200);
    expect(controller.left.width).toBe(240);
    expect(controller.right.width).toBe(480);

    controller.left.resetWidth();
    expect(controller.left.width).toBeUndefined();
    expect(controller.right.width).toBe(480);
  });

  it("returns the stable controller for each side", () => {
    const controller = new AppShellController();

    expect(controller.getSidebar("left")).toBe(controller.left);
    expect(controller.getSidebar("right")).toBe(controller.right);
    expect(controller.left).toBeInstanceOf(AppShellSidebarController);
    expect(controller.right).toBeInstanceOf(AppShellSidebarController);
    expect(controller.getPanelId(controller.left)).toBe("left");
    expect(controller.getPanelId(controller.right)).toBe("right");
  });

  it("owns transient mobile mode, stage, and active edge panels", () => {
    const controller = new AppShellController({
      leftCollapsed: true,
      rightClosed: true,
      leftWidth: 320,
      rightWidth: 404,
    });
    const unregisterProjects = controller.mobile.registerPanel({
      id: "projects",
      side: "left",
      label: "Projects",
      kind: "sidebar",
    });
    controller.mobile.registerPanel({
      id: "files",
      side: "left",
      label: "Files",
      kind: "sidebar",
    });
    controller.mobile.registerPanel({
      id: "assistant",
      side: "right",
      label: "Assistant",
      kind: "sidebar",
    });

    expect(controller.mobile.resolvedMode).toBe("desktop");
    expect(controller.mobile.stage).toBe("main");
    expect(controller.mobile.activeLeftPanelId).toBe("projects");
    expect(controller.mobile.activeRightPanelId).toBe("assistant");

    controller.mobile.setResolvedMode("mobile");
    controller.mobile.show("left", "files");
    expect(controller.mobile.stage).toBe("left");
    expect(controller.mobile.activeLeftPanelId).toBe("files");

    controller.mobile.selectPanel("left", "projects");
    expect(controller.mobile.activeLeftPanelId).toBe("projects");

    unregisterProjects();
    expect(controller.mobile.activeLeftPanelId).toBe("files");
    controller.mobile.showMain();
    expect(controller.mobile.stage).toBe("main");

    expect(controller.left.getLayout()).toEqual({
      side: "left",
      collapsed: true,
      closed: false,
      width: 320,
    });
    expect(controller.right.getLayout()).toEqual({
      side: "right",
      collapsed: false,
      closed: true,
      width: 404,
    });
  });

  it("keeps mobile presentation out of durable layout snapshots", () => {
    const controller = new AppShellController();
    const projects = controller.createSidebar("projects", "left", {
      width: 312,
    });
    controller.mobile.registerPanel({
      id: "projects",
      side: "left",
      label: "Projects",
      kind: "sidebar",
    });
    controller.mobile.setResolvedMode("mobile");
    controller.mobile.show("left", "projects");

    expect(controller.getPanelId(projects)).toBe("projects");
    expect(controller.getLayout()).toEqual({
      version: APP_SHELL_LAYOUT_VERSION,
      panels: {
        left: {
          side: "left",
          collapsed: false,
          closed: false,
        },
        right: {
          side: "right",
          collapsed: false,
          closed: false,
        },
        projects: {
          side: "left",
          collapsed: false,
          closed: false,
          width: 312,
        },
      },
    });
  });

  it("supports an independent same-side controller for nested layouts", () => {
    const shell = new AppShellController({ leftClosed: true });
    const outerLeft = new AppShellSidebarController("left");

    outerLeft.collapse();
    expect(outerLeft.state).toBe("collapsed");
    expect(shell.left.state).toBe("closed");

    shell.left.open();
    outerLeft.close();
    expect(shell.left.state).toBe("expanded");
    expect(outerLeft.state).toBe("closed");
  });

  it("restores and saves every registered panel through the layout adapter", async () => {
    const persisted: AppShellLayoutV1 = {
      version: APP_SHELL_LAYOUT_VERSION,
      panels: {
        left: {
          side: "left",
          collapsed: true,
          closed: false,
          width: 336,
        },
        right: {
          side: "right",
          collapsed: false,
          closed: true,
          width: 404,
        },
        projects: {
          side: "left",
          collapsed: true,
          closed: true,
          width: 312,
        },
      },
    };
    const save = vi.fn<AppShellLayoutPersistence["save"]>(async () => {});
    const controller = new AppShellController({
      persistence: {
        load: async () => persisted,
        save,
      },
      saveDebounceMs: 20,
    });
    const projects = controller.createSidebar("projects", "left");

    expect(controller.layoutReady).toBe(false);
    await controller.restoreLayout();
    await controller.restoreLayout();

    expect(controller.layoutReady).toBe(true);
    expect(controller.left.state).toBe("collapsed");
    expect(controller.left.width).toBe(336);
    expect(controller.right.state).toBe("closed");
    expect(controller.right.width).toBe(404);
    expect(projects.state).toBe("closed");
    expect(projects.collapsed).toBe(true);
    expect(projects.width).toBe(312);
    expect(controller.getPanel("projects")).toBe(projects);

    controller.left.expand();
    projects.setWidth(360);
    await controller.flushSave();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(
      {
        version: APP_SHELL_LAYOUT_VERSION,
        panels: {
          left: {
            side: "left",
            collapsed: false,
            closed: false,
            width: 336,
          },
          right: {
            side: "right",
            collapsed: false,
            closed: true,
            width: 404,
          },
          projects: {
            side: "left",
            collapsed: true,
            closed: true,
            width: 360,
          },
        },
      },
      { source: "resize", panelId: "projects" },
    );
  });

  it("applies restored state to a named panel registered after hydration", async () => {
    const controller = new AppShellController({
      persistence: {
        load: async () => ({
          version: APP_SHELL_LAYOUT_VERSION,
          panels: {
            projects: {
              side: "left",
              collapsed: true,
              closed: false,
              width: 300,
            },
          },
        }),
        save: async () => {},
      },
    });

    await controller.restoreLayout();
    const projects = controller.createSidebar("projects", "left");

    expect(projects.state).toBe("collapsed");
    expect(projects.width).toBe(300);
  });

  it("provides a JSON localStorage layout adapter", async () => {
    const storage = createMemoryStorage();
    const persistence = createLocalStorageAppShellLayoutPersistence(
      "shell-layout",
      storage,
    );
    const layout: AppShellLayoutV1 = {
      version: APP_SHELL_LAYOUT_VERSION,
      panels: {
        left: {
          side: "left",
          collapsed: false,
          closed: false,
          width: 288,
        },
      },
    };

    await persistence.save(layout, { source: "resize", panelId: "left" });

    expect(storage.getItem("shell-layout")).toBe(JSON.stringify(layout));
    await expect(persistence.load()).resolves.toEqual(layout);

    const defaultPersistence = createLocalStorageAppShellLayoutPersistence(
      undefined,
      storage,
    );
    await defaultPersistence.save(layout, {
      source: "resize",
      panelId: "left",
    });
    expect(storage.getItem(APP_SHELL_DEFAULT_STORAGE_KEY)).toBe(
      JSON.stringify(layout),
    );
  });

  it("delays and cancels transient collapsed and closed previews", () => {
    vi.useFakeTimers();
    const sidebar = new AppShellSidebarController("left", true);

    sidebar.schedulePreview(240);
    vi.advanceTimersByTime(120);
    expect(sidebar.previewed).toBe(false);

    sidebar.schedulePreviewDismiss();
    vi.advanceTimersByTime(240);
    expect(sidebar.previewed).toBe(false);

    sidebar.schedulePreview(240);
    vi.advanceTimersByTime(240);
    expect(sidebar.previewed).toBe(true);
    expect(sidebar.state).toBe("collapsed");

    sidebar.schedulePreviewDismiss(120);
    vi.advanceTimersByTime(60);
    sidebar.keepPreview();
    vi.advanceTimersByTime(120);
    expect(sidebar.previewed).toBe(true);

    sidebar.schedulePreviewDismiss(120);
    vi.advanceTimersByTime(120);
    expect(sidebar.previewed).toBe(false);

    sidebar.close();
    sidebar.schedulePreview(240);
    vi.advanceTimersByTime(240);
    expect(sidebar.previewed).toBe(true);
    expect(sidebar.state).toBe("closed");

    sidebar.dismissPreview();
    sidebar.preview();
    expect(sidebar.previewed).toBe(true);
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, value);
    },
  };
}
