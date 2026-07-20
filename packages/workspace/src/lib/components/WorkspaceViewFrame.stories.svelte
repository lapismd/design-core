<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceViewFrame from "./WorkspaceViewFrame.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace View Frame",
    component: WorkspaceViewFrame,
    parameters: {
      docs: {
        description: {
          component:
            "Shared tab body with Lapis-style view title, navigation, actions, options, and a bounded content region.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
  import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { WorkspaceAction } from "../core/types.js";

  let result = $state("Ready");
  const actions: WorkspaceAction[] = [
    {
      id: "refresh",
      label: "Refresh view",
      icon: RefreshCwIcon,
      onSelect: () => (result = "Refreshed"),
    },
  ];
</script>

<Story
  name="Header actions and options"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-active-tab-pane-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Refresh view" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Refreshed");
    await expect(canvas.getByText("Reusable view body")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-view-frame-story" data-ui-part="host">
      <WorkspaceViewFrame title="Notes.md" icon={FileTextIcon} {actions}>
        {#snippet options()}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="More options"
          >
            <MoreHorizontalIcon data-icon="inline-start" />
          </Button>
        {/snippet}
        <div data-ui-component="workspace-view-frame-story" data-ui-part="body">
          <p>Reusable view body</p>
          <output>{result}</output>
        </div>
      </WorkspaceViewFrame>
    </div>
  {/snippet}
</Story>

<Story
  name="Lapis tab-body reference capture"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/reference/lapis-active-tab-pane-chromium-darwin.png",
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
          "One active Lapis pane from the saved layout. It captures the tab-to-body boundary, empty-view centering, action spacing, pane scrollbar treatment, and the exact 40px header geometry used by the reusable tab-body target.",
      },
    },
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("img", { name: "Lapis active tab pane reference" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <img
      data-ui-component="workspace-view-frame-story"
      data-ui-part="reference-capture"
      src="/visual-baselines/workspace/reference/lapis-active-tab-pane-chromium-darwin.png"
      alt="Lapis active tab pane reference"
      width="225"
      height="448"
    />
  {/snippet}
</Story>

<style>
  :global(
      [data-ui-component="workspace-view-frame-story"][data-ui-part="host"]
    ) {
    height: 24rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-view-frame-story"][data-ui-part="body"]
    ) {
    padding: 1rem;
  }

  :global(
      [data-ui-component="workspace-view-frame-story"][data-ui-part="reference-capture"]
    ) {
    display: block;
    width: 225px;
    max-width: none;
    height: 448px;
  }
</style>
