<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { TASKS_REFERENCE_LIST_NAME } from "../../lib/fixtures.js";
  import TasksShell from "./TasksShell.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Components/Tasks Shell",
    component: TasksShell,
    // Compare Playwright baselines to synced Superlist shell captures.
    tags: ["tasks-reference-visual"],
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
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
  import TasksShellHarness from "./TasksShellHarness.svelte";
</script>

<Story
  name="Inbox"
  exportName="Inbox"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-tasks-shell--inbox"),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Tasks navigation")).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Inbox", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Inbox" }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="inbox" />
  {/snippet}
</Story>

<Story
  name="Today"
  exportName="Today"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-tasks-shell--today"),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Today", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Today" }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="today" />
  {/snippet}
</Story>

<Story
  name="Tasks"
  exportName="Tasks"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-tasks-shell--tasks"),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Tasks", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Tasks" }),
    ).toBeVisible();
    await expect(canvas.getByText("All")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="tasks" />
  {/snippet}
</Story>

<Story
  name="Updates"
  exportName="Updates"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-tasks-shell--updates"),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Updates", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Updates" }),
    ).toBeVisible();
    await expect(canvas.getByText("All")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="updates" />
  {/snippet}
</Story>

<Story
  name="Lists"
  exportName="Lists"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-components-tasks-shell--lists"),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Lists", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Lists" }),
    ).toBeVisible();
    await expect(canvas.getByText("All")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="lists" />
  {/snippet}
</Story>

<Story
  name="List — Tasks UI Reference"
  exportName="ListReference"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-tasks-shell--list-reference",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", {
        name: TASKS_REFERENCE_LIST_NAME,
        current: "page",
      }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", {
        level: 1,
        name: TASKS_REFERENCE_LIST_NAME,
      }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="list:list-reference" />
  {/snippet}
</Story>

<Story
  name="List — Shared planning"
  exportName="ListShared"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-tasks-shell--list-shared",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Shared planning", current: "page" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Shared planning" }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness activeNavId="list:list-shared" />
  {/snippet}
</Story>

<Story
  name="Wide with detail"
  exportName="WideWithDetail"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-tasks-shell--wide-with-detail",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Inbox", current: "page" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Details" })[0],
    );
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
    await expect(canvas.getByLabelText("Task detail")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="desktop" startWithDetail />
  {/snippet}
</Story>

<Story
  name="Mobile list pane"
  exportName="MobileList"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-tasks-shell--mobile-list",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Pane list")).toBeVisible();
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Inbox" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open navigation" }),
    );
    await expect(canvas.getByText("Pane navigation")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close navigation" }),
    );
    await expect(canvas.getByText("Pane list")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="mobile" />
  {/snippet}
</Story>

<Story
  name="Mobile detail pane"
  exportName="MobileDetail"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-components-tasks-shell--mobile-detail",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Pane detail")).toBeVisible();
    await expect(canvas.getByLabelText("Task detail")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Back to task list" }),
    );
    await expect(canvas.getByText("Pane list")).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Details" })[0],
    );
    await expect(canvas.getByText("Pane detail")).toBeVisible();
  }}
>
  {#snippet template()}
    <TasksShellHarness viewport="mobile" initialPane="detail" startWithDetail />
  {/snippet}
</Story>
