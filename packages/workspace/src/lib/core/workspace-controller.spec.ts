import { describe, expect, it } from "vitest";
import { createWorkspaceTabs } from "./layout.js";
import { WorkspaceController } from "./workspace-controller.svelte";

const firstTab = {
  id: "notes",
  title: "Notes",
  view: { type: "notes", state: { draft: "Initial" } },
};

describe("WorkspaceController", () => {
  it("creates nested horizontal and vertical tab splits and persists their sizes", () => {
    const controller = new WorkspaceController({
      layout: {
        version: 1,
        left: { open: true, size: 280 },
        right: { open: false, size: 320 },
        main: createWorkspaceTabs([firstTab], "notes-tabs"),
      },
    });

    expect(
      controller.splitTabGroup(
        "notes-tabs",
        "horizontal",
        "after",
        createWorkspaceTabs([], "right-tabs"),
      ),
    ).toBe(true);
    expect(
      controller.splitTabGroup(
        "right-tabs",
        "vertical",
        "after",
        createWorkspaceTabs([], "bottom-tabs"),
      ),
    ).toBe(true);

    expect(controller.layout.main).toMatchObject({
      kind: "split",
      direction: "horizontal",
      children: [
        { id: "notes-tabs" },
        {
          kind: "split",
          direction: "vertical",
          children: [{ id: "right-tabs" }, { id: "bottom-tabs" }],
        },
      ],
    });

    if (controller.layout.main.kind !== "split")
      throw new Error("expected root split");
    const vertical = controller.layout.main.children[1];
    if (!vertical || vertical.kind !== "split")
      throw new Error("expected nested split");
    expect(controller.setSplitSizes(vertical.id, [3, 1])).toBe(true);
    expect(vertical.sizes).toEqual([50, 50]);
    expect(controller.toJSON().main).toMatchObject({
      kind: "split",
      direction: "horizontal",
    });
    expect(controller.layout.main.children[1]).toMatchObject({
      sizes: [75, 25],
    });
  });

  it("selects, closes, and updates serializable view state", () => {
    const controller = new WorkspaceController({
      layout: {
        main: createWorkspaceTabs([firstTab], "tabs"),
      },
    });

    controller.addTab("tabs", {
      id: "details",
      title: "Details",
      view: { type: "details", state: {} },
    });
    expect(controller.layout.main).toMatchObject({ activeTabId: "details" });
    expect(controller.updateViewState("notes", { draft: "Updated" })).toBe(
      true,
    );
    expect(controller.closeTab("tabs", "details")).toBe(true);
    expect(controller.layout.main).toMatchObject({ activeTabId: "notes" });
    expect(controller.toJSON().main).toMatchObject({
      tabs: [{ id: "notes", view: { state: { draft: "Updated" } } }],
    });
  });

  it("prunes an empty nested pane and promotes its remaining split sibling", () => {
    const controller = new WorkspaceController({
      layout: {
        main: {
          kind: "split",
          id: "root",
          direction: "horizontal",
          sizes: [50, 50],
          children: [
            createWorkspaceTabs([firstTab], "notes-tabs"),
            {
              kind: "split",
              id: "nested",
              direction: "vertical",
              sizes: [50, 50],
              children: [
                createWorkspaceTabs(
                  [
                    {
                      id: "temporary",
                      title: "Temporary",
                      view: { type: "notes", state: {} },
                    },
                  ],
                  "temporary-tabs",
                ),
                createWorkspaceTabs(
                  [
                    {
                      id: "keep",
                      title: "Keep",
                      view: { type: "notes", state: {} },
                    },
                  ],
                  "keep-tabs",
                ),
              ],
            },
          ],
        },
      },
    });

    expect(controller.closeTab("temporary-tabs", "temporary")).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "split",
      id: "root",
      children: [{ id: "notes-tabs" }, { id: "keep-tabs" }],
      sizes: [50, 50],
    });
  });

  it("replaces the final closed tab with one usable empty root pane", () => {
    const controller = new WorkspaceController({
      layout: { main: createWorkspaceTabs([firstTab], "only-tabs") },
    });

    expect(controller.closeTab("only-tabs", "notes")).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "tabs",
      tabs: [],
      activeTabId: null,
    });
  });

  it("persists sidebar group collapse state", () => {
    const controller = new WorkspaceController();

    expect(controller.setSidebarGroupCollapsed("left", "navigator", true)).toBe(
      true,
    );
    expect(controller.toJSON().left.collapsedGroups).toEqual({
      navigator: true,
    });
    expect(controller.toggleSidebarGroup("left", "navigator")).toBe(true);
    expect(controller.toJSON().left.collapsedGroups).toEqual({
      navigator: false,
    });
  });

  it("reorders tabs within one strip using final destination indexes", () => {
    const controller = new WorkspaceController({
      layout: {
        main: createWorkspaceTabs(
          [
            firstTab,
            { id: "two", title: "Two", view: { type: "notes", state: {} } },
            {
              id: "three",
              title: "Three",
              view: { type: "notes", state: {} },
            },
          ],
          "tabs",
        ),
      },
    });

    expect(controller.moveTab("notes", "tabs", 2)).toBe(true);
    expect(controller.layout.main).toMatchObject({
      activeTabId: "notes",
      tabs: [{ id: "two" }, { id: "three" }, { id: "notes" }],
    });
  });

  it("moves a tab across panes and prunes its emptied source pane", () => {
    const controller = new WorkspaceController({
      layout: {
        main: {
          kind: "split",
          id: "root",
          direction: "horizontal",
          sizes: [50, 50],
          children: [
            createWorkspaceTabs([firstTab], "source"),
            createWorkspaceTabs(
              [
                {
                  id: "destination-tab",
                  title: "Destination",
                  view: { type: "notes", state: {} },
                },
              ],
              "destination",
            ),
          ],
        },
      },
    });

    expect(controller.moveTab("notes", "destination", 0)).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "tabs",
      id: "destination",
      activeTabId: "notes",
      tabs: [{ id: "notes" }, { id: "destination-tab" }],
    });
  });

  it("restores an empty split by dropping a tab into its recovery target", () => {
    const controller = new WorkspaceController({
      layout: {
        main: {
          kind: "split",
          id: "root",
          direction: "horizontal",
          sizes: [50, 50],
          children: [
            createWorkspaceTabs(
              [
                firstTab,
                {
                  id: "details",
                  title: "Details",
                  view: { type: "notes", state: {} },
                },
              ],
              "source",
            ),
            {
              kind: "split",
              id: "empty-split",
              direction: "vertical",
              sizes: [],
              children: [],
            },
          ],
        },
      },
    });

    expect(controller.dropTabOnEmptySplit("notes", "empty-split")).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "split",
      id: "root",
      children: [
        { id: "source", tabs: [{ id: "details" }] },
        { kind: "tabs", activeTabId: "notes", tabs: [{ id: "notes" }] },
      ],
      sizes: [50, 50],
    });
  });

  it("drops a tab on an edge to create a split beside the target pane", () => {
    const controller = new WorkspaceController({
      layout: {
        main: createWorkspaceTabs(
          [
            firstTab,
            {
              id: "details",
              title: "Details",
              view: { type: "notes", state: {} },
            },
          ],
          "tabs",
        ),
      },
    });

    expect(controller.dropTabOnGroup("details", "tabs", "right")).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "split",
      direction: "horizontal",
      sizes: [50, 50],
      children: [
        {
          kind: "tabs",
          id: "tabs",
          activeTabId: "notes",
          tabs: [{ id: "notes" }],
        },
        {
          kind: "tabs",
          activeTabId: "details",
          tabs: [{ id: "details" }],
        },
      ],
    });
  });

  it("drops a tab from another pane onto an edge and prunes its empty source", () => {
    const controller = new WorkspaceController({
      layout: {
        main: {
          kind: "split",
          id: "root",
          direction: "horizontal",
          sizes: [50, 50],
          children: [
            createWorkspaceTabs([firstTab], "source"),
            createWorkspaceTabs(
              [
                {
                  id: "destination-tab",
                  title: "Destination",
                  view: { type: "notes", state: {} },
                },
              ],
              "destination",
            ),
          ],
        },
      },
    });

    expect(controller.dropTabOnGroup("notes", "destination", "top")).toBe(true);
    expect(controller.layout.main).toMatchObject({
      kind: "split",
      direction: "vertical",
      sizes: [50, 50],
      children: [
        { kind: "tabs", activeTabId: "notes", tabs: [{ id: "notes" }] },
        {
          kind: "tabs",
          id: "destination",
          tabs: [{ id: "destination-tab" }],
        },
      ],
    });
  });

  it("does not split the only tab onto its own pane", () => {
    const controller = new WorkspaceController({
      layout: { main: createWorkspaceTabs([firstTab], "tabs") },
    });

    expect(controller.dropTabOnGroup("notes", "tabs", "left")).toBe(false);
    expect(controller.layout.main).toMatchObject({
      kind: "tabs",
      id: "tabs",
      tabs: [{ id: "notes" }],
    });
  });

  it("persists stacked presentation and icon-sidebar selection", () => {
    const controller = new WorkspaceController({
      layout: { main: createWorkspaceTabs([firstTab], "tabs", "stacked") },
    });

    expect(controller.selectSidebarTab("right", "outline")).toBe(true);
    expect(controller.toJSON()).toMatchObject({
      main: { presentation: "stacked" },
      right: { activeTabId: "outline" },
    });
  });

  it("creates stacked tab groups through the shared layout helper", () => {
    expect(createWorkspaceTabs([firstTab], "stacked-tabs", "stacked")).toEqual(
      expect.objectContaining({
        kind: "tabs",
        id: "stacked-tabs",
        presentation: "stacked",
        activeTabId: "notes",
      }),
    );
  });
});
