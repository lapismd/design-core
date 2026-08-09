import { describe, expect, it, vi } from "vitest";
import {
  createDefaultWorkspaceLayout,
  createWorkspaceTab,
  createWorkspaceTabs,
  findWorkspacePane,
} from "../core/layout.js";
import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
import {
  createWorkspaceEmptyActions,
  createWorkspaceSidebarLinks,
} from "./workspace-empty-actions.js";

describe("workspace empty actions", () => {
  it("creates a tab before ordered downstream actions", () => {
    const layout = createDefaultWorkspaceLayout();
    layout.main = createWorkspaceTabs([], { id: "empty-main" });
    layout.active = { hostId: "root", paneId: "empty-main", tabId: null };
    const controller = new WorkspaceShellController({ layout });
    const customAction = vi.fn();
    controller.emptyViewActions.addItem({
      id: "consumer:custom",
      label: "Custom Action",
      onSelect: customAction,
    });

    const actions = createWorkspaceEmptyActions(controller, "empty-main", () =>
      createWorkspaceTab({ id: "created", title: "New Tab" }),
    );

    expect(actions.map((action) => action.label)).toEqual([
      "Create Tab",
      "Custom Action",
    ]);
    actions[0]?.onSelect();
    expect(findWorkspacePane(controller.layout, "empty-main")?.items).toEqual([
      expect.objectContaining({ id: "created", title: "New Tab" }),
    ]);
    actions[1]?.onSelect();
    expect(customAction).toHaveBeenCalledOnce();
  });

  it("offers links for registered sidebar panels and toggles the selected panel", () => {
    const files = createWorkspaceTab({ id: "files", title: "Files" });
    const search = createWorkspaceTab({ id: "search", title: "Search" });
    const layout = createDefaultWorkspaceLayout();
    layout.main = createWorkspaceTabs([], { id: "empty-main" });
    layout.left = {
      open: false,
      size: 300,
      root: createWorkspaceTabs([files, search], { id: "left-sidebar" }),
    };
    layout.active = { hostId: "root", paneId: "empty-main", tabId: null };
    const controller = new WorkspaceShellController({ layout });

    const links = createWorkspaceSidebarLinks(controller, "empty-main");

    expect(links.map((link) => link.label)).toEqual(["Files", "Search"]);
    links[1]?.onSelect();
    expect(controller.layout.left.open).toBe(true);
    expect(controller.layout.left.root).toMatchObject({
      activeItemId: "search",
    });
    expect(controller.activeTabId).toBe("search");

    createWorkspaceSidebarLinks(controller, "empty-main")[1]?.onSelect();
    expect(controller.layout.left.open).toBe(false);
    expect(createWorkspaceSidebarLinks(controller, "left-sidebar")).toEqual([]);
  });
});
