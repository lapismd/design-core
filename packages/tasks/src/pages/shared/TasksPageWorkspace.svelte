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
  import { ListNavigation } from "../../components/list-navigation/index.js";
  import { TaskComposer } from "../../components/task-composer/index.js";
  import { TaskDetail } from "../../components/task-detail/index.js";
  import { TaskList } from "../../components/task-list/index.js";
  import { TasksFeedback } from "../../components/tasks-feedback/index.js";
  import { TasksFilters } from "../../components/tasks-filters/index.js";
  import { TasksShell } from "../../components/tasks-shell/index.js";

  type Props = {
    page: TasksPageId | "shell";
    viewport?: TasksViewportId;
    title?: string;
    initialFilter?: TasksFilterId;
    startWithDetail?: boolean;
    feedbackMode?: "none" | "empty" | "loading" | "error";
  };

  let {
    page,
    viewport = "desktop",
    title = "Inbox",
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
  let activeNavId = $state<TasksNavDestinationId>(
    initialPage === "list-detail"
      ? "list:list-reference"
      : initialPage === "shell"
        ? "inbox"
        : (initialPage as TasksNavDestinationId),
  );
  let retried = $state(false);

  const listView = $derived(
    buildGroupedListView(tasks, {
      filterId,
      doneCollapsed,
      loading: feedbackMode === "loading",
    }),
  );

  const openTask = $derived(
    tasks.find((task) => task.id === openTaskId) ?? null,
  );

  const showUpdatesFeedback = $derived(page === "updates");
</script>

<div
  class="tasks-page-workspace"
  data-tasks-page={page}
  style="height: 28rem; border: 1px solid var(--tasks-divider, #ccc); border-radius: 12px; overflow: hidden"
>
  <TasksShell
    {pager}
    {viewport}
    detailOpen={openTaskId !== null}
    onPagerChange={(next) => {
      pager = next;
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
      <header class="tasks-page-workspace__header">
        <h1>{title}</h1>
        {#if page === "tasks" || page === "lists" || page === "updates"}
          <TasksFilters
            {filterId}
            onFilterChange={(id) => {
              filterId = id;
            }}
          />
        {/if}
      </header>

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
          {tasks}
          selection={{ selectedTaskId, openTaskId }}
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
          {#if page !== "updates" && page !== "lists"}
            <TaskComposer
              onSubmit={({ title: nextTitle }) => {
                tasks = [
                  {
                    id: `task-new-${tasks.length + 1}`,
                    title: nextTitle,
                    status: "open",
                    due: page === "today" ? "today" : null,
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
    {#if openTask}
      {#snippet detail()}
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
      {/snippet}
    {/if}
  </TasksShell>
</div>

{#if selectedTaskId}
  <p>Selected {selectedTaskId}</p>
{/if}
{#if openTaskId}
  <p>Detail open {openTaskId}</p>
{:else}
  <p>Detail closed</p>
{/if}
<p>Filter {filterId}</p>
{#if retried}
  <p>Retry requested</p>
{/if}

<style>
  .tasks-page-workspace__header {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem 0.75rem 0.25rem;
  }

  .tasks-page-workspace__header h1 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--tasks-ink);
  }
</style>
