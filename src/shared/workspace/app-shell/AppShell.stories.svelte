<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceSplit,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import { APP_SHELL_SETTING_IDS } from "../core/built-in-settings.svelte.js";
  import { AppShellPlugin } from "../core/plugin-manager.svelte.js";
  import { WorkspaceView, type WorkspaceLeaf } from "../core/workspace-view.js";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import { AppShell, AppShellRoot } from "./index.js";
  import "./AppShell.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Framework/App Shell",
    component: AppShellRoot,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controller context and independently composable shell surfaces. Applications may use AppShell.Surface or assemble the ribbon, sidebars, workspace, floating layer, and status bar explicitly.",
        },
      },
    },
  });

  interface DemoViewState extends Record<string, unknown> {
    heading?: string;
    description?: string;
  }

  class DemoWorkspaceView extends WorkspaceView<DemoViewState> {
    readonly type: string;

    constructor(leaf: WorkspaceLeaf, type: string) {
      super(leaf);
      this.type = type;
    }

    getViewType() {
      return this.type;
    }

    onOpen() {
      const state = this.getState();
      const view = document.createElement("section");
      const heading = document.createElement("h2");
      const description = document.createElement("p");
      view.className = "ui-app-shell-story-view";
      heading.textContent = state.heading ?? this.getDisplayText();
      description.textContent =
        state.description ?? "Rendered through a registered WorkspaceView.";
      view.append(heading, description);
      this.containerEl.replaceChildren(view);
    }

    onClose() {
      this.containerEl.replaceChildren();
    }
  }

  class DemoStaticPlugin extends AppShellPlugin {}

  function demoTab(
    id: string,
    title: string,
    icon: string,
    description: string,
  ) {
    return createWorkspaceTab({
      id,
      title,
      icon,
      view: {
        type: "demo",
        state: { heading: title, description },
      },
    });
  }

  function createDemoApp() {
    const home = demoTab(
      "app-shell-home",
      "Framework home",
      "layout-template",
      "The main pane is driven by the serializable workspace controller.",
    );
    const notes = demoTab(
      "app-shell-notes",
      "Notes",
      "notebook-tabs",
      "Tabs activate and close through the same public controller.",
    );
    const reference = demoTab(
      "app-shell-reference",
      "Reference",
      "book-open",
      "The top-right pane can be split, moved, floated, or redocked.",
    );
    const details = demoTab(
      "app-shell-details",
      "Details",
      "panel-right",
      "Every pane renders the same registered view lifecycle.",
    );
    const mainLeft = createWorkspaceTabs([home, notes], {
      id: "app-shell-main-left",
      activeItemId: home.id,
    });
    const mainRightTop = createWorkspaceTabs([reference], {
      id: "app-shell-main-right-top",
    });
    const mainRightBottom = createWorkspaceTabs([details], {
      id: "app-shell-main-right-bottom",
    });
    const mainRight = createWorkspaceSplit(
      "vertical",
      [mainRightTop, mainRightBottom],
      [50, 50],
    );
    const files = demoTab(
      "app-shell-files",
      "Files",
      "files",
      "Sidebar leaves use the same registered view lifecycle.",
    );
    const search = demoTab(
      "app-shell-search",
      "Search",
      "search",
      "Sidebar content remains application-owned.",
    );
    const outline = demoTab(
      "app-shell-outline",
      "Outline",
      "list-tree",
      "Grouped panels collapse and resize through the controller.",
    );
    const links = demoTab(
      "app-shell-links",
      "Links",
      "link",
      "Grouped sidebar tabs preserve keyed layout state.",
    );
    const rightGroup: WorkspaceSidebarGroup = {
      kind: "sidebar-group",
      id: "app-shell-reference-group",
      title: "Reference",
      icon: "panel-top",
      tabs: [outline, links],
      hiddenTabIds: [],
      collapsedByTabId: { [outline.id]: false, [links.id]: false },
      panelSizesByTabId: { [outline.id]: 50, [links.id]: 50 },
    };
    const layout = createDefaultWorkspaceLayout();
    layout.main = createWorkspaceSplit(
      "horizontal",
      [mainLeft, mainRight],
      [58, 42],
    );
    layout.left = {
      open: true,
      size: 296,
      root: createWorkspaceTabs([files, search], {
        id: "app-shell-left-sidebar",
        activeItemId: files.id,
      }),
    };
    layout.right = {
      open: true,
      size: 304,
      root: createWorkspaceTabs([rightGroup], {
        id: "app-shell-right-sidebar",
        activeItemId: rightGroup.id,
      }),
    };
    layout.active = {
      hostId: "root",
      paneId: mainLeft.id,
      tabId: home.id,
    };
    const app = new AppShellController({
      layout,
      application: { name: "Workspace demo", version: "1.0.0" },
      configuration: {
        values: { [APP_SHELL_SETTING_IDS.mobileMode]: "never" },
      },
      plugins: [
        {
          id: "demo-static-plugin",
          name: "Demo extension",
          description: "A statically configured application plugin.",
          icon: "puzzle",
          plugin: DemoStaticPlugin,
          enabled: true,
        },
      ],
      views: [
        {
          type: "demo",
          factory: (leaf) => new DemoWorkspaceView(leaf, "demo"),
        },
      ],
    });
    app.status.addItem({
      id: "app-shell-ready",
      align: "right",
      icon: "circle-check",
      label: "Framework ready",
    });
    return app;
  }

  const composedApp = createDemoApp();
  const surfaceApp = createDemoApp();
  const mobileApp = createDemoApp();
  const utilityApp = createDemoApp();
  const adapterApp = createDemoApp();
  const hotkeysApp = createDemoApp();
  const hotkeysInteractionApp = createDemoApp();
  const pluginsApp = createDemoApp();
</script>

<Story
  name="Composable surfaces"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    const notes = canvas.getByRole("tab", { name: "Notes" });
    await userEvent.click(notes);
    await expect(notes).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Framework ready")).toBeVisible();
    await expect(canvas.getByLabelText("Left sidebar")).toBeVisible();
    await expect(canvas.getByLabelText("Right sidebar")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/composable-surfaces-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame">
      <AppShell.Root controller={composedApp} theme="inherit">
        <AppShell.Ribbon />
        <AppShell.LeftSidebar />
        <AppShell.Workspace />
        <AppShell.RightSidebar />
        <AppShell.FloatingLayer />
        <AppShell.StatusBar />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Default surface"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    const settingsButton = canvas.getByRole("button", {
      name: "Open settings",
    });
    await userEvent.click(settingsButton);
    await expect(
      canvas.getByRole("dialog", { name: "Settings" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close settings" }),
    );
    await expect(
      canvas.queryByRole("dialog", { name: "Settings" }),
    ).not.toBeInTheDocument();
    await expect(settingsButton).toHaveFocus();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/default-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame">
      <AppShell.Root controller={surfaceApp} theme="inherit">
        <AppShell.Surface workspaceLabel="Workspace demo" />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Mobile surface"
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/mobile-surface-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-mobile-canvas">
      <div class="ui-app-shell-story-mobile-frame">
        <AppShell.Root controller={mobileApp} theme="inherit">
          <AppShell.Surface displayMode="mobile" />
        </AppShell.Root>
      </div>
    </div>
  {/snippet}
</Story>

<Story
  name="Explicit utility layers"
  tags={["visual-ready"]}
  play={async ({ canvas }) => {
    utilityApp.commands.openPalette();
    await expect(
      await canvas.findByRole("dialog", { name: "Command Palette" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/explicit-utility-layers-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame">
      <AppShell.Root
        controller={utilityApp}
        renderOverlays={false}
        renderPopouts={false}
        theme="inherit"
      >
        <AppShell.Workspace />
        <AppShell.CommandPalette />
        <AppShell.About />
        <AppShell.Notices />
        <AppShell.PluginLayer />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Low-level sidebar and tabs adapters"
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/low-level-sidebar-and-tabs-adapters-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame">
      <AppShell.Root controller={adapterApp} theme="inherit">
        <AppShell.Sidebar side="left" />
        <AppShell.Tabs paneId="app-shell-main-left" />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Composable hotkey settings"
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/composable-hotkey-settings-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame ui-app-shell-story-frame--settings">
      <AppShell.Root controller={hotkeysApp} theme="inherit">
        <AppShell.HotkeySettings />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Hotkey search and capture interaction"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const keyboardFilter = canvas.getByTestId("hotkeys-keyboard-filter");
    await userEvent.click(keyboardFilter);
    await userEvent.keyboard("{Meta>}p{/Meta}");
    await waitFor(() =>
      expect(canvas.getAllByTestId("hotkey-row")).toHaveLength(1),
    );
    await userEvent.click(canvas.getByTestId("hotkeys-clear-keyboard-filter"));
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Add hotkey for About Workspace demo",
      }),
    );
    await userEvent.keyboard("{Meta>}i{/Meta}");
    await userEvent.click(canvas.getByRole("button", { name: "Save hotkey" }));
    await expect(canvas.getByText("⌘I")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame ui-app-shell-story-frame--settings">
      <AppShell.Root controller={hotkeysInteractionApp} theme="inherit">
        <AppShell.HotkeySettings />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Composable core plugin settings"
  tags={["visual-ready"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/app-shell/composable-core-plugin-settings-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
>
  {#snippet template()}
    <div class="ui-app-shell-story-frame ui-app-shell-story-frame--settings">
      <AppShell.Root controller={pluginsApp} theme="inherit">
        <AppShell.CorePluginsSettings />
      </AppShell.Root>
    </div>
  {/snippet}
</Story>
