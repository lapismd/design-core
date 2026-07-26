<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ComposerDrawer from "./ComposerDrawer.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Composer Drawer",
    component: ComposerDrawer,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled or bindable shadcn Collapsible drawer for attached composer context.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let collapsed = $state(true);
</script>

<Story
  name="Expands attached context"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand Attached context" }),
    );
    await expect(canvas.getByText("release-notes.md")).toBeVisible();
  }}
>
  {#snippet template()}
    <div data-story="drawer-frame">
      <ComposerDrawer bind:collapsed count={2}>
        <p>release-notes.md</p>
        <p>changelog.md</p>
      </ComposerDrawer>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="drawer-frame"]) {
    width: min(34rem, 90vw);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
  }

  :global([data-story="drawer-frame"] p) {
    margin: 0.25rem 0;
    font-size: 0.75rem;
  }
</style>
