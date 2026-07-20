<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import TasksShell from "./TasksShell.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Tasks Shell",
    component: TasksShell,
    tags: ["skip-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Controlled root layout receiving navigation/main/detail regions. Desktop renders three panes; tablet-landscape renders a compact detail rail overlay; tablet-portrait and mobile render a one-pane pager driven by `pager.pane`.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { referenceVisualDelta } from "../../lib/story-data.js";
  import TasksShellHarness from "./TasksShellHarness.svelte";
</script>

<Story
  name="Wide, no detail"
  exportName="WideNoDetail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Tasks navigation")).toBeVisible();
    await expect(canvas.getByLabelText("Tasks")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="desktop" />
  {/snippet}
</Story>

<Story
  name="Wide with detail"
  exportName="WideWithDetail"
  parameters={{ visualDelta: referenceVisualDelta("desktop-task-detail") }}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Details" })[0],
    );
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
    await expect(canvas.getByLabelText("Task detail")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="desktop" />
  {/snippet}
</Story>

<Story
  name="Mobile list pane"
  exportName="MobileList"
  parameters={{ visualDelta: referenceVisualDelta("mobile-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Pane list")).toBeVisible();
    await expect(canvas.getByLabelText("Tasks")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open navigation" }),
    );
    await expect(canvas.getByText("Pane navigation")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="mobile" />
  {/snippet}
</Story>

<Story
  name="Mobile detail pane"
  exportName="MobileDetail"
  parameters={{ visualDelta: referenceVisualDelta("mobile-inbox") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Pane detail")).toBeVisible();
    await expect(canvas.getByLabelText("Task detail")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Back to task list" }),
    );
    await expect(canvas.getByText("Pane list")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="mobile" initialPane="detail" startWithDetail />
  {/snippet}
</Story>
