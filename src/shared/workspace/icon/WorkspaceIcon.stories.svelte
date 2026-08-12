<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as exampleSources from "./WorkspaceIcon.example-sources.js";
  import WorkspaceIcon from "./WorkspaceIcon.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Icon",
    component: WorkspaceIcon,
    parameters: {
      docs: {
        description: {
          component:
            "Serializable Lucide icon renderer used by tabs, views, sidebars, commands, ribbon items, and status items.",
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
  name="Serializable icon names"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByTestId("workspace-icon-gallery")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/icon/serializable-icon-names-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div
      class="flex items-center gap-4 text-2xl"
      data-testid="workspace-icon-gallery"
    >
      <WorkspaceIcon name="file" />
      <WorkspaceIcon name="search" />
      <WorkspaceIcon name="panel-left" />
      <WorkspaceIcon name="settings" />
    </div>
  {/snippet}
</Story>

<Story
  name="Unknown icon falls back to file"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: {
        story:
          "Unknown serializable names render the stable file fallback. Tagged skip-visual because the named gallery is the visual baseline.",
      },
    },
  }}
  play={async ({ canvas, canvasElement }) => {
    const fallback = canvas.getByTestId("workspace-icon-fallback");
    const graphic = canvasElement.querySelector<SVGElement>(".lucide-file");
    await expect(graphic).not.toBeNull();
    await expect(getComputedStyle(graphic!).color).toBe(
      getComputedStyle(fallback).color,
    );
  }}
>
  {#snippet template()}
    <span data-testid="workspace-icon-fallback" style="color: rgb(196, 30, 52)">
      <WorkspaceIcon name="not-a-real-icon" />
    </span>
  {/snippet}
</Story>
