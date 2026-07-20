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

<style>
  :global([data-ui-component="workspace-action-story"][data-ui-part="host"]) {
    display: flex;
    height: 20rem;
    border: 1px solid var(--border);
  }

  :global([data-ui-component="workspace-action-story"] output) {
    padding: 1rem;
  }
</style>
