<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import WorkspaceDropOverlay from "./WorkspaceDropOverlay.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Drop Overlay",
    component: WorkspaceDropOverlay,
    parameters: {
      docs: {
        description: {
          component:
            "Lapis-derived translucent previews for the four split edges and centre tab drop.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const drops = [
    { position: "left" as const, left: 0, top: 0, width: 60, height: 140 },
    {
      position: "right" as const,
      left: 180,
      top: 0,
      width: 60,
      height: 140,
    },
    { position: "top" as const, left: 0, top: 0, width: 240, height: 35 },
    {
      position: "bottom" as const,
      left: 0,
      top: 91,
      width: 240,
      height: 49,
    },
    {
      position: "center" as const,
      left: 0,
      top: 0,
      width: 240,
      height: 140,
    },
  ];
</script>

<Story
  name="Shows five drop targets"
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelectorAll('[data-ui-part="tab-drop-overlay"]'),
    ).toHaveLength(5);
    for (const position of ["left", "right", "top", "bottom", "center"]) {
      await expect(
        canvasElement.querySelector(
          `[data-ui-part="tab-drop-overlay"][data-drop-position="${position}"]`,
        ),
      ).toBeVisible();
    }
  }}
>
  {#snippet template()}
    <div data-ui-component="workspace-drop-overlay-story" data-ui-part="host">
      {#each drops as drop}
        <div data-ui-part="drop-target" data-drop-target={drop.position}>
          <span>{drop.position}</span>
          <WorkspaceDropOverlay geometry={drop} />
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<style>
  :global(
      [data-ui-component="workspace-drop-overlay-story"][data-ui-part="host"]
    ) {
    display: grid;
    grid-template-columns: repeat(3, 15rem);
    gap: 0.75rem;
  }

  :global(
      [data-ui-component="workspace-drop-overlay-story"]
        [data-ui-part="drop-target"]
    ) {
    position: relative;
    width: 15rem;
    height: 8.75rem;
    overflow: hidden;
    border: 1px solid var(--ui-workspace-divider, var(--border));
    background: var(--background);
  }

  :global(
      [data-ui-component="workspace-drop-overlay-story"]
        [data-ui-part="drop-target"]
        span
    ) {
    position: relative;
    z-index: 1;
    display: block;
    padding: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }
</style>
