import { describe, expect, it } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
} from "./layout.js";
import {
  workspaceLayoutFromJson,
  workspaceLayoutToJson,
} from "./workspace-json.js";

describe("Lapis-compatible workspace JSON", () => {
  it("round trips split, sidebar group, floating, and active leaf state", () => {
    const layout = createDefaultWorkspaceLayout();
    layout.left = {
      open: true,
      size: 280,
      root: createWorkspaceTabs(
        [
          {
            kind: "sidebar-group",
            id: "group",
            title: "Explorer",
            icon: "files",
            tabs: [
              createWorkspaceTab({
                id: "files",
                title: "Files",
                view: { type: "files", state: { path: "/" } },
              }),
            ],
            hiddenTabIds: [],
            collapsedByTabId: { files: true },
            panelSizesByTabId: { files: 100 },
          },
        ],
        { id: "left-tabs" },
      ),
    };
    layout.active = {
      hostId: "root",
      paneId: "left-tabs",
      tabId: "files",
    };
    layout.windows = [
      {
        id: "floating",
        mode: "floating",
        state: "collapsed",
        bounds: { x: 10, y: 20, width: 500, height: 300 },
        root: createWorkspaceTabs([
          createWorkspaceTab({ id: "float-leaf", title: "Floating" }),
        ]),
      },
    ];
    layout.bottom = {
      open: true,
      size: 260,
      root: createWorkspaceTabs(
        [
          createWorkspaceTab({
            id: "terminal",
            title: "Terminal",
            view: { type: "terminal", state: { session: "local" } },
          }),
        ],
        { id: "bottom-tabs" },
      ),
    };

    const json = workspaceLayoutToJson(layout);
    expect(json.left.width).toBe("280px");
    expect(json.active).toBe("files");
    expect(json.bottom).toMatchObject({
      id: "bottom-tabs",
      type: "tabs",
      height: "260px",
      children: [{ id: "terminal", type: "leaf" }],
    });
    expect(json.left.children[0]).toMatchObject({
      type: "tabs",
      children: [{ type: "sidebar-group", collapsed: { files: true } }],
    });

    const restored = workspaceLayoutFromJson(json);
    expect(restored.left.open).toBe(true);
    expect(restored.left.size).toBe(280);
    expect(restored.active.tabId).toBe("files");
    expect(restored.bottom).toMatchObject({
      open: true,
      size: 260,
      root: { id: "bottom-tabs", activeItemId: "terminal" },
    });
    expect(restored.windows[0]).toMatchObject({
      id: "floating",
      state: "collapsed",
    });
  });

  it("accepts the extracted V2 layout and drops runtime popouts on restore", () => {
    const current = createDefaultWorkspaceLayout();
    const { bottom: _bottom, version: _version, ...legacyFields } = current;
    const legacy = { ...legacyFields, version: 2 };
    expect(workspaceLayoutFromJson(legacy)).toMatchObject({
      version: 3,
      bottom: { open: false, size: 240 },
    });

    const json = workspaceLayoutToJson(current);
    json.floating = [
      {
        id: "popout",
        type: "floating",
        mode: "popout",
        direction: "vertical",
        sizes: [100],
        children: [json.main.children[0]!],
        x: 0,
        y: 0,
        width: 500,
        height: 400,
      },
    ];
    expect(workspaceLayoutFromJson(json).windows).toEqual([]);
  });

  it("preserves grouped leaf ids and view state through restore", () => {
    const layout = createDefaultWorkspaceLayout();
    layout.right = {
      open: true,
      size: 280,
      root: createWorkspaceTabs(
        [
          {
            kind: "sidebar-group",
            id: "tools",
            title: "Tools",
            tabs: [
              createWorkspaceTab({
                id: "fixture-a",
                title: "Fixture A",
                view: { type: "fixture-a", state: { mode: "preview", file: "Note.md" } },
              }),
              createWorkspaceTab({
                id: "fixture-b",
                title: "Fixture B",
                view: { type: "fixture-b", state: { mode: "source" } },
              }),
            ],
            hiddenTabIds: [],
            collapsedByTabId: {},
            panelSizesByTabId: {},
          },
        ],
        { id: "right-tabs" },
      ),
    };

    const restored = workspaceLayoutFromJson(workspaceLayoutToJson(layout));
    const group =
      restored.right.root.kind === "tabs"
        ? restored.right.root.items[0]
        : null;
    if (!group || group.kind !== "sidebar-group") {
      throw new Error("Expected a restored sidebar group");
    }
    expect(group.id).toBe("tools");
    expect(
      group.tabs.map((tab) => ({
        id: tab.id,
        type: tab.view.type,
        state: tab.view.state,
      })),
    ).toEqual([
      {
        id: "fixture-a",
        type: "fixture-a",
        state: { mode: "preview", file: "Note.md" },
      },
      {
        id: "fixture-b",
        type: "fixture-b",
        state: { mode: "source" },
      },
    ]);
  });

  it("serializes reactive-compatible view state proxies", () => {
    const layout = createDefaultWorkspaceLayout();
    if (layout.main.kind !== "tabs" || layout.main.items[0]?.kind !== "tab") {
      throw new Error("Expected the default layout to contain a tab");
    }
    layout.main.items[0].view.state = new Proxy(
      { message: "proxied view state" },
      {},
    );

    expect(workspaceLayoutToJson(layout).main.children[0]).toMatchObject({
      type: "tabs",
      children: [
        {
          type: "leaf",
          state: { state: { message: "proxied view state" } },
        },
      ],
    });
  });
});
