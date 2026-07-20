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
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import FilesIcon from "@lucide/svelte/icons/files";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import SearchIcon from "@lucide/svelte/icons/search";
  import type { WorkspaceAction } from "../core/types.js";

  let invoked = $state("None");
  const actions: WorkspaceAction[] = [
    {
      id: "files",
      label: "Files",
      icon: FilesIcon,
      onSelect: () => (invoked = "Files"),
    },
    {
      id: "search",
      label: "Search",
      icon: SearchIcon,
      onSelect: () => (invoked = "Search"),
    },
    {
      id: "refresh",
      label: "Refresh",
      icon: RefreshCwIcon,
      onSelect: () => (invoked = "Refresh"),
    },
    {
      id: "note",
      label: "New note",
      icon: FileTextIcon,
      onSelect: () => (invoked = "New note"),
    },
  ];
</script>

<Story
  name="Ribbon"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-ribbon-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New note" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("New note");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-action-story" data-ui-part="host">
      <WorkspaceActionBar {actions} />
      <output class="sr-only">Last action: {invoked}</output>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-action-story"][data-ui-part="host"]) {
    display: flex;
    width: 49px;
    height: 861px;
    overflow: hidden;
    background: var(--sidebar);
  }
</style>
