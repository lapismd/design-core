import { describe, expect, it, vi } from "vitest";
import { AppShellController } from "../core/app-shell-controller.svelte.js";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspaceTab,
} from "../core/layout.js";
import { WorkspaceMenu } from "../core/workspace-menu.js";
import { AppShellPlugin } from "../core/plugin-manager.svelte.js";
import { WorkspaceDiagnosticsManager } from "./diagnostics-manager.svelte.js";
import {
  PROBLEMS_STATUS_ITEM_ID,
  PROBLEMS_VIEW_TYPE,
  SHOW_PROBLEMS_COMMAND_ID,
  problemsPlugin,
} from "./problems-plugin.js";
import { WorkspaceProblemsController } from "./problems-controller.svelte.js";
import type {
  WorkspaceDiagnostic,
  WorkspaceDiagnosticResource,
} from "./types.js";

const alpha: WorkspaceDiagnosticResource = {
  uri: "memory:///alpha.md",
  label: "alpha.md",
};
const beta: WorkspaceDiagnosticResource = {
  uri: "memory:///beta.md",
  label: "beta.md",
};

const error: WorkspaceDiagnostic = {
  message: "Unexpected token",
  severity: "error",
  source: "parser",
  code: "parse-error",
  range: {
    start: { line: 4, character: 2 },
    end: { line: 4, character: 3 },
  },
};

class DiagnosticContributorPlugin extends AppShellPlugin {
  onload(): void {
    const collection = this.createDiagnosticCollection("owned", {
      label: "Owned diagnostics",
    });
    collection.set(alpha, [error]);
  }
}

class RecoveringPlugin extends AppShellPlugin {
  static attempts = 0;

  onload(): void {
    RecoveringPlugin.attempts += 1;
    if (RecoveringPlugin.attempts === 1) throw new Error("temporary failure");
  }
}

describe("WorkspaceDiagnosticsManager", () => {
  it("replaces, batches, iterates, and clears collection entries", () => {
    const manager = new WorkspaceDiagnosticsManager();
    const collection = manager.createCollection("parser", { label: "Parser" });

    collection.set(alpha, [error]);
    expect(collection.has(alpha)).toBe(true);
    expect(collection.get(alpha)).toEqual([error]);
    expect(manager.entries).toHaveLength(1);

    collection.set(alpha, [{ ...error, message: "Replacement" }]);
    expect(manager.entries.map((entry) => entry.diagnostic.message)).toEqual([
      "Replacement",
    ]);

    collection.set([
      [alpha, undefined],
      [beta, [{ message: "Unused value", severity: "hint" }]],
      [null, [{ message: "Workspace failure", severity: "warning" }]],
    ]);
    expect([...collection].map(([resource]) => resource?.uri ?? null)).toEqual([
      beta.uri,
      null,
    ]);
    expect(manager.counts).toEqual({
      error: 0,
      warning: 1,
      information: 0,
      hint: 1,
    });

    const visited: string[] = [];
    collection.forEach((resource, diagnostics) => {
      visited.push(`${resource?.uri ?? "workspace"}:${diagnostics.length}`);
    });
    expect(visited).toEqual([`${beta.uri}:1`, "workspace:1"]);

    expect(collection.delete(beta)).toBe(true);
    collection.clear();
    expect(manager.entries).toEqual([]);
    manager.dispose();
  });

  it("isolates owners, freezes published data, and disposes independently", () => {
    const manager = new WorkspaceDiagnosticsManager();
    const first = manager.createCollection("first");
    const second = manager.createCollection("second");
    first.set(alpha, [error]);
    second.set(alpha, [{ ...error, message: "Other owner" }]);

    expect(manager.entries).toHaveLength(2);
    expect(Object.isFrozen(manager.snapshot())).toBe(true);
    expect(Object.isFrozen(manager.entries[0]?.diagnostic)).toBe(true);
    first.dispose();
    expect(manager.entries.map((entry) => entry.collectionId)).toEqual([
      "second",
    ]);
    expect(() => first.set(alpha, [error])).toThrow(/disposed/u);
    expect(second.get(alpha)).toHaveLength(1);
    second.dispose();
  });

  it("runs only the owning collection item-menu hook", () => {
    const manager = new WorkspaceDiagnosticsManager();
    const firstAction = vi.fn();
    const secondAction = vi.fn();
    const first = manager.createCollection("first", {
      buildItemMenu(menu) {
        menu.addItem((item) => item.setTitle("First fix").onClick(firstAction));
      },
    });
    manager.createCollection("second", {
      buildItemMenu: secondAction,
    });
    first.set(alpha, [error]);

    const menu = new WorkspaceMenu();
    manager.buildItemMenu(menu, manager.entries[0]!);
    expect(menu.entries).toHaveLength(1);
    expect(secondAction).not.toHaveBeenCalled();
    const item = menu.entries[0];
    if (item?.kind === "item") void item.callback?.();
    expect(firstAction).toHaveBeenCalledOnce();
  });
});

describe("WorkspaceProblemsController", () => {
  it("groups, sorts, filters, searches, navigates, and copies", async () => {
    const manager = new WorkspaceDiagnosticsManager();
    const collection = manager.createCollection("language", {
      label: "Language Service",
      buildItemMenu(menu) {
        menu.addItem((item) => item.setTitle("Apply quick fix"));
      },
    });
    collection.set([
      [
        beta,
        [
          { message: "Later warning", severity: "warning" },
          { ...error, message: "Earlier error" },
        ],
      ],
      [alpha, [{ message: "Alpha info", severity: "information" }]],
      [null, [{ message: "Shell failure", severity: "error" }]],
    ]);
    const open = vi.fn();
    const writeText = vi.fn();
    const controller = new WorkspaceProblemsController(manager, {
      navigation: { open },
      clipboard: { writeText },
    });

    expect(controller.viewMode).toBe("tree");
    expect(controller.visibleEntries).toHaveLength(4);
    expect(controller.groups.map((group) => group.label)).toEqual([
      "Workspace",
      "alpha.md",
      "beta.md",
    ]);
    expect(
      controller.groups
        .find((group) => group.label === "beta.md")
        ?.entries.map((entry) => entry.diagnostic.message),
    ).toEqual(["Earlier error", "Later warning"]);

    controller.toggleSeverity("error");
    expect(controller.totalCount).toBe(2);
    controller.setQuery("parser");
    expect(controller.totalCount).toBe(0);
    controller.toggleSeverity("error");
    expect(controller.totalCount).toBe(1);

    const entry = controller.groups[0]!.entries[0]!;
    expect(await controller.open(entry)).toBe(true);
    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({ resource: beta, range: error.range }),
    );
    const menu = controller.createItemMenu(entry);
    expect(
      menu.entries.map((item) => (item.kind === "item" ? item.title : "---")),
    ).toEqual(["Copy Message", "Copy Problem", "---", "Apply quick fix"]);
    const copyMessage = menu.entries[0];
    if (copyMessage?.kind === "item") await copyMessage.callback?.();
    expect(writeText).toHaveBeenCalledWith("Problem message", "Earlier error");
    const copyProblem = menu.entries[1];
    if (copyProblem?.kind === "item") await copyProblem.callback?.();
    expect(writeText).toHaveBeenCalledWith(
      "Problem",
      JSON.stringify(
        [
          {
            resource: "beta.md",
            owner: "language",
            severity: 8,
            message: "Earlier error",
            source: "parser",
            code: { value: "parse-error" },
            startLineNumber: 5,
            startColumn: 3,
            endLineNumber: 5,
            endColumn: 4,
          },
        ],
        null,
        "\t",
      ),
    );

    controller.setQuery("");
    const group = controller.groups.find((item) => item.label === "beta.md");
    expect(group).toBeDefined();
    const groupMenu = controller.createGroupMenu(group!);
    expect(
      groupMenu.entries.map((item) =>
        item.kind === "item" ? item.title : "---",
      ),
    ).toEqual(["Copy Message", "Copy Problem"]);
    const copyGroupMessage = groupMenu.entries[0];
    if (copyGroupMessage?.kind === "item") await copyGroupMessage.callback?.();
    expect(writeText).toHaveBeenCalledWith(
      "Problem message",
      "Earlier error\nLater warning",
    );
    const copyGroupProblem = groupMenu.entries[1];
    if (copyGroupProblem?.kind === "item") await copyGroupProblem.callback?.();
    const groupPayload = writeText.mock.calls.at(-1)?.[1];
    expect(JSON.parse(groupPayload as string)).toEqual([
      expect.objectContaining({
        resource: "beta.md",
        owner: "language",
        message: "Earlier error",
        severity: 8,
      }),
      expect.objectContaining({
        resource: "beta.md",
        owner: "language",
        message: "Later warning",
        severity: 4,
      }),
    ]);
  });

  it("switches between grouped tree and flat table presentations", () => {
    const manager = new WorkspaceDiagnosticsManager();
    const collection = manager.createCollection("language");
    collection.set(beta, [error]);

    const controller = new WorkspaceProblemsController(manager, {
      defaultViewMode: "table",
    });
    expect(controller.viewMode).toBe("table");
    expect(controller.visibleEntries).toHaveLength(1);

    controller.toggleViewMode();
    expect(controller.viewMode).toBe("tree");
    controller.setViewMode("table");
    expect(controller.viewMode).toBe("table");
  });
});

describe("problemsPlugin", () => {
  it("automatically disposes plugin-owned collections", async () => {
    const app = new AppShellController({
      plugins: [
        {
          id: "diagnostic-contributor",
          plugin: DiagnosticContributorPlugin,
          enabled: true,
        },
      ],
    });
    await app.start();
    expect(app.diagnostics.entries).toHaveLength(1);
    expect(await app.plugins.disable("diagnostic-contributor")).toBe(true);
    expect(app.diagnostics.entries).toEqual([]);
    await app.dispose();
  });

  it("publishes and clears active static-plugin enablement failures", async () => {
    RecoveringPlugin.attempts = 0;
    const app = new AppShellController({
      plugins: [
        {
          id: "recovering-plugin",
          name: "Recovering plugin",
          plugin: RecoveringPlugin,
          enabled: true,
        },
      ],
    });
    await app.start();
    expect(app.diagnostics.entries).toEqual([
      expect.objectContaining({
        resource: null,
        diagnostic: expect.objectContaining({
          code: "app-shell.plugin-enablement",
          message: expect.stringContaining("temporary failure"),
        }),
      }),
    ]);

    expect(await app.plugins.enable("recovering-plugin")).toBe(true);
    expect(app.diagnostics.entries).toEqual([]);
    await app.dispose();
  });

  it("does not seed a Problems leaf and creates one only on command", async () => {
    const app = new AppShellController({ plugins: [problemsPlugin()] });
    await app.start();

    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toEqual([]);
    expect(app.renderer.layout.bottom.open).toBe(false);

    expect(await app.commands.execute(SHOW_PROBLEMS_COMMAND_ID)).toBe(true);
    const [leaf] = app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE);
    expect(leaf).toBeDefined();
    expect(app.renderer.layout.bottom.open).toBe(true);
    expect(leaf?.active).toBe(true);

    leaf?.close();
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toEqual([]);
    expect(await app.commands.execute(SHOW_PROBLEMS_COMMAND_ID)).toBe(true);
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toHaveLength(1);
    await app.dispose();
  });

  it("does not add another Problems leaf when one is already persisted", async () => {
    const layout = createDefaultWorkspaceLayout();
    const tab = createWorkspaceTab({
      id: "persisted-problems",
      title: "Problems",
      view: { type: PROBLEMS_VIEW_TYPE },
    });
    layout.bottom.root = createWorkspaceTabs([tab], {
      id: layout.bottom.root.id,
      activeItemId: tab.id,
    });
    const app = new AppShellController({ layout, plugins: [problemsPlugin()] });
    await app.start();

    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toHaveLength(1);
    expect(app.renderer.layout.bottom.root.items).toHaveLength(1);
    expect(app.renderer.layout.bottom.open).toBe(false);
    await app.dispose();
  });

  it("treats a missing-view Problems placeholder as the existing leaf", async () => {
    const layout = createDefaultWorkspaceLayout();
    const tab = createWorkspaceTab({
      id: "placeholder-problems",
      title: "Problems",
      icon: "ghost",
      view: {
        type: "empty",
        state: { __missingViewType: PROBLEMS_VIEW_TYPE },
      },
    });
    layout.bottom.root = createWorkspaceTabs([tab], {
      id: layout.bottom.root.id,
      activeItemId: tab.id,
    });
    const app = new AppShellController({ layout, plugins: [problemsPlugin()] });
    await app.start();

    const restored = findWorkspaceTab(
      app.renderer.layout,
      "placeholder-problems",
    );
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toHaveLength(1);
    expect(app.renderer.layout.bottom.root.items).toHaveLength(1);
    expect(restored?.tab.view.type).toBe(PROBLEMS_VIEW_TYPE);
    expect(restored?.tab.view.state?.["__missingViewType"]).toBeUndefined();
    expect(restored?.tab.icon).toBe("circle-alert");
    expect(await app.commands.execute(SHOW_PROBLEMS_COMMAND_ID)).toBe(true);
    expect(app.renderer.layout.bottom.root.items).toHaveLength(1);
    expect(app.renderer.layout.bottom.open).toBe(true);
    await app.dispose();
  });

  it("exposes a status item that reveals or creates Problems without opening on count changes", async () => {
    const app = new AppShellController({ plugins: [problemsPlugin()] });
    await app.start();

    const item = app.status.items.find(
      (entry) => entry.id === PROBLEMS_STATUS_ITEM_ID,
    );
    expect(item).toMatchObject({
      align: "right",
      priority: 480,
      icon: "circle-alert",
      label: "0",
    });
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toEqual([]);
    expect(app.renderer.layout.bottom.open).toBe(false);

    const collection = app.diagnostics.createCollection("test:status");
    collection.set(alpha, [error]);
    const updated = app.status.items.find(
      (entry) => entry.id === PROBLEMS_STATUS_ITEM_ID,
    );
    expect(updated?.label).toBe("1");
    expect(updated?.tooltip).toBe("1 problem");
    expect(app.renderer.layout.bottom.open).toBe(false);
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toEqual([]);

    await updated?.onSelect?.();
    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toHaveLength(1);
    expect(app.renderer.layout.bottom.open).toBe(true);
    await app.dispose();
  });

  it("contributes a live leaf badge without persisting its count", async () => {
    const app = new AppShellController({ plugins: [problemsPlugin()] });
    await app.start();
    expect(await app.commands.execute(SHOW_PROBLEMS_COMMAND_ID)).toBe(true);
    const [leaf] = app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE);
    const location = leaf
      ? findWorkspaceTab(app.renderer.layout, leaf.id)
      : undefined;
    const definition = app.renderer.registry.resolve(PROBLEMS_VIEW_TYPE);
    expect(leaf?.title).toBe("Problems");
    expect(location).toBeDefined();

    const getChrome = () =>
      definition?.getChrome?.({
        tab: location!.tab,
        hostId: location!.hostId,
        paneId: location!.pane.id,
        active: leaf?.active ?? false,
        showInlineTitle: app.renderer.showInlineTitle,
        activate: () => leaf?.activate() ?? false,
        close: () => leaf?.close() ?? false,
        setState: (state) => app.renderer.updateViewState(leaf!.id, state),
      });

    expect(getChrome()?.badge).toEqual({ value: 0, label: "0 problems" });
    const collection = app.diagnostics.createCollection("test:badge");
    collection.set(alpha, [error]);
    expect(getChrome()?.badge).toEqual({ value: 1, label: "1 problem" });
    expect(leaf?.title).toBe("Problems");
    expect(findWorkspaceTab(app.renderer.layout, leaf!.id)?.tab.title).toBe(
      "Problems",
    );
    await app.dispose();
  });

  it("preserves a moved Problems leaf and reveals its owning sidebar", async () => {
    const layout = createDefaultWorkspaceLayout();
    const tab = createWorkspaceTab({
      id: "persisted-problems",
      title: "Problems",
      view: { type: PROBLEMS_VIEW_TYPE },
    });
    layout.left.root = createWorkspaceTabs([tab], {
      id: "persisted-left",
      activeItemId: tab.id,
    });
    layout.left.open = false;
    const app = new AppShellController({ layout, plugins: [problemsPlugin()] });
    await app.start();

    expect(app.workspace.getLeavesOfType(PROBLEMS_VIEW_TYPE)).toHaveLength(1);
    expect(app.renderer.layout.bottom.root.items).toHaveLength(0);
    expect(await app.commands.execute(SHOW_PROBLEMS_COMMAND_ID)).toBe(true);
    expect(app.renderer.layout.left.open).toBe(true);
    expect(app.workspace.activeLeaf?.id).toBe(tab.id);
    await app.dispose();
  });
});
