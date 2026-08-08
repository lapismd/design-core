<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceSplit,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import * as exampleSources from "./WorkspaceSplit.example-sources.js";
  import WorkspaceSplit from "./WorkspaceSplit.svelte";
  import "./WorkspaceSplit.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Split",
    component: WorkspaceSplit,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A controller-backed Paneforge split primitive that preserves serialized child sizes and exposes an accessible resize handle.",
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

<script lang="ts">
  const split = createWorkspaceSplit(
    "horizontal",
    [
      createWorkspaceTabs([
        createWorkspaceTab({ id: "split-left", title: "Left pane" }),
      ]),
      createWorkspaceTabs([
        createWorkspaceTab({ id: "split-right", title: "Right pane" }),
      ]),
    ],
    [42, 58],
  );
  split.id = "split-story";
  const layout = createDefaultWorkspaceLayout();
  layout.main = split;
  const controller = new WorkspaceShellController({ layout });
  const liveSplit = $derived(
    controller.layout.main.kind === "split" ? controller.layout.main : split,
  );
</script>

<Story
  name="Horizontal split"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const separator = canvas.getByRole("separator");
    await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    await expect(canvas.getByText("Left pane")).toBeVisible();
    await expect(canvas.getByText("Right pane")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/split/horizontal-split-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-split-story-frame">
      <WorkspaceSplit {controller} split={liveSplit}>
        {#snippet children(child)}
          <div class="ui-workspace-split-story-pane">
            {child.kind === "tabs"
              ? (child.items[0]?.title ?? "Empty pane")
              : "Nested split"}
          </div>
        {/snippet}
      </WorkspaceSplit>
    </div>
  {/snippet}
</Story>
