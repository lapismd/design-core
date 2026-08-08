<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as exampleSources from "./WorkspaceDropOverlay.example-sources.js";
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
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/drop-overlay/centre-target-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="center" />
  {/snippet}
</Story>

<Story
  name="Left split target"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/drop-overlay/left-split-target-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="left" />
  {/snippet}
</Story>

<Story
  name="Right split target"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/drop-overlay/right-split-target-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="right" />
  {/snippet}
</Story>

<Story
  name="Top split target"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/drop-overlay/top-split-target-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="top" />
  {/snippet}
</Story>

<Story
  name="Bottom split target"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/drop-overlay/bottom-split-target-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="bottom" />
  {/snippet}
</Story>
