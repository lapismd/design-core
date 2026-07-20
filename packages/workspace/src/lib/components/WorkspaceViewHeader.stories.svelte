<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceViewHeader from "./WorkspaceViewHeader.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace View Header",
    component: WorkspaceViewHeader,
    parameters: {
      docs: {
        description: {
          component:
            "Reusable Lapis-style desktop view toolbar with navigation, breadcrumbs, title, actions, and consumer-owned options.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import MoreHorizontalIcon from "@lucide/svelte/icons/more-horizontal";
  import RefreshCwIcon from "@lucide/svelte/icons/refresh-cw";
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
  name="Navigation, breadcrumb, actions and options"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Notes" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Notes selected",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Refresh view" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Refreshed");
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-view-header-story" data-ui-part="host">
      <WorkspaceViewHeader
        title="Daily notes.md"
        icon={FileTextIcon}
        back={{ label: "Back", onSelect: () => (result = "Back selected") }}
        forward={{
          label: "Forward",
          onSelect: () => (result = "Forward selected"),
        }}
        breadcrumbs={[
          { id: "vault", label: "Vault" },
          {
            id: "notes",
            label: "Notes",
            onSelect: () => (result = "Notes selected"),
          },
        ]}
        {actions}
      >
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
      </WorkspaceViewHeader>
      <output>{result}</output>
    </div>
  {/snippet}
</Story>

<style>
  :global(
      [data-ui-component="workspace-view-header-story"][data-ui-part="host"]
    ) {
    width: min(100%, 48rem);
    overflow: hidden;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-view-header-story"][data-ui-part="host"]
        output
    ) {
    display: block;
    padding: 0.5rem 0.75rem;
    border-top: 1px solid var(--border);
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
