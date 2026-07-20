<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import WorkspaceViewHost from "./WorkspaceViewHost.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace View Host",
    component: WorkspaceViewHost,
    parameters: {
      docs: {
        description: {
          component:
            "Hosts registered Svelte or imperative views and provides an accessible unknown-view fallback.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { createDemoController } from "./stories/fixtures";

  let controller = $state(createDemoController());
</script>

<Story
  name="Registered and unavailable views"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Notes view")).toBeVisible();
    await expect(canvas.getByText("Imperative view mounted")).toBeVisible();
    await expect(canvas.getByText("View unavailable")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-view-host-story" data-ui-part="host">
      <WorkspaceViewHost
        {controller}
        groupId="notes-tabs"
        tab={{
          id: "notes",
          title: "Notes",
          view: { type: "story", state: {} },
        }}
        active={true}
      />
      <WorkspaceViewHost
        {controller}
        groupId="notes-tabs"
        tab={{
          id: "unknown",
          title: "Unknown",
          view: { type: "missing", state: {} },
        }}
        active={false}
      />
      <WorkspaceViewHost
        {controller}
        groupId="notes-tabs"
        tab={{
          id: "imperative",
          title: "Imperative",
          view: { type: "imperative", state: {} },
        }}
        active={false}
      />
    </div>
  {/snippet}
</Story>

<style>
  :global(
      [data-ui-component="workspace-view-host-story"][data-ui-part="host"]
    ) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    min-height: 16rem;
    border: 1px solid var(--border);
  }
</style>
