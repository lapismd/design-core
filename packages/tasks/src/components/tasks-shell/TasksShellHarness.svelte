<script lang="ts">
  import { untrack } from "svelte";
  import type {
    TasksFilterId,
    TasksNavDestinationId,
    TasksPagerState,
    TasksViewportId,
  } from "../../lib/contracts.js";
  import { createInitialPager } from "../../lib/contracts.js";
  import {
    buildGroupedListView,
    createTasksStoryFixture,
  } from "../../lib/story-fixtures.js";
  import { destinationTip } from "../../lib/fixtures.js";
  import { ListNavigation } from "../list-navigation/index.js";
  import { TaskComposer } from "../task-composer/index.js";
  import { TaskDetail } from "../task-detail/index.js";
  import { TaskList } from "../task-list/index.js";
  import TasksDestinationHeader from "./TasksDestinationHeader.svelte";
  import TasksShell from "./TasksShell.svelte";

  let {
    viewport = "desktop",
    initialPane = "list",
    startWithDetail = false,
    activeNavId: initialActiveNavId = "inbox",
  }: {
    viewport?: TasksViewportId;
    initialPane?: TasksPagerState["pane"];
    startWithDetail?: boolean;
    activeNavId?: TasksNavDestinationId;
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
  let activeNavId = $state<TasksNavDestinationId>(
    untrack(() => initialActiveNavId),
  );
  let filterId = $state<TasksFilterId>("all");
  let doneCollapsed = $state(true);

  const mainTitle = $derived(
    fixture.navDestinations.find(
      (destination) => destination.id === activeNavId,
    )?.label ?? "Inbox",
  );

  const showFilters = $derived(
    activeNavId === "tasks" ||
      activeNavId === "lists" ||
      activeNavId === "updates",
  );

  const showComposer = $derived(
    activeNavId !== "updates" && activeNavId !== "lists",
  );

  const visibleTasks = $derived.by(() => {
    if (activeNavId.startsWith("list:")) {
      const listId = activeNavId.slice("list:".length);
      const list = fixture.lists.find((item) => item.id === listId);
      if (list) {
        const listTaskIds = new Set<string>(list.taskIds);
        return fixture.tasks.filter((task) => listTaskIds.has(task.id));
      }
    }
    return fixture.tasks;
  });

  const listView = $derived(
    buildGroupedListView(visibleTasks, {
      filterId,
      doneCollapsed,
    }),
  );

  const openTask = $derived(
    visibleTasks.find((task) => task.id === openTaskId) ??
      fixture.tasks.find((task) => task.id === openTaskId) ??
      null,
  );
</script>

<div class="tasks-shell-stage">
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
      <TasksDestinationHeader
        title={mainTitle}
        description={destinationTip(activeNavId)}
        {showFilters}
        {filterId}
        onFilterChange={(id) => {
          filterId = id;
        }}
      />
      <TaskList
        {listView}
        tasks={visibleTasks}
        selection={{ selectedTaskId: openTaskId, openTaskId }}
        showReorderControls={false}
        onOpen={(id) => {
          openTaskId = id;
          pager = { ...pager, pane: "detail" };
        }}
        onToggleDoneGroup={(collapsed) => {
          doneCollapsed = collapsed;
        }}
      >
        {#if showComposer}
          <TaskComposer idleLabel="New task" />
        {/if}
      </TaskList>
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
<p class="sr-only">Pane {pager.pane}</p>
{#if openTaskId}
  <p class="sr-only">Detail open {openTaskId}</p>
{:else}
  <p class="sr-only">Detail closed</p>
{/if}
