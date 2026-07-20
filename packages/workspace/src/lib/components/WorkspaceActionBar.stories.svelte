<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceActionBar from "./WorkspaceActionBar.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Action Ribbon",
    component: WorkspaceActionBar,
    parameters: {
      docs: {
        description: {
          component:
            "A 44px desktop action ribbon for consumer-defined workspace actions.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import FilesIcon from "@lucide/svelte/icons/files";
  import SearchIcon from "@lucide/svelte/icons/search";
  import type { WorkspaceAction } from "../core/types.js";

  let invoked = $state("None");
  const actions: WorkspaceAction[] = [
    {
      id: "files",
      label: "Files",
      icon: FilesIcon,
      pressed: true,
      onSelect: () => (invoked = "Files"),
    },
    {
      id: "search",
      label: "Search",
      icon: SearchIcon,
      onSelect: () => (invoked = "Search"),
    },
  ];
</script>

<Story
  name="Invokes labeled actions"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-action-ribbon-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Search");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-action-story" data-ui-part="host">
      <WorkspaceActionBar {actions} />
      <output>Last action: {invoked}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Lapis action-ribbon reference capture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-action-ribbon-chromium-darwin.png",
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
          "The complete icon-only Lapis desktop action ribbon, including its selected state, top offset, button rhythm, footer actions, and outer divider.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Lapis action ribbon reference" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <img
      data-ui-component="workspace-action-story"
      data-ui-part="reference-capture"
      src="/visual-baselines/workspace/reference/lapis-action-ribbon-chromium-darwin.png"
      alt="Lapis action ribbon reference"
      width="48"
      height="900"
    />
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-action-story"][data-ui-part="host"]) {
    display: flex;
    height: 20rem;
    border: 1px solid var(--border);
  }

  :global([data-ui-component="workspace-action-story"] output) {
    padding: 1rem;
  }

  :global(
      [data-ui-component="workspace-action-story"][data-ui-part="reference-capture"]
    ) {
    display: block;
    width: 48px;
    max-width: none;
    height: 900px;
  }
</style>
