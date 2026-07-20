import type {
  MotionContract,
  TasksPageId,
  TasksViewportId,
} from "./contracts.js";

export type ReferenceViewport = {
  id: TasksViewportId;
  width: number;
  height: number;
  deviceScaleFactor: 1;
};

/** Reference capture is intentionally CSS-pixel deterministic, unlike product visual baselines. */
export const referenceViewports = [
  { id: "desktop", width: 1440, height: 900, deviceScaleFactor: 1 },
  { id: "tablet-landscape", width: 1024, height: 768, deviceScaleFactor: 1 },
  { id: "tablet-portrait", width: 768, height: 1024, deviceScaleFactor: 1 },
  { id: "mobile", width: 390, height: 844, deviceScaleFactor: 1 },
] as const satisfies readonly ReferenceViewport[];

export type CaptureScenario = {
  id: string;
  page: TasksPageId;
  viewport: TasksViewportId;
  state: string;
  needsFixture?: boolean;
};

export const captureScenarios = [
  { id: "desktop-inbox", page: "inbox", viewport: "desktop", state: "default" },
  {
    id: "desktop-today",
    page: "today",
    viewport: "desktop",
    state: "overdue-group",
  },
  {
    id: "desktop-tasks",
    page: "tasks",
    viewport: "desktop",
    state: "tasks-for-me",
  },
  {
    id: "desktop-updates",
    page: "updates",
    viewport: "desktop",
    state: "empty",
  },
  {
    id: "desktop-lists",
    page: "lists",
    viewport: "desktop",
    state: "all-lists",
  },
  {
    id: "desktop-list-detail",
    page: "list-detail",
    viewport: "desktop",
    state: "open",
    needsFixture: true,
  },
  {
    id: "desktop-task-detail",
    page: "task-detail",
    viewport: "desktop",
    state: "open",
    needsFixture: true,
  },
  {
    id: "tablet-landscape-inbox",
    page: "inbox",
    viewport: "tablet-landscape",
    state: "default",
  },
  {
    id: "tablet-portrait-inbox",
    page: "inbox",
    viewport: "tablet-portrait",
    state: "pager-root",
  },
  {
    id: "mobile-inbox",
    page: "inbox",
    viewport: "mobile",
    state: "pager-root",
  },
  {
    id: "mobile-task-detail",
    page: "task-detail",
    viewport: "mobile",
    state: "pager-detail",
    needsFixture: true,
  },
] as const satisfies readonly CaptureScenario[];

export const motionContracts = [
  {
    id: "task-complete",
    input: "click",
    subject: "task completion control",
    viewport: "desktop",
    before: "open task row",
    after: "completed task row or Done group",
    durationMs: [160, 260],
    reducedMotion: "instant",
    assertions: [
      "row remains identifiable",
      "state is announced",
      "undo is available when supported",
    ],
  },
  {
    id: "task-open-double-click",
    input: "double-click",
    subject: "desktop task row body",
    viewport: "desktop",
    before: "task list",
    after: "selected task row; explicit details affordance remains available",
    durationMs: [0, 80],
    reducedMotion: "instant",
    assertions: [
      "completion control does not toggle",
      "double click is not the only route to detail",
      "the revealed details affordance opens the pane",
    ],
  },
  {
    id: "task-reorder-drag",
    input: "drag",
    subject: "task row drag handle",
    viewport: "desktop",
    before: "ordered open tasks",
    after: "new persisted order",
    durationMs: [140, 240],
    reducedMotion: "instant",
    assertions: [
      "drop target is visible",
      "keyboard reorder remains available",
    ],
  },
  {
    id: "mobile-row-swipe-complete",
    input: "swipe-left",
    subject: "mobile task row",
    viewport: "mobile",
    before: "resting row",
    after: "trailing task action revealed",
    durationMs: [180, 320],
    reducedMotion: "short-fade",
    assertions: [
      "horizontal gesture does not navigate pager",
      "action has an accessible button equivalent",
      "completion requires an explicit follow-up action",
    ],
  },
  {
    id: "mobile-pager-back",
    input: "swipe-right",
    subject: "mobile detail pane",
    viewport: "mobile",
    before: "detail pane",
    after: "task list pane",
    durationMs: [220, 360],
    reducedMotion: "short-fade",
    assertions: [
      "selected task stays visible",
      "back button provides the same result",
    ],
  },
  {
    id: "keyboard-open-task",
    input: "keyboard",
    subject: "focused task row",
    viewport: "desktop",
    before: "focused list row",
    after: "detail pane",
    durationMs: [0, 80],
    reducedMotion: "instant",
    assertions: ["Enter opens detail", "Space toggles completion only"],
  },
] as const satisfies readonly MotionContract[];
