<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import ExampleWorkspaceView from "../view-host/ExampleWorkspaceView.svelte";
  import WorkspaceMobile from "./WorkspaceMobile.svelte";
  import "./WorkspaceMobile.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Mobile Shell",
    component: WorkspaceMobile,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-shaped phone shell with full-height editor, sidebars, tab overview, controller-backed tab actions, bottom navigation, and live inclusion settings.",
        },
      },
    },
  });

  function tab(id: string, title: string, icon: string) {
    return createWorkspaceTab({
      id,
      title,
      icon,
      view: { type: "mobile-example", state: { title } },
    });
  }

  function createFixture(includeBottomPanel = false) {
    const home = tab("mobile-home", "Framework home", "layout-template");
    const notes = tab("mobile-notes", "Notes", "notebook-tabs");
    const files = tab("mobile-files", "Files", "files");
    const search = tab("mobile-search", "Search", "search");
    const outline = tab("mobile-outline", "Outline", "list-tree");
    const links = tab("mobile-links", "Links", "link");
    const group: WorkspaceSidebarGroup = {
      kind: "sidebar-group",
      id: "mobile-reference",
      title: "Reference",
      icon: "panel-top",
      tabs: [outline, links],
      hiddenTabIds: [],
      collapsedByTabId: {},
      panelSizesByTabId: { [outline.id]: 50, [links.id]: 50 },
    };
    const layout = createDefaultWorkspaceLayout();
    layout.main = createWorkspaceTabs([home, notes], {
      id: "mobile-main",
      activeItemId: home.id,
    });
    layout.left = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([files, search], {
        id: "mobile-left",
        activeItemId: files.id,
      }),
    };
    layout.right = {
      open: true,
      size: 300,
      root: createWorkspaceTabs([group], {
        id: "mobile-right",
        activeItemId: group.id,
      }),
    };
    if (includeBottomPanel) {
      const terminal = tab("mobile-terminal", "Terminal", "terminal");
      layout.bottom = {
        open: true,
        size: 240,
        root: createWorkspaceTabs([terminal], {
          id: "mobile-bottom",
          activeItemId: terminal.id,
        }),
      };
    }
    layout.active = {
      hostId: "root",
      paneId: "mobile-main",
      tabId: home.id,
    };
    const controller = new WorkspaceShellController({ layout });
    controller.registry.register({
      kind: "svelte",
      type: "mobile-example",
      component: ExampleWorkspaceView,
      getChrome: () => ({
        actions: [
          {
            id: "reload",
            label: "Reload view",
            icon: "rotate-ccw",
            onSelect: () => undefined,
          },
        ],
      }),
    });
    controller.openWindow(
      tab("mobile-floating", "Floating inspector", "scan-search"),
      "floating",
    );
    return controller;
  }

  const editorController = createFixture();
  const overviewController = createFixture();
  const filteredController = createFixture();
  const panController = createFixture();
  const actionsController = createFixture();
  const tabActionsController = createFixture();
  const bottomPanelController = createFixture(true);
</script>

<Story
  name="Editor with revealable sidebars"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Open left sidebar" }),
    );
    const shell = canvas.getByLabelText("Mobile workspace stage");
    await expect(shell).toBeVisible();
    await expect(
      canvas.getByLabelText("Select left sidebar tab"),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/editor-with-revealable-sidebars-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile controller={editorController} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Bottom panel views in open tabs"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const openTerminal = canvas.getByRole("button", { name: "Open Terminal" });
    await expect(openTerminal).toBeVisible();
    await userEvent.click(openTerminal);
    await expect(
      canvas.getByRole("heading", { name: "Terminal" }),
    ).toBeVisible();
    await expect(
      canvasElement.querySelector(
        '[data-ui-component="workspace-bottom-panel"]',
      ),
    ).toBeNull();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile
          controller={bottomPanelController}
          defaultPage="tabs"
          includeSidebarsInTabs={false}
          includeBottomPanelInTabs={true}
          includeFloatingInTabs={false}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Tab overview with all entries"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Close Notes" }));
    await expect(
      canvas.queryByRole("button", { name: "Open Notes" }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: /Open tab actions/ }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Undo close tab" }),
    );
    await expect(canvas.getByRole("region", { name: "Notes" })).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/tab-overview-with-all-entries-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile
          controller={overviewController}
          defaultPage="tabs"
          includeSidebarsInTabs={true}
          includeFloatingInTabs={true}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Overview without auxiliary entries"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/overview-without-auxiliary-entries-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile
          controller={filteredController}
          defaultPage="tabs"
          showBottomNav={false}
          includeSidebarsInTabs={false}
          includeFloatingInTabs={false}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Pan gesture surface"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/pan-gesture-surface-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile controller={panController} />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="View actions drawer"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Reload view" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Open more actions" })[0]!,
    );
    await expect(
      canvas.getByRole("dialog", { name: "More actions" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open right sidebar" }),
    );
    await expect(
      canvas.getByLabelText("Select right sidebar tab"),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/view-actions-drawer-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile
          controller={actionsController}
          onOpenSettings={() => undefined}
        />
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Open tabs actions drawer"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /Open tab actions/ }),
    );
    await expect(
      canvas.getByRole("dialog", { name: "7 open tabs" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Close tabs" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(
      canvas.queryByRole("dialog", { name: "7 open tabs" }),
    ).not.toBeInTheDocument();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/mobile/open-tabs-actions-drawer-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-mobile-story-canvas">
      <div class="ui-workspace-mobile-story-frame">
        <WorkspaceMobile
          controller={tabActionsController}
          defaultPage="tabs"
          includeSidebarsInTabs={true}
          includeFloatingInTabs={true}
        />
      </div>
    </div>
  {/snippet}
</Story>
