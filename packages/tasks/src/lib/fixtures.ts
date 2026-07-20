import type { TaskListReference, TaskReference } from "./contracts.js";

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
    status: "open",
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
] as const satisfies readonly TaskListReference[];

export const fixtureTaskById = new Map(
  taskFixtures.map((task) => [task.id, task]),
);
