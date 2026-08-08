<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import * as exampleSources from "./WorkspaceRibbon.example-sources.js";
  import WorkspaceRibbon from "./WorkspaceRibbon.svelte";
  import "./WorkspaceRibbon.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Ribbon",
    component: WorkspaceRibbon,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controller-managed ribbon actions split into top and bottom sections with the source Lapis geometry.",
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
  let result = $state("No action selected");
  const controller = new WorkspaceShellController();
  controller.ribbon.addItem({
    id: "files",
    label: "Files",
    icon: "files",
    active: true,
    onSelect: () => {
      result = "Files selected";
    },
  });
  controller.ribbon.addItem({
    id: "search",
    label: "Search",
    icon: "search",
    onSelect: () => {
      result = "Search selected";
    },
  });
  controller.ribbon.addItem({
    id: "settings",
    section: "bottom",
    label: "Settings",
    icon: "settings",
    onSelect: () => {
      result = "Settings selected";
    },
  });
</script>

<Story
  name="Top and bottom controller items"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Search selected",
    );
    await expect(canvas.getByRole("button", { name: "Files" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/ribbon/top-and-bottom-controller-items-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-ribbon-story-frame">
      <WorkspaceRibbon {controller} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>
