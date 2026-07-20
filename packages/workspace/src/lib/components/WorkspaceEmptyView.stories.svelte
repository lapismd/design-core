<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceEmptyView from "./WorkspaceEmptyView.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Empty View",
    component: WorkspaceEmptyView,
    parameters: {
      docs: {
        description: {
          component:
            "Application-neutral empty pane adapted from Lapis' empty leaf, with only the reusable close action.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import WorkspaceLapisReference from "./stories/WorkspaceLapisReference.svelte";

  let closed = $state(false);
</script>

<Story
  name="Empty pane"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "No view is open" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Closed");
  }}
>
  {#snippet template()}
    <WorkspaceLapisReference>
      <div data-ui-component="workspace-empty-view-story" data-ui-part="host">
        <WorkspaceEmptyView
          tab={{
            id: "new-tab",
            title: "New Tab",
            view: { type: "empty", state: {} },
          }}
          active={true}
          setState={() => undefined}
          close={() => (closed = true)}
        />
        <output class="sr-only">{closed ? "Closed" : "Open"}</output>
      </div>
    </WorkspaceLapisReference>
  {/snippet}
</Story>

<style>
  :global(
      [data-ui-component="workspace-empty-view-story"][data-ui-part="host"]
    ) {
    width: 32rem;
    height: 24rem;
    overflow: hidden;
    border: 1px solid var(--border);
  }
</style>
