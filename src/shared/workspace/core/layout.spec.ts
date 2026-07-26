import { describe, expect, it } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspacePane,
  findWorkspaceTab,
  normalizeWorkspaceLayout,
} from "./layout.js";

describe("WorkspaceLayoutV2", () => {
  it("rejects legacy and malformed top-level layouts", () => {
    const fallback = createDefaultWorkspaceLayout();
    expect(normalizeWorkspaceLayout({ version: 1 }, fallback)).toEqual(
      fallback,
    );
    expect(normalizeWorkspaceLayout(null, fallback)).toEqual(fallback);
  });

  it("normalizes recursive splits and JSON-safe sidebar group state", () => {
    const layout = normalizeWorkspaceLayout({
      version: 2,
      main: {
        kind: "split",
        id: "split",
        direction: "horizontal",
        sizes: [9, 1],
        children: [
          createWorkspaceTabs([createWorkspaceTab({ id: "a", title: "A" })], {
            id: "a-pane",
          }),
          createWorkspaceTabs([createWorkspaceTab({ id: "b", title: "B" })], {
            id: "b-pane",
          }),
        ],
      },
      left: {
        open: true,
        size: 20,
        root: {
          kind: "tabs",
          id: "left",
          activeItemId: "group",
          presentation: "top",
          items: [
            {
              kind: "sidebar-group",
              id: "group",
              title: "Explorer",
              icon: "files",
              tabs: [createWorkspaceTab({ id: "files", title: "Files" })],
              hiddenTabIds: ["files", "unknown"],
              collapsedByTabId: { files: true, unknown: true },
              panelSizesByTabId: { files: 12, unknown: 900 },
            },
          ],
        },
      },
      right: {
        open: false,
        size: 900,
        root: createWorkspaceTabs([], { id: "right" }),
      },
      windows: [],
      active: { hostId: "root", paneId: "missing", tabId: "missing" },
    });

    expect(layout.left.size).toBe(180);
    expect(layout.right.size).toBe(640);
    expect(layout.main.kind).toBe("split");
    if (layout.main.kind === "split")
      expect(layout.main.sizes).toEqual([90, 10]);
    expect(layout.left.root.kind).toBe("tabs");
    if (layout.left.root.kind !== "tabs") return;
    const group = layout.left.root.items[0];
    expect(group?.kind).toBe("sidebar-group");
    if (group?.kind === "sidebar-group") {
      expect(group.hiddenTabIds).toEqual(["files"]);
      expect(group.collapsedByTabId).toEqual({ files: true });
      expect(group.panelSizesByTabId).toEqual({ files: 12 });
      expect(group.icon).toBe("files");
    }
    expect(layout.active.tabId).toBe("a");
  });

  it("finds panes and grouped tabs without leaking mutable snapshots", () => {
    const layout = createDefaultWorkspaceLayout();
    expect(findWorkspacePane(layout, "main-pane")?.id).toBe("main-pane");
    expect(findWorkspaceTab(layout, "welcome")?.tab.title).toBe(
      "No file is open",
    );
  });
});
