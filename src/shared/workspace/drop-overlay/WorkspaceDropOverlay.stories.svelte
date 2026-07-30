<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import WorkspaceDropOverlay from "./WorkspaceDropOverlay.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Drop Overlay",
    component: WorkspaceDropOverlay,
    parameters: {
      docs: {
        description: {
          component:
            "Lapis-compatible centre and proportional edge drop geometry shared by pointer and HTML5 tab movement.",
        },
      },
    },
  });
</script>

<Story
  name="Centre target"
  tags={["visual-approved"]}
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-drop-position="center"]'),
    ).not.toBeNull();
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="center" />
  {/snippet}
</Story>

<Story name="Left split target" tags={["visual-approved"]}>
  {#snippet template()}
    <WorkspaceDropOverlay position="left" />
  {/snippet}
</Story>

<Story name="Right split target" tags={["visual-approved"]}>
  {#snippet template()}
    <WorkspaceDropOverlay position="right" />
  {/snippet}
</Story>

<Story name="Top split target" tags={["visual-approved"]}>
  {#snippet template()}
    <WorkspaceDropOverlay position="top" />
  {/snippet}
</Story>

<Story name="Bottom split target" tags={["visual-approved"]}>
  {#snippet template()}
    <WorkspaceDropOverlay position="bottom" />
  {/snippet}
</Story>
