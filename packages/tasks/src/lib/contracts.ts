/** Stable ids used by Stories, interaction tests, and reference capture. */
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
export type TaskDueBucket = "overdue" | "today" | "tomorrow" | "later" | null;

export type TaskReference = {
  id: string;
  title: string;
  status: TaskStatus;
  due: TaskDueBucket;
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

/** Controlled selection for list + detail coordination. */
export type TasksSelectionState = {
  /** Row highlighted in the list (may differ from open detail). */
  selectedTaskId: string | null;
  /** Task shown in the detail region, if any. */
  openTaskId: string | null;
};

/** One-pane pager destinations on compact viewports. */
export type TasksPagerPane = "navigation" | "list" | "detail";

export type TasksPagerState = {
  pane: TasksPagerPane;
  /** When true, detail open must not reset the list scroll position. */
  preserveListScroll: boolean;
};

/** Exclusive filter ids used by TasksFilters and page compositions. */
export type TasksFilterId =
  | "all"
  | "for-me"
  | "others"
  | "upcoming"
  | "done"
  | "shared"
  | "private"
  | "meetings";

export type TasksSortId = "manual" | "due" | "priority" | "title";

export type TasksListGroupId =
  | "overdue"
  | "today"
  | "upcoming"
  | "no-date"
  | "for-me"
  | "others"
  | "done";

export type TasksListGroup = {
  id: TasksListGroupId;
  label: string;
  taskIds: readonly string[];
  collapsible?: boolean;
  collapsed?: boolean;
};

/** Controlled list presentation model. */
export type TasksListViewModel = {
  groups: readonly TasksListGroup[];
  orderedTaskIds: readonly string[];
  empty: boolean;
  loading: boolean;
  filterId: TasksFilterId;
  sortId: TasksSortId;
};

export type TaskPropertyKey =
  | "due"
  | "assignee"
  | "priority"
  | "labels"
  | "list";

export type TaskPropertyMutation =
  | { key: "due"; value: TaskDueBucket }
  | { key: "assignee"; value: string | null }
  | { key: "priority"; value: TaskPriority }
  | { key: "labels"; value: readonly string[] }
  | { key: "list"; value: string | null };

export type TaskReorderAction = {
  taskId: string;
  fromIndex: number;
  toIndex: number;
  /** Host accepts or rejects; UI announces the result. */
  accepted: boolean;
};

export type TaskComposeAction = {
  title: string;
  listId: string | null;
};

/** Controlled navigation row model for ListNavigation. */
export type TasksNavDestinationId =
  | "inbox"
  | "today"
  | "tasks"
  | "updates"
  | "lists"
  | `list:${string}`;

export type TasksNavDestination = {
  id: TasksNavDestinationId;
  label: string;
  kind: "system" | "list";
  favourite?: boolean;
  listId?: string;
  /** Optional unread or item count shown as a secondary badge. */
  count?: number;
};

export type TasksFeedbackKind =
  | "empty"
  | "loading"
  | "preserving-error"
  | "status"
  | "undo";

export type TasksFeedbackState = {
  kind: TasksFeedbackKind;
  message: string;
  retryable?: boolean;
  undoable?: boolean;
};

/** Public callback surface for controlled Tasks compositions. */
export type TasksSelectionChangeHandler = (next: TasksSelectionState) => void;
export type TasksPagerChangeHandler = (next: TasksPagerState) => void;
export type TasksCompleteHandler = (taskId: string, status: TaskStatus) => void;
export type TasksOpenHandler = (taskId: string) => void;
export type TasksReorderHandler = (action: TaskReorderAction) => void;
export type TasksPropertyChangeHandler = (
  taskId: string,
  mutation: TaskPropertyMutation,
) => void;
export type TasksComposeHandler = (action: TaskComposeAction) => void;
export type TasksFilterChangeHandler = (filterId: TasksFilterId) => void;
export type TasksSortChangeHandler = (sortId: TasksSortId) => void;
export type TasksFavouriteHandler = (
  listId: string,
  favourite: boolean,
) => void;
export type TasksNavActivateHandler = (id: TasksNavDestinationId) => void;
export type TasksRetryHandler = () => void;
export type TasksUndoHandler = () => void;
export type TasksTitleChangeHandler = (taskId: string, title: string) => void;

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
  fixtureOnly: true;
};

/** Invariant helpers used by unit tests and story factories. */
export function assertSelectionConsistent(
  selection: TasksSelectionState,
  taskIds: ReadonlySet<string>,
): void {
  if (
    selection.selectedTaskId !== null &&
    !taskIds.has(selection.selectedTaskId)
  ) {
    throw new Error(
      `selectedTaskId "${selection.selectedTaskId}" is not in the task set`,
    );
  }
  if (selection.openTaskId !== null && !taskIds.has(selection.openTaskId)) {
    throw new Error(
      `openTaskId "${selection.openTaskId}" is not in the task set`,
    );
  }
}

export function assertReorderBounds(
  action: TaskReorderAction,
  length: number,
): void {
  if (action.fromIndex < 0 || action.fromIndex >= length) {
    throw new Error(
      `fromIndex ${action.fromIndex} out of bounds for ${length}`,
    );
  }
  if (action.toIndex < 0 || action.toIndex >= length) {
    throw new Error(`toIndex ${action.toIndex} out of bounds for ${length}`);
  }
}

export function createInitialSelection(
  openTaskId: string | null = null,
): TasksSelectionState {
  return {
    selectedTaskId: openTaskId,
    openTaskId,
  };
}

export function createInitialPager(
  pane: TasksPagerPane = "list",
): TasksPagerState {
  return {
    pane,
    preserveListScroll: true,
  };
}
