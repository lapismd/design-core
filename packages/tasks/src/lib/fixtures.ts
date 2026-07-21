import type {
  TaskListReference,
  TaskReference,
  TasksFilterId,
  TasksListGroup,
  TasksListViewModel,
  TasksNavDestination,
  TasksSelectionState,
  TasksSortId,
} from "./contracts.js";
import { createInitialSelection } from "./contracts.js";

export const TASKS_REFERENCE_LIST_NAME = "Tasks UI Reference";

export const taskFixtures = [
  {
    id: "task-brief",
    title: "Review the launch brief today",
    status: "open",
    due: "overdue",
    priority: "high",
    labels: ["Launch"],
    assignee: "Casey",
    note: "Confirm scope, owner, and decision date.",
  },
  {
    id: "task-prototype",
    title: "Prepare responsive reference captures",
    status: "open",
    due: "today",
    priority: "medium",
    labels: ["Reference"],
    assignee: "Alex",
  },
  {
    id: "task-copy",
    title: "Define mobile swipe feedback",
    status: "open",
    due: "tomorrow",
    priority: "low",
    labels: ["Interaction"],
    assignee: null,
  },
  {
    id: "task-checklist",
    title: "Reorder fixture task rows",
    status: "open",
    due: "later",
    priority: "none",
    labels: ["Interaction"],
    assignee: "Casey",
  },
  {
    id: "task-keyboard",
    title: "Verify keyboard behavior",
    status: "open",
    due: null,
    priority: "none",
    labels: ["Accessibility"],
    assignee: null,
  },
  {
    id: "task-empty-state",
    title: "Check empty state behavior",
    status: "done",
    due: null,
    priority: "none",
    labels: ["Reference"],
    assignee: null,
  },
] as const satisfies readonly TaskReference[];

export const listFixtures = [
  {
    id: "list-reference",
    name: TASKS_REFERENCE_LIST_NAME,
    kind: "private",
    favourite: true,
    taskIds: taskFixtures.map((task) => task.id),
  },
  {
    id: "list-shared",
    name: "Shared planning",
    kind: "shared",
    favourite: false,
    taskIds: ["task-brief", "task-prototype"],
  },
] as const satisfies readonly TaskListReference[];

export const fixtureTaskById = new Map(
  taskFixtures.map((task) => [task.id, task]),
);

export type BuildTaskOptions = Partial<TaskReference> & {
  id: string;
  title: string;
};

/** Deterministic task builder for stories and unit tests. */
export function buildTask(options: BuildTaskOptions): TaskReference {
  return {
    id: options.id,
    title: options.title,
    status: options.status ?? "open",
    due: options.due ?? null,
    priority: options.priority ?? "none",
    labels: options.labels ?? [],
    assignee: options.assignee ?? null,
    note: options.note,
  };
}

export type BuildListOptions = Partial<TaskListReference> & {
  id: string;
  name: string;
};

export function buildList(options: BuildListOptions): TaskListReference {
  return {
    id: options.id,
    name: options.name,
    kind: options.kind ?? "private",
    favourite: options.favourite ?? false,
    taskIds: options.taskIds ?? [],
  };
}

export function buildSelection(
  selectedTaskId: string | null = null,
  openTaskId: string | null = selectedTaskId,
): TasksSelectionState {
  return createInitialSelection(openTaskId ?? selectedTaskId);
}

function dueGroupId(due: TaskReference["due"]): TasksListGroup["id"] {
  if (due === "overdue") return "overdue";
  if (due === "today") return "today";
  if (due === "tomorrow" || due === "later") return "upcoming";
  return "no-date";
}

/** Group open tasks by due bucket and append a Done group. */
export function buildGroupedListView(
  tasks: readonly TaskReference[] = taskFixtures,
  options: {
    filterId?: TasksFilterId;
    sortId?: TasksSortId;
    doneCollapsed?: boolean;
    loading?: boolean;
  } = {},
): TasksListViewModel {
  const filterId = options.filterId ?? "all";
  const sortId = options.sortId ?? "manual";
  const open = tasks.filter((task) => task.status === "open");
  const done = tasks.filter((task) => task.status === "done");

  const buckets = new Map<TasksListGroup["id"], string[]>();
  for (const id of ["overdue", "today", "upcoming", "no-date"] as const) {
    buckets.set(id, []);
  }
  for (const task of open) {
    const groupId = dueGroupId(task.due);
    buckets.get(groupId)?.push(task.id);
  }

  const groups: TasksListGroup[] = [];
  for (const id of ["overdue", "today", "upcoming", "no-date"] as const) {
    const taskIds = buckets.get(id) ?? [];
    if (taskIds.length === 0) continue;
    groups.push({
      id,
      label:
        id === "overdue"
          ? "Overdue"
          : id === "today"
            ? "Today"
            : id === "upcoming"
              ? "Upcoming"
              : "No date",
      taskIds,
    });
  }
  if (done.length > 0) {
    groups.push({
      id: "done",
      label: "Done",
      taskIds: done.map((task) => task.id),
      collapsible: true,
      collapsed: options.doneCollapsed ?? true,
    });
  }

  const orderedTaskIds = [
    ...open.map((task) => task.id),
    ...done.map((task) => task.id),
  ];

  return {
    groups,
    orderedTaskIds,
    empty: orderedTaskIds.length === 0,
    loading: options.loading ?? false,
    filterId,
    sortId,
  };
}

/** Synthetic destination tip copy for header banners (not product copy). */
export function destinationTip(id: TasksNavDestination["id"]): string | null {
  if (id.startsWith("list:")) return null;
  switch (id) {
    case "inbox":
      return "Manage all new and incoming tasks — create, move, schedule, and more";
    case "today":
      return "Focus on what is due today";
    case "tasks":
      return "View, sort, and access all of your tasks in one place";
    case "updates":
      return "Catch up on task activity";
    case "lists":
      return "Easily access all your lists";
    default:
      return null;
  }
}

export function buildNavDestinations(
  lists: readonly TaskListReference[] = listFixtures,
): readonly TasksNavDestination[] {
  return [
    { id: "inbox", label: "Inbox", kind: "system", count: 2 },
    { id: "today", label: "Today", kind: "system", count: 1 },
    { id: "tasks", label: "Tasks", kind: "system" },
    { id: "updates", label: "Updates", kind: "system", count: 1 },
    { id: "lists", label: "Lists", kind: "system" },
    ...lists.map(
      (list): TasksNavDestination => ({
        id: `list:${list.id}`,
        label: list.name,
        kind: "list",
        favourite: list.favourite,
        listId: list.id,
      }),
    ),
  ];
}

/** Stable task id set for contract invariant checks. */
export function fixtureTaskIdSet(
  tasks: readonly TaskReference[] = taskFixtures,
): ReadonlySet<string> {
  return new Set(tasks.map((task) => task.id));
}
