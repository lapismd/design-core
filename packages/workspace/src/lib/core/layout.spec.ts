import { describe, expect, it } from "vitest";
import {
  createWorkspaceLayout,
  normalizeSizes,
  normalizeWorkspaceLayout,
} from "./layout.js";

describe("workspace layout normalization", () => {
  it("creates a usable empty layout", () => {
    const layout = createWorkspaceLayout();
    expect(layout.version).toBe(1);
    expect(layout.main.kind).toBe("tabs");
    expect(layout.left).toEqual({
      open: true,
      size: 280,
      activeTabId: null,
      collapsedGroups: {},
    });
    expect(layout.right).toEqual({
      open: false,
      size: 320,
      activeTabId: null,
      collapsedGroups: {},
    });
  });

  it("repairs invalid split sizes, sidebar values, and active tabs", () => {
    const layout = normalizeWorkspaceLayout({
      left: { open: "yes", size: 2 },
      right: { open: true, size: 900 },
      main: {
        kind: "split",
        id: "root",
        direction: "vertical",
        sizes: [Infinity, -1],
        children: [
          {
            kind: "tabs",
            id: "tabs",
            activeTabId: "missing",
            tabs: [
              { id: "one", title: "One", view: { type: "story", state: null } },
              { id: "two", title: "Two", view: { type: "story", state: {} } },
            ],
          },
          { kind: "tabs", id: "empty", activeTabId: "bad", tabs: [] },
        ],
      },
    });

    expect(layout.left).toEqual({
      open: true,
      size: 220,
      activeTabId: null,
      collapsedGroups: {},
    });
    expect(layout.right).toEqual({
      open: true,
      size: 520,
      activeTabId: null,
      collapsedGroups: {},
    });
    expect(layout.main.kind).toBe("split");
    if (layout.main.kind === "split") {
      expect(layout.main.sizes).toEqual([50, 50]);
      expect(layout.main.children[0]).toMatchObject({
        kind: "tabs",
        presentation: "top",
        activeTabId: "one",
      });
      expect(layout.main.children[1]).toMatchObject({
        kind: "tabs",
        activeTabId: null,
      });
    }
  });

  it("normalizes arbitrary positive size weights to percentages", () => {
    expect(normalizeSizes([1, 3], 2)).toEqual([25, 75]);
    expect(normalizeSizes([], 3)).toEqual([33.3333, 33.3333, 33.3333]);
  });
});
