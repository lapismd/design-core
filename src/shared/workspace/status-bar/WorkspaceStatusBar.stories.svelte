<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceStatusBar from "./WorkspaceStatusBar.svelte";
  import "./WorkspaceStatusBar.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Status Bar",
    component: WorkspaceStatusBar,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Lapis-shaped bottom-right status surface backed by the controller status registry."}}}});
</script>

<script lang="ts">
  let result = $state("No action selected");
  const controller = new WorkspaceShellController();
  controller.statusBar.addItem({
    id: "sync",
    label: "Synced",
    icon: "cloud-check",
    onSelect: () => {
      result = "Sync selected";
    }});
  controller.statusBar.addItem({
    id: "version",
    align: "right",
    label: "v1.12.3",
    icon: "circle-help",
    onSelect: () => {
      result = "Version selected";
    }});
</script>

<Story
  name="Left and right contributions"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Workspace status")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "v1.12.3" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Version selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/status-bar/left-and-right-contributions-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
>
  {#snippet template()}
    <div class="ui-workspace-status-bar-story-frame">
      <WorkspaceStatusBar {controller} />
    </div>
    <output class="sr-only">{result}</output>
  {/snippet}
</Story>
