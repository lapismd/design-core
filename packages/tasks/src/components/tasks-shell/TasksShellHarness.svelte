<script lang="ts">
  import { untrack } from "svelte";
  import type {
    TasksPagerState,
    TasksViewportId,
  } from "../../lib/contracts.js";
  import { createInitialPager } from "../../lib/contracts.js";
  import { createTasksStoryFixture } from "../../lib/story-fixtures.js";
  import { ListNavigation } from "../list-navigation/index.js";
  import { TaskDetail } from "../task-detail/index.js";
  import { TaskList } from "../task-list/index.js";
  import TasksShell from "./TasksShell.svelte";

  let {
    viewport = "desktop",
    initialPane = "list",
    startWithDetail = false,
  }: {
    viewport?: TasksViewportId;
    initialPane?: TasksPagerState["pane"];
    startWithDetail?: boolean;
  } = $props();

  const fixture = createTasksStoryFixture({
    openTaskId: untrack(() => startWithDetail) ? "task-brief" : null,
  });

  let pager = $state<TasksPagerState>({
    ...createInitialPager(untrack(() => initialPane)),
  });
  let openTaskId = $state<string | null>(
    untrack(() => startWithDetail) ? "task-brief" : null,
  );
  let activeNavId = $state("inbox");

  const openTask = $derived(
    fixture.tasks.find((task) => task.id === openTaskId) ?? null,
  );
</script>

<div
  style="height: 26rem; border: 1px solid var(--tasks-divider, #ccc); border-radius: 12px; overflow: hidden"
>
  <TasksShell
    {pager}
    {viewport}
    detailOpen={openTaskId !== null}
    onPagerChange={(next) => {
      pager = next;
      if (next.pane === "list" || next.pane === "navigation") {
        openTaskId = null;
      }
    }}
  >
    {#snippet navigation()}
      <ListNavigation
        destinations={fixture.navDestinations}
        activeId={activeNavId}
        onActivate={(id) => {
          activeNavId = id;
        }}
      />
    {/snippet}
    {#snippet main()}
      <TaskList
        listView={fixture.listView}
        tasks={fixture.tasks}
        selection={{ selectedTaskId: openTaskId, openTaskId }}
        onOpen={(id) => {
          openTaskId = id;
          pager = { ...pager, pane: "detail" };
        }}
      />
    {/snippet}
    {#snippet detail()}
      {#if openTask}
        <TaskDetail
          task={openTask}
          lists={fixture.lists}
          onBack={() => {
            openTaskId = null;
            pager = { ...pager, pane: "list" };
          }}
        />
      {/if}
    {/snippet}
  </TasksShell>
</div>
<p>Pane {pager.pane}</p>
{#if openTaskId}
  <p>Detail open {openTaskId}</p>
{:else}
  <p>Detail closed</p>
{/if}
