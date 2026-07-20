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
  import SearchIcon from "@lucide/svelte/icons/search";
  import type { WorkspaceAction } from "../core/types.js";
  import { createDemoController } from "./stories/fixtures";

  let controller = $state(createDemoController());
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

<style>
  :global([data-ui-component="workspace-shell-story"][data-ui-part="host"]) {
    display: flex;
    height: 36rem;
    flex-direction: column;
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
</style>
