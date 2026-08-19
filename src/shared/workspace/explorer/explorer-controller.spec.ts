import { describe, expect, it, vi } from "vitest";
import { ExplorerController } from "./explorer-controller.svelte.js";
import { createMemoryExplorerAdapter } from "./memory-adapter.js";
import {
  buildExplorerTree,
  compareExplorerNodes,
  filterHiddenExplorerTree,
} from "./tree.js";
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

  it("prunes dot-named nodes unless show-hidden is on", () => {
    const withHidden = buildExplorerTree(
      [
        ...seed,
        { path: ".env", name: ".env", kind: "file" },
        {
          path: ".obsidian",
          name: ".obsidian",
          kind: "folder",
          children: [
            { path: ".obsidian/app.json", name: "app.json", kind: "file" },
          ],
        },
      ],
      "name-asc",
    );
    const hidden = filterHiddenExplorerTree(withHidden, false);
    expect(hidden.children?.map((node) => node.name)).toEqual([
      "empty",
      "notes",
      "readme.md",
    ]);
    const shown = filterHiddenExplorerTree(withHidden, true);
    expect(shown.children?.some((node) => node.name === ".env")).toBe(true);
    expect(shown.children?.some((node) => node.name === ".obsidian")).toBe(
      true,
    );
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

    // Enter followed by blur may submit the same rename twice. Once the first
    // submission clears editing state, the stale blur must be ignored.
    await controller.commitRename("Untitled", "docs");
    expect(controller.selectedPath).toBe("docs");

    await controller.moveNode("Untitled.md", "docs");
    await controller.refresh();
    const docs = controller.root.children?.find((node) => node.path === "docs");
    expect(
      docs?.children?.some((node) => node.path === "docs/Untitled.md"),
    ).toBe(true);

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

  it("hides dotted names until show-hidden is toggled", async () => {
    const memory = createMemoryExplorerAdapter(
      [
        ...seed,
        { path: ".env", name: ".env", kind: "file" },
        {
          path: ".obsidian",
          name: ".obsidian",
          kind: "folder",
          children: [
            { path: ".obsidian/app.json", name: "app.json", kind: "file" },
          ],
        },
      ],
      { showHiddenFiles: false },
    );
    const controller = new ExplorerController({
      tree: memory.tree,
      actions: memory.actions,
      selection: memory.selection,
      preferences: memory.preferences,
    });
    const stop = controller.start();
    await controller.refresh();
    expect(
      controller.root.children?.some((node) => node.name.startsWith(".")),
    ).toBe(false);
    await controller.toggleShowHiddenFiles();
    expect(controller.showHiddenFiles).toBe(true);
    expect(memory.preferences.getShowHiddenFiles()).toBe(true);
    expect(controller.root.children?.some((node) => node.name === ".env")).toBe(
      true,
    );
    expect(
      controller.root.children?.some((node) => node.name === ".obsidian"),
    ).toBe(true);
    controller.applyShowHiddenFiles(false);
    await vi.waitFor(() => {
      expect(controller.showHiddenFiles).toBe(false);
      expect(
        controller.root.children?.some((node) => node.name.startsWith(".")),
      ).toBe(false);
    });
    stop();
  });

  it("forwards semantic file-open dispositions to the consumer adapter", async () => {
    const { controller, memory } = createController();

    await controller.openFile("notes/alpha.md");
    await controller.openFile("notes/alpha.md", {
      disposition: "reveal-or-new-tab",
    });
    await controller.openFile("notes/alpha.md", {
      disposition: "new-tab",
    });

    expect(memory.openRequests).toEqual([
      {
        path: "notes/alpha.md",
        options: { disposition: "current" },
      },
      {
        path: "notes/alpha.md",
        options: { disposition: "reveal-or-new-tab" },
      },
      {
        path: "notes/alpha.md",
        options: { disposition: "new-tab" },
      },
    ]);
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
      expect(controller.revealState).toEqual({
        path: "notes/alpha.md",
        isFlashing: true,
      });
    });
    controller.clearRevealFlash();
    controller.setSelectedPath("notes/zeta.md");
    memory.setActivePath("notes/zeta.md");
    await vi.waitFor(() => {
      expect(controller.selectedPath).toBe("notes/zeta.md");
      expect(controller.expandedPaths.has("notes")).toBe(true);
    });
    expect(controller.revealState.isFlashing).toBe(false);
    controller.revealPath("notes/zeta.md");
    expect(controller.revealState).toEqual({
      path: "notes/zeta.md",
      isFlashing: true,
    });
    stop();
  });
});
