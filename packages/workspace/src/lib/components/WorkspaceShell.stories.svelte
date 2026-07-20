<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceShell from "./WorkspaceShell.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Shell",
    component: WorkspaceShell,
    parameters: {
      docs: {
        description: {
          component:
            "Three-region desktop shell with controlled sidebars and a recursive workspace main pane.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import FilesIcon from "@lucide/svelte/icons/files";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
  import PanelRightIcon from "@lucide/svelte/icons/panel-right";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SettingsIcon from "@lucide/svelte/icons/settings";
  import type {
    WorkspaceAction,
    WorkspaceLayoutV1,
    WorkspaceTab,
  } from "../core/types.js";
  import { DefaultWorkspaceViewRegistry } from "../core/view-registry.js";
  import { WorkspaceController } from "../core/workspace-controller.svelte";
  import { createDemoController } from "./stories/fixtures";
  import WorkspaceStoryShellView from "./stories/WorkspaceStoryShellView.svelte";

  let controller = $state(createDemoController());
  let featureController = $state(createShellFixtureController());
  let lastAction = $state("None");
  const actions: WorkspaceAction[] = [
    {
      id: "files",
      label: "Files",
      icon: FilesIcon,
      pressed: true,
      onSelect: () => (lastAction = "Files"),
    },
    {
      id: "search",
      label: "Search",
      icon: SearchIcon,
      onSelect: () => (lastAction = "Search"),
    },
  ];
  const featureActions: WorkspaceAction[] = [
    {
      id: "files",
      label: "Files",
      icon: FilesIcon,
      pressed: true,
      onSelect: () => undefined,
    },
    {
      id: "search",
      label: "Search",
      icon: SearchIcon,
      onSelect: () => undefined,
    },
    {
      id: "settings",
      label: "Settings",
      icon: SettingsIcon,
      disabled: true,
      onSelect: () => undefined,
    },
  ];

  function tab(
    id: string,
    title: string,
    options: Partial<WorkspaceTab> = {},
  ): WorkspaceTab {
    return {
      id,
      title,
      view: { type: "shell-fixture", state: {} },
      ...options,
    };
  }

  function createShellFixtureController() {
    const registry = new DefaultWorkspaceViewRegistry();
    registry.register({
      kind: "svelte",
      type: "shell-fixture",
      component: WorkspaceStoryShellView,
    });
    return new WorkspaceController({
      layout: createFeatureLayout(),
      registry,
    });
  }

  function createFeatureLayout(): WorkspaceLayoutV1 {
    return {
      version: 1,
      left: {
        open: true,
        size: 300,
        activeTabId: null,
        collapsedGroups: { bookmarks: true },
      },
      right: {
        open: true,
        size: 280,
        activeTabId: null,
        collapsedGroups: {},
      },
      main: {
        kind: "split",
        id: "feature-root-split",
        direction: "horizontal",
        sizes: [58, 42],
        children: [
          {
            kind: "tabs",
            id: "feature-top-tabs",
            activeTabId: "feature-notes",
            presentation: "top",
            tabs: [
              tab("feature-pinned", "Pinned note", { closable: false }),
              tab("feature-notes", "Daily notes"),
              tab(
                "feature-long-title",
                "A very long workspace tab title that truncates",
              ),
            ],
          },
          {
            kind: "split",
            id: "feature-secondary-split",
            direction: "vertical",
            sizes: [48, 52],
            children: [
              {
                kind: "tabs",
                id: "feature-stacked-tabs",
                activeTabId: "feature-outline",
                presentation: "stacked",
                tabs: [
                  tab("feature-outline", "Outline"),
                  tab("feature-graph", "Graph"),
                  tab("feature-links", "Backlinks"),
                ],
              },
              {
                kind: "tabs",
                id: "feature-bottom-tabs",
                activeTabId: "feature-preview",
                presentation: "top",
                tabs: [
                  tab("feature-preview", "Preview"),
                  tab("feature-history", "History"),
                ],
              },
            ],
          },
        ],
      },
    };
  }
</script>

<Story
  name="Three regions"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Left navigation")).toBeVisible();
    await expect(canvas.getByText("Right inspector")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle right sidebar" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Right sidebar closed",
    );
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-shell-story" data-ui-part="host">
      <div data-ui-component="workspace-shell-story" data-ui-part="controls">
        <Button
          type="button"
          onclick={() =>
            controller.setSidebarOpen("right", !controller.layout.right.open)}
        >
          Toggle right sidebar
        </Button>
        <output>
          {controller.layout.right.open
            ? "Right sidebar open"
            : "Right sidebar closed"}
        </output>
      </div>
      <WorkspaceShell {controller}>
        {#snippet left()}
          <p>Left navigation</p>
        {/snippet}
        {#snippet right()}
          <p>Right inspector</p>
        {/snippet}
      </WorkspaceShell>
    </div>
  {/snippet}
</Story>

<Story
  name="Desktop shell with tab variations"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-default-layout-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole("tab", { name: "Daily notes" }),
    ).toHaveAttribute("aria-selected", "true");
    await expect(
      canvasElement.querySelector(
        '[data-workspace-part="stacked-tab-trigger"][aria-controls*="feature-outline"]',
      ),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("button", { name: "Bookmarks" }),
    ).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvasElement.querySelector('[data-ui-part="action-ribbon"]'),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-shell-story"
      data-ui-part="host"
      data-scenario="tab-variations"
      data-workspace-theme="lapis-reference"
    >
      <WorkspaceShell
        controller={featureController}
        actions={featureActions}
        leftGroups={[
          { id: "files", title: "Files", icon: FilesIcon },
          { id: "bookmarks", title: "Bookmarks", icon: FileTextIcon },
        ]}
        rightGroups={[
          { id: "outline", title: "Outline", icon: PanelRightIcon },
          { id: "properties", title: "Properties" },
        ]}
      >
        {#snippet leftGroupContent(group)}
          <p>{group.title} workspace content</p>
        {/snippet}
        {#snippet rightGroupContent(group)}
          <p>{group.title} panel content</p>
        {/snippet}
        {#snippet viewHeaderOptions(tab)}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`More options for ${tab.title}`}
          >
            <MoreHorizontalIcon data-icon="inline-start" />
          </Button>
        {/snippet}
      </WorkspaceShell>
    </div>
  {/snippet}
</Story>

<Story
  name="Desktop ribbon and grouped docks"
  play={async ({ canvas, canvasElement }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Search");
    const navigator = canvas.getByRole("button", { name: "Navigator" });
    await userEvent.click(navigator);
    await expect(navigator).toHaveAttribute("aria-expanded", "false");
    const ribbon = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="action-ribbon"]',
    );
    const firstRibbonButton = canvas.getByRole("button", { name: "Files" });
    const leftSidebar = canvasElement.querySelector<HTMLElement>(
      '[data-workspace-sidebar="left"]',
    );
    await expect(Math.round(ribbon?.getBoundingClientRect().width ?? 0)).toBe(
      44,
    );
    await expect(
      Math.round(
        (ribbon?.getBoundingClientRect().width ?? 0) +
          (leftSidebar?.getBoundingClientRect().width ?? 0),
      ),
    ).toBe(280);
    await expect(
      Math.round(
        firstRibbonButton.getBoundingClientRect().top -
          (ribbon?.getBoundingClientRect().top ?? 0),
      ),
    ).toBe(44);
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-shell-story" data-ui-part="host">
      <WorkspaceShell
        {controller}
        {actions}
        leftGroups={[{ id: "navigator", title: "Navigator", icon: FilesIcon }]}
        rightGroups={[{ id: "inspector", title: "Inspector" }]}
      >
        {#snippet leftGroupContent(group)}
          <p>{group.title} content</p>
        {/snippet}
        {#snippet rightGroupContent(group)}
          <p>{group.title} content</p>
        {/snippet}
      </WorkspaceShell>
      <output>Last action: {lastAction}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Lapis reference capture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-default-layout-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
    docs: {
      description: {
        story:
          "The saved 1280 x 900 Lapis desktop layout captured from the running reference app. Stage two replaces this evidence-only story with the directly ported shell composition.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", {
        name: "Lapis desktop workspace default layout reference",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <img
      data-ui-component="workspace-shell-story"
      data-ui-part="reference-capture"
      src="/visual-baselines/workspace/reference/lapis-default-layout-chromium-darwin.png"
      alt="Lapis desktop workspace default layout reference"
      width="1280"
      height="900"
    />
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-shell-story"][data-ui-part="host"]) {
    display: flex;
    height: 36rem;
    flex-direction: column;
  }

  :global(
      [data-ui-component="workspace-shell-story"][data-scenario="tab-variations"]
    ) {
    width: min(72rem, calc(100vw - 2rem));
    height: 42rem;
    --ui-workspace-tab-height: 40px;
    --ui-workspace-ribbon-width: 44px;
    --ui-workspace-tab-width: 200px;
    --ui-workspace-tab-max-width: 320px;
    --ui-workspace-tab-container-background: var(--sidebar);
    --ui-workspace-tab-active-background: var(--background);
    --ui-workspace-tab-hover: var(--accent);
    --ui-workspace-sidebar-background: var(--sidebar);
    --ui-workspace-ribbon-background: var(--sidebar);
    --ui-workspace-divider: var(--sidebar-border);
    --ui-workspace-view-header-height: 40px;
    --ui-workspace-view-header-background: var(--background);
    --ui-workspace-group-header-height: 32px;
    --ui-workspace-stacked-tab-width: 40px;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-shell-story"][data-scenario="tab-variations"]
        p
    ) {
    padding: 0.75rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  :global(
      [data-ui-component="workspace-shell-story"][data-ui-part="controls"]
    ) {
    display: flex;
    gap: 0.75rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--border);
  }

  :global([data-ui-component="workspace-shell-story"] p) {
    margin: 0;
    padding: 0.75rem;
  }

  :global(
      [data-ui-component="workspace-shell-story"][data-ui-part="reference-capture"]
    ) {
    display: block;
    width: 1280px;
    max-width: none;
    height: 900px;
  }
</style>
