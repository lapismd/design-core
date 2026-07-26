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

    const json = workspaceLayoutToJson(layout);
    expect(json.left.width).toBe("280px");
    expect(json.active).toBe("files");
    expect(json.left.children[0]).toMatchObject({
      type: "tabs",
      children: [{ type: "sidebar-group", collapsed: { files: true } }],
    });

    const restored = workspaceLayoutFromJson(json);
    expect(restored.left.open).toBe(true);
    expect(restored.left.size).toBe(280);
    expect(restored.active.tabId).toBe("files");
    expect(restored.windows[0]).toMatchObject({
      id: "floating",
      state: "collapsed",
    });
  });

  it("accepts the extracted V2 layout and drops runtime popouts on restore", () => {
    const legacy = createDefaultWorkspaceLayout();
    expect(workspaceLayoutFromJson(legacy)).toMatchObject({ version: 2 });

    const json = workspaceLayoutToJson(legacy);
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
