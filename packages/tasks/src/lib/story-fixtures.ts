/**
 * Shared Storybook fixture factory for Tasks compositions.
 * Stories should pull synthetic state from here rather than inventing ad-hoc data.
 */
import type {
  TaskReference,
  TasksFeedbackState,
  TasksListViewModel,
  TasksNavDestination,
  TasksPagerState,
  TasksSelectionState,
} from "./contracts.js";
import { createInitialPager } from "./contracts.js";
import {
  buildGroupedListView,
  buildNavDestinations,
  buildSelection,
  buildTask,
  fixtureTaskById,
  listFixtures,
  taskFixtures,
} from "./fixtures.js";

export type TasksStoryFixture = {
  tasks: readonly TaskReference[];
  lists: typeof listFixtures;
  selection: TasksSelectionState;
  pager: TasksPagerState;
  listView: TasksListViewModel;
  navDestinations: readonly TasksNavDestination[];
  activeTask: TaskReference;
  feedback: TasksFeedbackState | null;
};

export type CreateTasksStoryFixtureOptions = {
  selectedTaskId?: string | null;
  openTaskId?: string | null;
  pagerPane?: TasksPagerState["pane"];
  doneCollapsed?: boolean;
  loading?: boolean;
  feedback?: TasksFeedbackState | null;
  /** Override the default fixture task set. */
  tasks?: readonly TaskReference[];
};

/** Deterministic story state for component and page compositions. */
export function createTasksStoryFixture(
  options: CreateTasksStoryFixtureOptions = {},
): TasksStoryFixture {
  const tasks = options.tasks ?? taskFixtures;
  const selectedTaskId =
    options.selectedTaskId === undefined
      ? (tasks[0]?.id ?? null)
      : options.selectedTaskId;
  const openTaskId =
    options.openTaskId === undefined ? selectedTaskId : options.openTaskId;
  const activeTask =
    (openTaskId &&
      (tasks.find((task) => task.id === openTaskId) ??
        fixtureTaskById.get(openTaskId))) ||
    tasks[0] ||
    buildTask({ id: "task-story", title: "Story fixture task" });

  return {
    tasks,
    lists: listFixtures,
    selection: buildSelection(selectedTaskId, openTaskId),
    pager: createInitialPager(options.pagerPane ?? "list"),
    listView: buildGroupedListView(tasks, {
      doneCollapsed: options.doneCollapsed,
      loading: options.loading,
    }),
    navDestinations: buildNavDestinations(listFixtures),
    activeTask,
    feedback: options.feedback ?? null,
  };
}

export {
  buildGroupedListView,
  buildNavDestinations,
  buildSelection,
  buildTask,
  taskFixtures,
  listFixtures,
};
