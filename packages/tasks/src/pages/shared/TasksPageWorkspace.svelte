<script lang="ts">
  import { untrack } from "svelte";
  import type {
    TasksFilterId,
    TasksNavDestinationId,
    TasksPageId,
    TasksPagerState,
    TasksViewportId,
    TaskReference,
  } from "../../lib/contracts.js";
  import { createInitialPager } from "../../lib/contracts.js";
  import {
    buildGroupedListView,
    createTasksStoryFixture,
  } from "../../lib/story-fixtures.js";
  import { destinationTip } from "../../lib/fixtures.js";
  import { ListNavigation } from "../../components/list-navigation/index.js";
  import { TaskComposer } from "../../components/task-composer/index.js";
  import { TaskDetail } from "../../components/task-detail/index.js";
  import { TaskList } from "../../components/task-list/index.js";
  import { TasksFeedback } from "../../components/tasks-feedback/index.js";
  import TasksDestinationHeader from "../../components/tasks-shell/TasksDestinationHeader.svelte";
  import { TasksShell } from "../../components/tasks-shell/index.js";

  type Props = {
    page: TasksPageId | "shell";
    viewport?: TasksViewportId;
    title?: string;
    activeNavId?: TasksNavDestinationId;
    initialFilter?: TasksFilterId;
    startWithDetail?: boolean;
    feedbackMode?: "none" | "empty" | "loading" | "error";
  };

  let {
    page,
    viewport = "desktop",
    title,
    activeNavId: activeNavIdOverride,
    initialFilter = "all",
    startWithDetail = false,
    feedbackMode = "none",
  }: Props = $props();

  const initialDetail = untrack(() => startWithDetail);
  const initialFilterId = untrack(() => initialFilter);

  const fixture = createTasksStoryFixture({
    openTaskId: initialDetail ? "task-brief" : null,
  });

  let tasks = $state<TaskReference[]>([...fixture.tasks]);
  let filterId = $state<TasksFilterId>(initialFilterId);
  let doneCollapsed = $state(true);
  let pager = $state<TasksPagerState>(createInitialPager("list"));
  let openTaskId = $state<string | null>(initialDetail ? "task-brief" : null);
  let selectedTaskId = $state<string | null>(
    initialDetail ? "task-brief" : null,
  );
  const initialPage = untrack(() => page);
  const initialActiveNavId = untrack(() => activeNavIdOverride);
  let activeNavId = $state<TasksNavDestinationId>(
    initialActiveNavId ??
      (initialPage === "list-detail"
        ? "list:list-reference"
        : initialPage === "shell"
          ? "inbox"
          : (initialPage as TasksNavDestinationId)),
  );
  let retried = $state(false);

  const displayTitle = $derived(
    title ??
      fixture.navDestinations.find(
        (destination) => destination.id === activeNavId,
      )?.label ??
      "Inbox",
  );

  const showFilters = $derived(
    page === "tasks" ||
      page === "lists" ||
      page === "updates" ||
      (page === "shell" &&
        (activeNavId === "tasks" ||
          activeNavId === "lists" ||
          activeNavId === "updates")),
  );

  const showComposer = $derived(
    !(
      page === "updates" ||
      page === "lists" ||
      (page === "shell" &&
        (activeNavId === "updates" || activeNavId === "lists"))
    ),
  );

  const visibleTasks = $derived.by(() => {
    if (activeNavId.startsWith("list:")) {
      const listId = activeNavId.slice("list:".length);
      const list = fixture.lists.find((item) => item.id === listId);
      if (list) {
        return tasks.filter((task) => list.taskIds.includes(task.id));
      }
    }
    return tasks;
  });

  const listView = $derived(
    buildGroupedListView(visibleTasks, {
      filterId,
      doneCollapsed,
      loading: feedbackMode === "loading",
    }),
  );

  const openTask = $derived(
    visibleTasks.find((task) => task.id === openTaskId) ??
      tasks.find((task) => task.id === openTaskId) ??
      null,
  );

  const showUpdatesFeedback = $derived(
    page === "updates" || (page === "shell" && activeNavId === "updates"),
  );
</script>

<div class="tasks-page-workspace tasks-shell-stage" data-tasks-page={page}>
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
        title={displayTitle}
        description={destinationTip(activeNavId)}
        {showFilters}
        {filterId}
        onFilterChange={(id) => {
          filterId = id;
        }}
      />

      {#if showUpdatesFeedback && feedbackMode === "empty"}
        <TasksFeedback state={{ kind: "empty", message: "No updates yet" }} />
      {:else if showUpdatesFeedback && feedbackMode === "loading"}
        <TasksFeedback
          state={{ kind: "loading", message: "Loading updates" }}
        />
      {:else if showUpdatesFeedback && feedbackMode === "error"}
        <TasksFeedback
          state={{
            kind: "preserving-error",
            message: "Could not load updates",
            retryable: true,
          }}
          onRetry={() => {
            retried = true;
          }}
        />
      {:else}
        <TaskList
          listView={feedbackMode === "empty"
            ? { ...listView, empty: true, orderedTaskIds: [], groups: [] }
            : listView}
          tasks={visibleTasks}
          selection={{ selectedTaskId, openTaskId }}
          showReorderControls={false}
          onSelect={(id) => {
            selectedTaskId = id;
          }}
          onOpen={(id) => {
            selectedTaskId = id;
            openTaskId = id;
            pager = { ...pager, pane: "detail" };
          }}
          onComplete={(id, status) => {
            tasks = tasks.map((task) =>
              task.id === id ? { ...task, status } : task,
            );
          }}
          onToggleDoneGroup={(collapsed) => {
            doneCollapsed = collapsed;
          }}
        >
          {#if showComposer}
            <TaskComposer
              idleLabel="New task"
              onSubmit={({ title: nextTitle }) => {
                tasks = [
                  {
                    id: `task-new-${tasks.length + 1}`,
                    title: nextTitle,
                    status: "open",
                    due:
                      page === "today" ||
                      (page === "shell" && activeNavId === "today")
                        ? "today"
                        : null,
                    priority: "none",
                    labels: [],
                    assignee: null,
                  },
                  ...tasks,
                ];
              }}
            />
          {/if}
        </TaskList>
      {/if}
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
          onComplete={(id, status) => {
            tasks = tasks.map((task) =>
              task.id === id ? { ...task, status } : task,
            );
          }}
          onTitleChange={(id, nextTitle) => {
            tasks = tasks.map((task) =>
              task.id === id ? { ...task, title: nextTitle } : task,
            );
          }}
        />
      {/if}
    {/snippet}
  </TasksShell>
</div>

{#if selectedTaskId}
  <p class="sr-only">Selected {selectedTaskId}</p>
{/if}
{#if openTaskId}
  <p class="sr-only">Detail open {openTaskId}</p>
{:else}
  <p class="sr-only">Detail closed</p>
{/if}
<p class="sr-only">Filter {filterId}</p>
{#if retried}
  <p class="sr-only">Retry requested</p>
{/if}
