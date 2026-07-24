<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { TASKS_REFERENCE_LIST_NAME } from "../../lib/fixtures.js";
  import Page from "./ShellPage.svelte";

  const { Story } = defineMeta({
    title: "Tasks/Pages/Tasks shell",
    component: Page,
    // Compare Playwright baselines to synced Superlist shell captures.
    tags: ["skip-visual", "tasks-reference-visual"],
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component: "Fixture-driven Tasks shell page composition.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { visualDeltaForStory } from "../../lib/visual-delta.js";
</script>

<Story
  name="Inbox"
  exportName="Inbox"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--inbox"),
  }}
  play={async ({ canvas }) => {
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
    <Page activeNavId="inbox" />
  {/snippet}
</Story>

<Story
  name="Today"
  exportName="Today"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--today"),
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
    <Page activeNavId="today" />
  {/snippet}
</Story>

<Story
  name="Tasks"
  exportName="Tasks"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--tasks"),
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
    <Page activeNavId="tasks" />
  {/snippet}
</Story>

<Story
  name="Updates"
  exportName="Updates"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--updates"),
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
    <Page activeNavId="updates" />
  {/snippet}
</Story>

<Story
  name="Lists"
  exportName="Lists"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--lists"),
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
    <Page activeNavId="lists" />
  {/snippet}
</Story>

<Story
  name="List — Tasks UI Reference"
  exportName="ListReference"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--list-reference"),
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
    <Page activeNavId="list:list-reference" />
  {/snippet}
</Story>

<Story
  name="List — Shared planning"
  exportName="ListShared"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--list-shared"),
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
    <Page activeNavId="list:list-shared" />
  {/snippet}
</Story>

<Story
  name="Wide with detail"
  exportName="WideWithDetail"
  parameters={{
    visualDelta: visualDeltaForStory(
      "tasks-pages-tasks-shell--wide-with-detail",
    ),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Inbox", current: "page" }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail open task-brief")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page startWithDetail />
  {/snippet}
</Story>

<Story
  name="Mobile list"
  exportName="MobileList"
  parameters={{
    visualDelta: visualDeltaForStory("tasks-pages-tasks-shell--mobile-list"),
  }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { level: 1, name: "Inbox" }),
    ).toBeVisible();
    await expect(canvas.getByText("Detail closed")).toBeVisible();
  }}
>
  {#snippet template()}
    <Page viewport="mobile" />
  {/snippet}
</Story>
