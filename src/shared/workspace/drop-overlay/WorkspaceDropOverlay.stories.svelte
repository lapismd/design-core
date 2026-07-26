<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { withLapisStorybookReference } from "../reference/lapis-visual-delta.js";
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
  tags={["visual-pending", "lapis-reference-visual"]}
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-drop-position="center"]'),
    ).not.toBeNull();
  }}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/drop-overlay/centre-target-chromium-darwin.png",
      "workspace-shell-components-drag-and-drop-overlays--centre-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="center" />
  {/snippet}
</Story>

<Story
  name="Left split target"
  tags={["visual-pending", "lapis-reference-visual"]}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/drop-overlay/left-split-target-chromium-darwin.png",
      "workspace-shell-components-drag-and-drop-overlays--left-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="left" />
  {/snippet}
</Story>

<Story
  name="Right split target"
  tags={["visual-pending", "lapis-reference-visual"]}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/drop-overlay/right-split-target-chromium-darwin.png",
      "workspace-shell-components-drag-and-drop-overlays--right-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="right" />
  {/snippet}
</Story>

<Story
  name="Top split target"
  tags={["visual-pending", "lapis-reference-visual"]}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/drop-overlay/top-split-target-chromium-darwin.png",
      "workspace-shell-components-drag-and-drop-overlays--top-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="top" />
  {/snippet}
</Story>

<Story
  name="Bottom split target"
  tags={["visual-pending", "lapis-reference-visual"]}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/drop-overlay/bottom-split-target-chromium-darwin.png",
      "workspace-shell-components-drag-and-drop-overlays--bottom-chromium-darwin.png",
    ),
  }}
>
  {#snippet template()}
    <WorkspaceDropOverlay position="bottom" />
  {/snippet}
</Story>
