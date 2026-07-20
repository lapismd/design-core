import type { TaskListReference, TaskReference } from "./contracts.js";

export const TASKS_REFERENCE_LIST_NAME = "Tasks UI Reference";

export const taskFixtures = [
  {
    id: "task-brief",
    title: "Review the launch brief",
    status: "open",
    due: "overdue",
    priority: "high",
    labels: ["Launch"],
    assignee: "Casey",
    note: "Confirm scope, owner, and decision date.",
  },
  {
    id: "task-prototype",
    title: "Sketch the mobile task flow",
    status: "open",
    due: "today",
    priority: "medium",
    labels: ["Design"],
    assignee: "Alex",
  },
  {
    id: "task-copy",
    title: "Prepare the empty-state copy",
    status: "open",
    due: "tomorrow",
    priority: "low",
    labels: ["Content"],
    assignee: null,
  },
  {
    id: "task-checklist",
    title: "Publish the release checklist",
    status: "done",
    due: "later",
    priority: "none",
    labels: ["Launch"],
    assignee: "Casey",
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
