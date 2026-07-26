import { describe, expect, it } from "vitest";
import type { WorkspaceSidebarGroup } from "../core/types.js";
import {
  collapsedSidebarPanelSize,
  sidebarPanelDefaultSizes,
} from "./workspace-sidebar-layout.js";

const group: WorkspaceSidebarGroup = {
  kind: "sidebar-group",
  id: "group",
  title: "Group",
  tabs: [
    {
      kind: "tab",
      id: "outline",
      title: "Outline",
      view: { type: "empty" },
    },
    {
      kind: "tab",
      id: "links",
      title: "Links",
      view: { type: "empty" },
    },
  ],
  hiddenTabIds: [],
  collapsedByTabId: { links: true },
  panelSizesByTabId: { outline: 70 },
};

describe("workspace sidebar layout", () => {
  it("converts the exact 32px panel header into a stack percentage", () => {
    expect(collapsedSidebarPanelSize(400, 2)).toBe(8);
    expect(collapsedSidebarPanelSize(800, 2)).toBe(4);
  });

  it("reserves collapsed header space and normalizes expanded panels", () => {
    expect(sidebarPanelDefaultSizes(group, group.tabs, 8)).toEqual([92, 8]);
  });
});
