/** Stable ids used by future Stories, interaction tests, and reference capture. */
export type TasksPageId =
  | "inbox"
  | "today"
  | "tasks"
  | "updates"
  | "lists"
  | "list-detail"
  | "task-detail";

export type TasksViewportId =
  | "desktop"
  | "tablet-landscape"
  | "tablet-portrait"
  | "mobile";

export type TaskPriority = "none" | "low" | "medium" | "high";
export type TaskStatus = "open" | "done";

export type TaskReference = {
  id: string;
  title: string;
  status: TaskStatus;
  due: "overdue" | "today" | "tomorrow" | "later" | null;
  priority: TaskPriority;
  labels: readonly string[];
  assignee: string | null;
  note?: string;
};

export type TaskListReference = {
  id: string;
  name: string;
  kind: "private" | "shared";
  favourite: boolean;
  taskIds: readonly string[];
};

export type InteractionInput =
  | "click"
  | "double-click"
  | "keyboard"
  | "drag"
  | "swipe-left"
  | "swipe-right";

export type MotionContract = {
  id: string;
  input: InteractionInput;
  subject: string;
  viewport: TasksViewportId;
  before: string;
  after: string;
  durationMs: readonly [min: number, max: number];
  reducedMotion: "instant" | "short-fade";
  assertions: readonly string[];
};

export type ReferenceCapture = {
  id: string;
  page: TasksPageId;
  viewport: TasksViewportId;
  state: string;
  file: string;
  redacted: true;
};
