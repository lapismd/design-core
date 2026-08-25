<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import * as exampleSources from "./WorkspaceSidebar.example-sources.js";
  import WorkspaceSidebar from "./WorkspaceSidebar.svelte";
  import "./WorkspaceSidebar.stories.css";

  function resolveTokenColor(element: HTMLElement, token: string) {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;background:var(${token})`;
    element.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }

  const { Story } = defineMeta({
    title: "Workspace/Components/Sidebar",
    component: WorkspaceSidebar,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Composable left/right sidebar chrome with icon tabs, grouped panels, source context menus, group metadata editing, top/bottom drop targets, empty state, and controller-owned close behavior.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  function createController(withItems = true) {
    const files = createWorkspaceTab({
      id: "sidebar-files",
      title: "Files",
      icon: "files",
      view: { type: "example" },
    });
    const outline = createWorkspaceTab({
      id: "sidebar-outline",
      title: "Outline",
      icon: "list-tree",
      view: { type: "example" },
    });
    const links = createWorkspaceTab({
      id: "sidebar-links",
      title: "Links",
      icon: "link",
      view: { type: "example" },
    });
    const group: WorkspaceSidebarGroup = {
      kind: "sidebar-group",
      id: "sidebar-reference",
      title: "Reference",
      icon: "panel-top",
      tabs: [outline, links],
      hiddenTabIds: [],
      collapsedByTabId: { [outline.id]: false, [links.id]: true },
      panelSizesByTabId: { [outline.id]: 80 },
    };
    const pane = createWorkspaceTabs(withItems ? [files, group] : [], {
      id: withItems ? "sidebar-story-pane" : "sidebar-empty-pane",
      activeItemId: withItems ? files.id : null,
    });
    const layout = createDefaultWorkspaceLayout();
    layout.right = { open: true, size: 320, root: pane };
    layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: withItems ? files.id : null,
    };
    const controller = new WorkspaceShellController({ layout });
    controller.registry.register({
      kind: "svelte",
      type: "example",
      component: ExampleWorkspaceView,
    });
    return controller;
  }

  const controller = createController();
  const contextMenuController = createController();
  const insertionController = createController();
  const insertionDrag = new WorkspaceDragState(insertionController);
  const emptyController = createController(false);
  const dragRegionController = createController();
  const dragRegionLeftTab = createWorkspaceTab({
    id: "drag-region-left-files",
    title: "Left files",
    icon: "files",
    view: { type: "example" },
  });
  dragRegionController.layout.left = {
    open: true,
    size: 320,
    root: createWorkspaceTabs([dragRegionLeftTab], {
      id: "drag-region-left-pane",
      activeItemId: dragRegionLeftTab.id,
    }),
  };
</script>

<Story
  name="Icon tabs and grouped panels"
  tags={["visual-approved"]}
  play={async ({ canvas, canvasElement }) => {
    const sidebar = canvasElement.querySelector<HTMLElement>(
      '[data-workspace-surface="right-sidebar"]',
    );
    const directViewHost = canvasElement.querySelector<HTMLElement>(
      '.ui-workspace-sidebar__drop-target > [data-ui-component="workspace-view-host"]',
    );
    const directDropTarget = directViewHost?.parentElement;
    await expect(sidebar).not.toBeNull();
    await expect(directViewHost).not.toBeNull();
    await expect(directDropTarget).not.toBeNull();
    const tabSpacer = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-tab-spacer"]',
    );
    const filesTab = canvas.getByRole("tab", { name: "Files" });
    await expect(tabSpacer).not.toBeNull();
    await expect(tabSpacer).toHaveAttribute("data-desktop-drag-region", "");
    await expect(filesTab).not.toHaveAttribute("data-desktop-drag-region");
    await expect(
      getComputedStyle(tabSpacer!)
        .getPropertyValue("-webkit-app-region")
        .trim(),
    ).toBe("drag");
    const resizeRail = canvas.getByRole("button", {
      name: "Resize right sidebar",
    });
    expect(getComputedStyle(resizeRail).cursor).toBe("col-resize");
    expect(directViewHost!.getBoundingClientRect().height).toBeCloseTo(
      directDropTarget!.getBoundingClientRect().height,
      0,
    );
    expect(getComputedStyle(directViewHost!).backgroundColor).toBe(
      getComputedStyle(sidebar!).backgroundColor,
    );
    expect(
      resolveTokenColor(
        directViewHost!,
        "--ui-workspace-view-secondary-background",
      ),
    ).toBe(resolveTokenColor(directViewHost!, "--ui-workspace-background"));
    expect(
      resolveTokenColor(
        directViewHost!,
        "--ui-workspace-view-secondary-background",
      ),
    ).not.toBe(getComputedStyle(directViewHost!).backgroundColor);

    const reference = canvas.getByRole("tab", { name: "Reference" });
    await userEvent.click(reference);
    await expect(reference).toHaveAttribute("aria-selected", "true");
    await expect(
      canvas.getByRole("button", { name: "Collapse Outline" }),
    ).toBeVisible();
    const groupedViewHost = canvasElement.querySelector<HTMLElement>(
      '[data-ui-component="workspace-sidebar-group"] [data-ui-component="workspace-view-host"]',
    );
    const groupedBody = groupedViewHost?.closest<HTMLElement>(
      ".ui-workspace-sidebar-group__body",
    );
    await expect(groupedViewHost).not.toBeNull();
    await expect(groupedBody).not.toBeNull();
    expect(getComputedStyle(groupedViewHost!).backgroundColor).toBe(
      getComputedStyle(groupedBody!).backgroundColor,
    );
    expect(getComputedStyle(groupedViewHost!).backgroundColor).not.toBe(
      getComputedStyle(sidebar!).backgroundColor,
    );
    expect(
      resolveTokenColor(
        groupedViewHost!,
        "--ui-workspace-view-secondary-background",
      ),
    ).toBe(resolveTokenColor(groupedViewHost!, "--ui-workspace-secondary"));
    expect(
      resolveTokenColor(
        groupedViewHost!,
        "--ui-workspace-view-secondary-background",
      ),
    ).not.toBe(getComputedStyle(groupedViewHost!).backgroundColor);
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar/icon-tabs-and-grouped-panels-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar {controller} side="right" />
    </div>
  {/snippet}
</Story>

<Story
  name="Left and right desktop drag spacers"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const sidebars = canvasElement.querySelectorAll<HTMLElement>(
      '[data-ui-component="workspace-sidebar"]',
    );
    const spacers = canvasElement.querySelectorAll<HTMLElement>(
      '[data-ui-part="sidebar-tab-spacer"]',
    );
    const tabs = canvasElement.querySelectorAll<HTMLElement>(
      '[data-ui-part="sidebar-tab"]',
    );

    await expect(sidebars).toHaveLength(2);
    await expect(spacers).toHaveLength(2);
    for (const spacer of spacers) {
      await expect(spacer).toHaveAttribute("data-desktop-drag-region", "");
      await expect(
        getComputedStyle(spacer).getPropertyValue("-webkit-app-region").trim(),
      ).toBe("drag");
    }
    for (const tab of tabs) {
      await expect(tab).not.toHaveAttribute("data-desktop-drag-region");
    }
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-pair">
      <div class="ui-workspace-sidebar-story-frame">
        <WorkspaceSidebar controller={dragRegionController} side="left" />
      </div>
      <div class="ui-workspace-sidebar-story-frame">
        <WorkspaceSidebar controller={dragRegionController} side="right" />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Header insertion targets"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    insertionDrag.clear();
    insertionController.dropTab(
      "sidebar-files",
      "sidebar-story-pane",
      "center",
      "api",
      0,
    );
    insertionController.selectTab("sidebar-files");
    await waitFor(() => {
      expect(
        Array.from(
          canvasElement.querySelectorAll("[data-workspace-item-id]"),
          (element) => element.getAttribute("data-workspace-item-id"),
        ),
      ).toEqual(["sidebar-files", "sidebar-reference"]);
    });

    const reference = canvas.getByRole("tab", { name: "Reference" });
    const targets = canvasElement.querySelectorAll(
      '[data-ui-part="sidebar-tab-move-target"]',
    );
    await expect(targets).toHaveLength(2);

    const targetRect = reference.getBoundingClientRect();
    insertionDrag.active = { tabId: "sidebar-files", source: "html5" };
    insertionDrag.dragging = true;
    const targetMove = reference.closest<HTMLElement>(
      '[data-ui-part="sidebar-tab-move-target"]',
    )!;
    const dataTransfer = new DataTransfer();
    dataTransfer.effectAllowed = "move";
    await fireEvent.dragOver(targetMove, {
      clientX: targetRect.right - 2,
      clientY: targetRect.top + targetRect.height / 2,
      dataTransfer,
    });

    const marker = canvasElement.querySelector<HTMLElement>(
      "[data-workspace-tab-insertion-marker]",
    );
    await expect(marker).not.toBeNull();
    const markerRect = marker!.getBoundingClientRect();
    const targetMoveRect = targetMove.getBoundingClientRect();
    await expect(Math.round(markerRect.width)).toBe(3);
    await expect(Math.round(markerRect.height)).toBe(
      Math.round(targetMoveRect.height),
    );

    await fireEvent.drop(targetMove, {
      clientX: targetRect.right - 2,
      clientY: targetRect.top + targetRect.height / 2,
      dataTransfer,
    });
    await expect(
      Array.from(
        canvasElement.querySelectorAll("[data-workspace-item-id]"),
        (element) => element.getAttribute("data-workspace-item-id"),
      ),
    ).toEqual(["sidebar-reference", "sidebar-files"]);
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar
        controller={insertionController}
        side="right"
        drag={insertionDrag}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Group context menu editing"
  tags={["skip-visual"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const reference = canvas.getByRole("tab", { name: "Reference" });
    await userEvent.click(reference);
    await userEvent.pointer({ keys: "[MouseRight]", target: reference });
    await userEvent.click(
      await page.findByRole("menuitem", { name: "Rename group" }),
    );

    const name = await page.findByRole("textbox", { name: "Name" });
    await userEvent.clear(name);
    await userEvent.type(name, "Research");
    await userEvent.click(
      page.getByRole("option", { name: "Use folder-tree icon" }),
    );
    await userEvent.click(page.getByRole("button", { name: "Save" }));

    await expect(canvas.getByRole("tab", { name: "Research" })).toBeVisible();

    const outline = canvas.getByRole("button", {
      name: "Collapse Outline",
    });
    await userEvent.pointer({ keys: "[MouseRight]", target: outline });
    await expect(
      await page.findByRole("menuitem", {
        name: "Move to normal sidebar tabs",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar controller={contextMenuController} side="right" />
    </div>
  {/snippet}
</Story>

<Story
  name="Empty right sidebar"
  tags={["visual-pending"]}
  play={async ({ canvasElement }) => {
    const empty = canvasElement.querySelector(
      '[data-workspace-sidebar-empty="right"]',
    );
    const dropTarget = empty?.closest(
      '[data-ui-component="workspace-tabs-drop"]',
    );
    await expect(dropTarget).not.toBeNull();
    await expect(dropTarget).toHaveAttribute(
      "data-workspace-pane-id",
      "sidebar-empty-pane",
    );
    const sidebar = canvasElement.querySelector(
      '[data-workspace-sidebar-side="right"]',
    );
    await expect(sidebar).not.toBeNull();
    const dropRect = dropTarget!.getBoundingClientRect();
    const emptyRect = empty!.getBoundingClientRect();
    expect(Math.abs(dropRect.height - emptyRect.height)).toBeLessThan(1);
    const view = canvasElement.ownerDocument.defaultView!;
    expect(view.getComputedStyle(dropTarget!).backgroundColor).toBe(
      view.getComputedStyle(sidebar!).backgroundColor,
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar/empty-right-sidebar-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-sidebar-story-frame">
      <WorkspaceSidebar controller={emptyController} side="right" />
    </div>
  {/snippet}
</Story>
