<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSidebar from "./WorkspaceSidebar.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Sidebar",
    component: WorkspaceSidebar,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled left and right sidebars with pointer and keyboard resizing.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import FilesIcon from "@lucide/svelte/icons/files";
  import SearchIcon from "@lucide/svelte/icons/search";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import { createDemoController } from "./stories/fixtures";

  let resizeController = $state(createDemoController());
  let leftController = $state(createDemoController());
  let rightController = $state(createDemoController());

  leftController.layout.left.size = 304;
  rightController.layout.right.size = 256;

  const rightGroups: WorkspaceSidebarGroup[] = [
    {
      id: "backlinks",
      title: "Backlinks",
      icon: FilesIcon,
      actions: [
        {
          id: "search-backlinks",
          label: "Search backlinks",
          icon: SearchIcon,
          onSelect: () => undefined,
        },
      ],
    },
    { id: "outgoing-links", title: "Outgoing links" },
  ];
</script>

<Story
  name="Keyboard resize"
  play={async ({ canvas }) => {
    const resizer = canvas.getByRole("button", { name: "Resize left sidebar" });
    await userEvent.click(resizer);
    resizer.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("status")).toHaveTextContent("296px");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-sidebar-story" data-ui-part="host">
      <WorkspaceSidebar controller={resizeController} side="left">
        <p>Sidebar content</p>
      </WorkspaceSidebar>
      <main>
        <Button
          type="button"
          onclick={() => resizeController.setSidebarOpen("left", false)}
          >Close sidebar</Button
        >
        <output>{resizeController.layout.left.size}px</output>
      </main>
    </div>
  {/snippet}
</Story>

<Story
  name="Left split with icon tabs"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-left-split-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const fileTab = canvas.getByRole("radio", { name: "Files" });
    await expect(fileTab.textContent?.trim()).toBe("");
    await expect(Math.round(fileTab.getBoundingClientRect().width)).toBe(32);
    await expect(Math.round(fileTab.getBoundingClientRect().height)).toBe(32);
    await userEvent.click(canvas.getByRole("radio", { name: "Search" }));
    await expect(canvas.getByText("Search sidebar content")).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("search");
    await expect(
      canvasElement.querySelectorAll(
        '[data-workspace-part="sidebar-tab-trigger"]',
      ),
    ).toHaveLength(2);
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-sidebar-story"
      data-ui-part="host"
      data-reference-part="left"
    >
      <WorkspaceSidebar
        controller={leftController}
        side="left"
        tabs={[
          { id: "files", label: "Files", icon: FilesIcon },
          { id: "search", label: "Search", icon: SearchIcon },
        ]}
      >
        {#snippet tabContent(tab)}
          <p>{tab.label} sidebar content</p>
        {/snippet}
      </WorkspaceSidebar>
      <output class="sr-only"
        >Selected: {leftController.layout.left.activeTabId}</output
      >
    </div>
  {/snippet}
</Story>

<Story
  name="Right split with groups"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-right-split-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Backlinks" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.getByRole("status")).toHaveTextContent("collapsed");
  }}
>
  {#snippet template()}
    <div
      data-ui-component="workspace-sidebar-story"
      data-ui-part="host"
      data-reference-part="right"
    >
      <WorkspaceSidebar
        controller={rightController}
        side="right"
        groups={rightGroups}
      >
        {#snippet groupContent(group)}
          <p>{group.title} content</p>
        {/snippet}
      </WorkspaceSidebar>
      <output class="sr-only">
        Backlinks {rightController.layout.right.collapsedGroups.backlinks
          ? "collapsed"
          : "expanded"}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-sidebar-story"][data-ui-part="host"]) {
    display: flex;
    height: 20rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-reference-part="left"]
    ) {
    width: 304px;
    height: 900px;
    overflow: hidden;
    border: 0;
  }

  :global(
      [data-ui-component="workspace-sidebar-story"][data-reference-part="right"]
    ) {
    width: 256px;
    height: 900px;
    overflow: hidden;
    border: 0;
  }

  :global([data-ui-component="workspace-sidebar-story"] main) {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
  }

  :global([data-ui-component="workspace-sidebar-story"] p) {
    margin: 0;
    padding: 0.75rem;
  }
</style>
