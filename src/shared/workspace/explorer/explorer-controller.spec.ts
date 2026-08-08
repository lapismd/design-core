import { describe, expect, it, vi } from "vitest";
import { ExplorerController } from "./explorer-controller.svelte.js";
import { createMemoryExplorerAdapter } from "./memory-adapter.js";
import { buildExplorerTree, compareExplorerNodes } from "./tree.js";
import type { ExplorerNode } from "./types.js";

const seed: ExplorerNode[] = [
  {
    path: "notes",
    name: "notes",
    kind: "folder",
    children: [
      { path: "notes/alpha.md", name: "alpha.md", kind: "file" },
      { path: "notes/zeta.md", name: "zeta.md", kind: "file" },
    ],
  },
  { path: "readme.md", name: "readme.md", kind: "file" },
  {
    path: "empty",
    name: "empty",
    kind: "folder",
    children: [],
  },
];

function createController(
  options: { autoReveal?: boolean; loading?: boolean } = {},
) {
  const memory = createMemoryExplorerAdapter(seed, {
    autoReveal: options.autoReveal,
  });
  const controller = new ExplorerController({
    tree: memory.tree,
    actions: memory.actions,
    selection: memory.selection,
    preferences: memory.preferences,
    loading: options.loading,
  });
  return { controller, memory };
}

describe("explorer tree helpers", () => {
  it("sorts folders before files and respects name direction", () => {
    const root = buildExplorerTree(seed, "name-asc");
    expect(root.children?.map((node) => node.name)).toEqual([
      "empty",
      "notes",
      "readme.md",
    ]);
    const notes = root.children?.find((node) => node.path === "notes");
    expect(notes?.children?.map((node) => node.name)).toEqual([
      "alpha.md",
      "zeta.md",
    ]);

    const desc = buildExplorerTree(seed, "name-desc");
    expect(desc.children?.map((node) => node.name)).toEqual([
      "notes",
      "empty",
      "readme.md",
    ]);
    expect(
      compareExplorerNodes(
        { path: "a", name: "a", kind: "folder" },
        { path: "b.md", name: "b.md", kind: "file" },
        "name-asc",
      ),
    ).toBeLessThan(0);
  });
});

describe("ExplorerController", () => {
  it("refreshes from the tree adapter and sorts children", async () => {
    const { controller } = createController();
    const stop = controller.start();
    await controller.refresh();
    expect(controller.root.children?.map((node) => node.name)).toEqual([
      "empty",
      "notes",
      "readme.md",
    ]);
    stop();
  });

  it("expands ancestors on reveal and toggles collapse-all", async () => {
    const { controller } = createController();
    await controller.refresh();
    controller.revealPath("notes/zeta.md");
    expect(controller.expandedPaths.has("notes")).toBe(true);
    expect(controller.selectedPath).toBe("notes/zeta.md");
    expect(controller.revealState).toEqual({
      path: "notes/zeta.md",
      isFlashing: true,
    });

    controller.toggleCollapseAll();
    expect(controller.expandedPaths.size).toBe(0);
    controller.toggleCollapseAll();
    expect(controller.expandedPaths.has("notes")).toBe(true);
    expect(controller.expandedPaths.has("empty")).toBe(true);
  });

  it("selectRoot clears selection so creates target the vault root", async () => {
    const { controller } = createController();
    await controller.refresh();
    controller.setSelectedPath("notes/alpha.md");
    expect(controller.parentPathForCreate()).toBe("notes");
    controller.selectRoot();
    expect(controller.selectedPath).toBe("");
    expect(controller.parentPathForCreate()).toBe("");
  });

  it("creates, renames, moves, and deletes through adapters", async () => {
    const { controller, memory } = createController();
    await controller.refresh();

    const filePath = await controller.createFile("");
    expect(filePath).toBe("Untitled.md");
    expect(memory.openedPaths).toContain("Untitled.md");
    expect(controller.selectedPath).toBe("Untitled.md");

    const folderPath = await controller.createFolder("");
    expect(folderPath).toBe("Untitled");
    expect(controller.editingPath).toBe("Untitled");
    await controller.commitRename("Untitled", "docs");
    expect(controller.selectedPath).toBe("docs");

    await controller.moveNode("Untitled.md", "docs");
    await controller.refresh();
    const docs = controller.root.children?.find((node) => node.path === "docs");
    expect(docs?.children?.some((node) => node.path === "docs/Untitled.md")).toBe(
      true,
    );

    await controller.deleteNode("empty");
    expect(
      controller.root.children?.some((node) => node.path === "empty"),
    ).toBe(false);
  });

  it("reads and writes auto-reveal preferences", async () => {
    const { controller, memory } = createController({ autoReveal: false });
    const stop = controller.start();
    await vi.waitFor(() => {
      expect(controller.autoReveal).toBe(false);
    });
    await controller.toggleAutoReveal();
    expect(controller.autoReveal).toBe(true);
    expect(memory.preferences.getAutoReveal()).toBe(true);
    stop();
  });

  it("builds item menus with builtins and extension hooks", async () => {
    const memory = createMemoryExplorerAdapter(seed);
    const extension = vi.fn();
    const controller = new ExplorerController({
      tree: memory.tree,
      actions: memory.actions,
      buildItemMenu: extension,
    });
    await controller.refresh();
    const file = controller.root.children?.find(
      (node) => node.path === "readme.md",
    );
    expect(file).toBeTruthy();
    const menu = controller.createItemMenu(file!);
    const titles = menu.entries
      .filter((entry) => entry.kind === "item" || entry.kind === "submenu")
      .map((entry) =>
        entry.kind === "submenu" || entry.kind === "item" ? entry.title : "",
      );
    expect(titles).toContain("New note");
    expect(titles).toContain("Copy Path");
    expect(titles).toContain("Rename...");
    expect(titles).toContain("Delete");
    expect(extension).toHaveBeenCalledWith(menu, file, "explorer");

    const sort = controller.createSortMenu();
    expect(sort.entries).toHaveLength(2);
  });

  it("syncs selection adapter updates and auto-reveals", async () => {
    const { controller, memory } = createController({ autoReveal: true });
    const stop = controller.start();
    await controller.refresh();
    await vi.waitFor(() => {
      expect(controller.autoReveal).toBe(true);
    });
    memory.setActivePath("notes/alpha.md");
    await vi.waitFor(() => {
      expect(controller.selectedPath).toBe("notes/alpha.md");
      expect(controller.expandedPaths.has("notes")).toBe(true);
    });
    stop();
  });
});
