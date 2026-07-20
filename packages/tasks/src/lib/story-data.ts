export type TasksReferenceTarget = {
  id: string;
  title: string;
  description: string;
  page: string;
  viewport: string;
  state: string;
  source: string;
};

export type TasksImplementationBrief = {
  id: string;
  kind: "Page" | "Component";
  title: string;
  summary: string;
  specPath: string;
  fixtureState: string;
  responsibilities: readonly string[];
  reuse: readonly string[];
  additions: readonly string[];
  storyChecks: readonly string[];
  referenceTargetId?: string;
};

const syntheticCaptureRoot = "/tasks-reference/2026-07-20";
/** Local-only live Superlist captures (gitignored). Never commit these PNGs. */
export const liveCaptureRoot = "/tasks-reference-live";

const MOTION_REFERENCE_IDS = new Set([
  "task-open-motion",
  "mobile-swipe-motion",
]);

/** Opt-in: `STORYBOOK_TASKS_LIVE_REFERENCE=1 pnpm storybook` */
export function preferLiveReference(): boolean {
  return import.meta.env.STORYBOOK_TASKS_LIVE_REFERENCE === "1";
}

function syntheticScreenshotSource(id: string): string {
  return `${syntheticCaptureRoot}/screenshots/synthetic-browser/${id}.png`;
}

function liveScreenshotSource(id: string): string {
  return `${liveCaptureRoot}/screenshots/${id}.png`;
}

/** Only synthetic-fixture evidence is exposed to Storybook by default. */
export const referenceTargets = [
  {
    id: "desktop-inbox",
    title: "Desktop — Inbox",
    description: "Default task collection with a persistent left navigation.",
    page: "Inbox",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture list",
    source: syntheticScreenshotSource("desktop-inbox"),
  },
  {
    id: "desktop-today",
    title: "Desktop — Today",
    description: "Grouped work that makes overdue and today states scannable.",
    page: "Today",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture layout",
    source: syntheticScreenshotSource("desktop-today"),
  },
  {
    id: "desktop-tasks",
    title: "Desktop — Tasks",
    description: "Task overview with ownership/status filtering.",
    page: "Tasks",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture layout",
    source: syntheticScreenshotSource("desktop-tasks"),
  },
  {
    id: "desktop-updates",
    title: "Desktop — Updates",
    description: "Quiet empty feedback state with compact filters.",
    page: "Updates",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture layout",
    source: syntheticScreenshotSource("desktop-updates"),
  },
  {
    id: "desktop-lists",
    title: "Desktop — Lists",
    description: "List index with navigation and list-level actions.",
    page: "Lists",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture layout",
    source: syntheticScreenshotSource("desktop-lists"),
  },
  {
    id: "desktop-list-detail",
    title: "Desktop — List detail",
    description: "Selected list with tasks and an inline composer location.",
    page: "List detail",
    viewport: "1680 × 1000 desktop",
    state: "Synthetic fixture list",
    source: syntheticScreenshotSource("desktop-list-detail"),
  },
  {
    id: "desktop-task-detail",
    title: "Desktop — Task detail",
    description: "Task detail in the desktop rail treatment.",
    page: "Task detail",
    viewport: "1680 × 1000 desktop",
    state: "Detail open",
    source: syntheticScreenshotSource("desktop-task-detail"),
  },
  {
    id: "tablet-landscape-inbox",
    title: "Tablet landscape — Inbox",
    description: "The inbox under a constrained two-pane desktop treatment.",
    page: "Inbox",
    viewport: "1024 × 768 tablet landscape",
    state: "Synthetic fixture contract",
    source: syntheticScreenshotSource("tablet-landscape-inbox"),
  },
  {
    id: "tablet-portrait-inbox",
    title: "Tablet portrait — Inbox",
    description: "The pager-root breakpoint, before a detail pane opens.",
    page: "Inbox",
    viewport: "768 × 1024 tablet portrait",
    state: "Synthetic fixture contract",
    source: syntheticScreenshotSource("tablet-portrait-inbox"),
  },
  {
    id: "mobile-inbox",
    title: "Mobile — Inbox",
    description: "Mobile root pane with a compact top control and row actions.",
    page: "Inbox",
    viewport: "390 × 844 mobile",
    state: "Synthetic fixture contract",
    source: syntheticScreenshotSource("mobile-inbox"),
  },
  {
    id: "task-open-motion",
    title: "Interaction — Select then open task detail",
    description:
      "Captured browser sequence: selecting reveals a details affordance; that affordance opens detail.",
    page: "Task detail",
    viewport: "Desktop",
    state: "Selection → explicit open",
    source: `${syntheticCaptureRoot}/motion/synthetic-browser-task-open/contact-sheet.png`,
  },
  {
    id: "mobile-swipe-motion",
    title: "Interaction — Mobile row swipe",
    description:
      "Fixture contract: a left drag translates the row and reveals its trailing action.",
    page: "Task row",
    viewport: "Mobile",
    state: "Swipe action revealed",
    source: `${syntheticCaptureRoot}/motion/synthetic-browser-mobile-row-swipe/contact-sheet.png`,
  },
] as const satisfies readonly TasksReferenceTarget[];

export const referenceTargetById = new Map(
  referenceTargets.map((target) => [target.id, target]),
);

export function getReferenceTarget(
  id: (typeof referenceTargets)[number]["id"] | string,
): TasksReferenceTarget {
  const target = referenceTargetById.get(
    id as (typeof referenceTargets)[number]["id"],
  );
  if (!target) throw new Error(`Unknown Tasks reference target: ${id}`);
  if (preferLiveReference() && !MOTION_REFERENCE_IDS.has(id)) {
    return {
      ...target,
      state: "Live session — local only",
      source: liveScreenshotSource(id),
    };
  }
  return target;
}

/**
 * Visual Delta settings for reference captures. Default: committed synthetics
 * under `/tasks-reference`. With `STORYBOOK_TASKS_LIVE_REFERENCE=1`, screenshot
 * targets resolve to gitignored `/tasks-reference-live/screenshots/` (motion
 * contact sheets stay synthetic).
 */
export function referenceVisualDelta(...targetIds: readonly string[]) {
  return {
    images: targetIds.map((id) => getReferenceTarget(id).source),
    opacity: 0.5,
    colorInversion: false,
    align: "canvas",
    placement: "right",
    passThresholdPercent: 0.1,
  };
}

/**
 * Local-only live Superlist captures (gitignored under
 * `.reference-artifacts/live-superlist/`). Never commit these PNGs — they may
 * contain real account/list content. Served at `/tasks-reference-live`.
 */

export type TasksLiveReferenceId =
  | "desktop-inbox"
  | "desktop-today"
  | "desktop-tasks"
  | "desktop-updates"
  | "desktop-lists"
  | "desktop-list-detail"
  | "desktop-task-detail"
  | "tablet-landscape-inbox"
  | "tablet-portrait-inbox"
  | "mobile-inbox"
  | "mobile-task-detail";

export const liveReferenceTargets = [
  {
    id: "desktop-inbox",
    title: "Live — Desktop Inbox",
    description: "Local Chrome capture of Superlist Inbox (not committed).",
    page: "Inbox",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-inbox.png`,
  },
  {
    id: "desktop-today",
    title: "Live — Desktop Today",
    description: "Local Chrome capture of Superlist Today (not committed).",
    page: "Today",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-today.png`,
  },
  {
    id: "desktop-tasks",
    title: "Live — Desktop Tasks",
    description: "Local Chrome capture of Superlist Tasks (not committed).",
    page: "Tasks",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-tasks.png`,
  },
  {
    id: "desktop-updates",
    title: "Live — Desktop Updates",
    description: "Local Chrome capture of Superlist Updates (not committed).",
    page: "Updates",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-updates.png`,
  },
  {
    id: "desktop-lists",
    title: "Live — Desktop Lists",
    description: "Local Chrome capture of Superlist Lists (not committed).",
    page: "Lists",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-lists.png`,
  },
  {
    id: "desktop-list-detail",
    title: "Live — Desktop List detail",
    description: "Local Chrome capture of the reference list (not committed).",
    page: "List detail",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-list-detail.png`,
  },
  {
    id: "desktop-task-detail",
    title: "Live — Desktop Task detail",
    description: "Local Chrome capture with task detail open (not committed).",
    page: "Task detail",
    viewport: "1680 × 1000 desktop",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/desktop-task-detail.png`,
  },
  {
    id: "tablet-landscape-inbox",
    title: "Live — Tablet landscape Inbox",
    description: "Local Chrome capture at 1024×768 (not committed).",
    page: "Inbox",
    viewport: "1024 × 768 tablet landscape",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/tablet-landscape-inbox.png`,
  },
  {
    id: "tablet-portrait-inbox",
    title: "Live — Tablet portrait Inbox",
    description: "Local Chrome capture at 768×1024 (not committed).",
    page: "Inbox",
    viewport: "768 × 1024 tablet portrait",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/tablet-portrait-inbox.png`,
  },
  {
    id: "mobile-inbox",
    title: "Live — Mobile Inbox",
    description: "Local Chrome capture at 390×844 (not committed).",
    page: "Inbox",
    viewport: "390 × 844 mobile",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/mobile-inbox.png`,
  },
  {
    id: "mobile-task-detail",
    title: "Live — Mobile Task detail",
    description:
      "Local Chrome capture with detail open on mobile (not committed).",
    page: "Task detail",
    viewport: "390 × 844 mobile",
    state: "Live session — local only",
    source: `${liveCaptureRoot}/screenshots/mobile-task-detail.png`,
  },
] as const satisfies readonly TasksReferenceTarget[];

const liveReferenceTargetById = new Map(
  liveReferenceTargets.map((target) => [target.id, target]),
);

export function getLiveReferenceTarget(
  id: TasksLiveReferenceId | string,
): TasksReferenceTarget {
  const target = liveReferenceTargetById.get(id as TasksLiveReferenceId);
  if (!target) throw new Error(`Unknown Tasks live reference target: ${id}`);
  return target;
}

/** Visual Delta overlay for local-only live Superlist screenshots. */
export function liveReferenceVisualDelta(
  ...targetIds: readonly TasksLiveReferenceId[]
) {
  return {
    images: targetIds.map((id) => getLiveReferenceTarget(id).source),
    opacity: 0.5,
    colorInversion: false,
    align: "canvas" as const,
    placement: "right" as const,
    passThresholdPercent: 0.1,
  };
}

export const pageImplementationBriefs = [
  {
    id: "shell",
    kind: "Page",
    title: "Tasks shell",
    summary:
      "Controlled desktop shell and compact pager frame for every Tasks page.",
    specPath: "packages/tasks/specs/pages/shell.md",
    fixtureState:
      "Inbox with no selection, then Review the launch brief selected.",
    responsibilities: [
      "Coordinate navigation, main pane, detail rail, and mobile pager positions.",
      "Preserve list scroll position when detail opens or closes.",
    ],
    reuse: ["Sidebar", "Resizable", "ScrollArea", "Separator"],
    additions: ["None in the first slice"],
    storyChecks: [
      "Desktop with and without a selection",
      "Tablet and mobile pager positions",
      "Focus returns to the selected task after close",
    ],
    referenceTargetId: "desktop-inbox",
  },
  {
    id: "inbox",
    kind: "Page",
    title: "Inbox",
    summary:
      "Default collection of untriaged work with a low-friction add-task path.",
    specPath: "packages/tasks/specs/pages/inbox.md",
    fixtureState: "Six open synthetic fixture tasks.",
    responsibilities: [
      "Render open work, collapsed done work, and the composer insertion point.",
      "Own the selected-row state but delegate persistence to the caller.",
    ],
    reuse: ["ScrollArea", "Collapsible", "Empty", "Button"],
    additions: ["None in the first slice"],
    storyChecks: [
      "Default, empty, composer, and selected-row states",
      "Completion and explicit detail-open routes",
    ],
    referenceTargetId: "desktop-inbox",
  },
  {
    id: "today",
    kind: "Page",
    title: "Today",
    summary:
      "Due-date overview with a semantic overdue group before today work.",
    specPath: "packages/tasks/specs/pages/today.md",
    fixtureState:
      "Synthetic fixture tasks; live due-date grouping still needs a dedicated repeat.",
    responsibilities: [
      "Group rows by urgency with headings and accessible counts.",
      "Move completed work to Done without relying only on colour.",
    ],
    reuse: ["ScrollArea", "Collapsible", "Badge"],
    additions: ["None in the first slice"],
    storyChecks: ["Overdue grouping", "Completion motion", "Reduced motion"],
    referenceTargetId: "desktop-today",
  },
  {
    id: "tasks",
    kind: "Page",
    title: "Tasks overview",
    summary:
      "Ownership/status view with exclusive segments and a sort/filter control.",
    specPath: "packages/tasks/specs/pages/tasks.md",
    fixtureState: "For me segment using the synthetic open tasks.",
    responsibilities: [
      "Keep segment choice separate from task/list data mutation.",
      "Preserve filter state while switching an exclusive view.",
    ],
    reuse: ["ToggleGroup", "DropdownMenu", "Popover", "Button"],
    additions: ["None in the first slice"],
    storyChecks: [
      "Each segment",
      "Empty filtered state",
      "Keyboard segment selection",
    ],
    referenceTargetId: "desktop-tasks",
  },
  {
    id: "updates",
    kind: "Page",
    title: "Updates",
    summary: "Calm feedback surface for task, message, and list activity.",
    specPath: "packages/tasks/specs/pages/updates.md",
    fixtureState: "Empty All filter state.",
    responsibilities: [
      "Render filters above a truthful empty or activity state.",
      "Make future activity links and actor/object/action text independently clear.",
    ],
    reuse: ["ToggleGroup", "Empty", "Spinner", "Alert"],
    additions: ["White-label empty-state artwork decision"],
    storyChecks: ["Empty", "Loading", "Error with retry", "Filter selection"],
    referenceTargetId: "desktop-updates",
  },
  {
    id: "lists",
    kind: "Page",
    title: "Lists index",
    summary:
      "Index of private and shared task collections with independently focusable actions.",
    specPath: "packages/tasks/specs/pages/lists.md",
    fixtureState: "Tasks UI Reference private list.",
    responsibilities: [
      "Keep list activation distinct from favourite and overflow controls.",
      "Filter the index without mutating fixture data.",
    ],
    reuse: ["ToggleGroup", "DropdownMenu", "Button", "ScrollArea"],
    additions: ["ContextMenu when secondary desktop actions are implemented"],
    storyChecks: [
      "All/shared/private filters",
      "Favourite action",
      "Open list detail",
    ],
    referenceTargetId: "desktop-lists",
  },
  {
    id: "list-detail",
    kind: "Page",
    title: "List detail",
    summary:
      "Single-list workspace with title edit, composer, filters, and detail open.",
    specPath: "packages/tasks/specs/pages/list-detail.md",
    fixtureState: "Tasks UI Reference list with synthetic open and done tasks.",
    responsibilities: [
      "Compose TaskList + TaskComposer without duplicating row logic.",
      "Keep list title edit and favourite actions independent of row selection.",
    ],
    reuse: ["ScrollArea", "Button", "Input", "DropdownMenu"],
    additions: ["None in the first slice"],
    storyChecks: [
      "Populated fixture",
      "Composer",
      "Selected detail",
      "Empty filtered state",
    ],
    referenceTargetId: "desktop-list-detail",
  },
  {
    id: "task-detail-page",
    kind: "Page",
    title: "Task detail page",
    summary:
      "Focused editor that renders as a desktop rail or a mobile pager pane.",
    specPath: "packages/tasks/specs/pages/task-detail.md",
    fixtureState: "Review the launch brief selected with note and metadata.",
    responsibilities: [
      "Open from the row details action and restore focus on close.",
      "Use the same content contract for desktop rail and mobile pager.",
    ],
    reuse: ["ScrollArea", "Textarea", "Popover", "DropdownMenu"],
    additions: ["Avatar before assignee/presence treatment"],
    storyChecks: [
      "Pointer and keyboard open",
      "Escape",
      "Mobile back",
      "Right swipe",
    ],
    referenceTargetId: "desktop-task-detail",
  },
] as const satisfies readonly TasksImplementationBrief[];

export const componentImplementationBriefs = [
  {
    id: "task-row",
    kind: "Component",
    title: "Task row",
    summary:
      "Dense task primitive with independent completion, selection, and detail actions.",
    specPath: "packages/tasks/specs/components/task-row.md",
    fixtureState: "Review the launch brief — overdue, high priority, selected.",
    responsibilities: [
      "Separate the completion control from row selection and detail open.",
      "Support compact metadata, drag state, and mobile action reveal.",
    ],
    reuse: ["Button", "Badge", "Tooltip"],
    additions: ["Checkbox before semantic completion control"],
    storyChecks: [
      "Open, done, selected, overdue, focused, dragging, and swipe states",
      "Click, keyboard, explicit details, drag, and swipe contracts",
    ],
    referenceTargetId: "mobile-swipe-motion",
  },
  {
    id: "task-list",
    kind: "Component",
    title: "Task list",
    summary:
      "Ordered group renderer with open work, collapsed Done, empty, and composer locations.",
    specPath: "packages/tasks/specs/components/task-list.md",
    fixtureState:
      "Four synthetic fixture tasks split across open and done groups.",
    responsibilities: [
      "Render semantic group headings and preserve row visibility after detail opens.",
      "Receive data and callbacks without owning persistence or routing.",
    ],
    reuse: ["ScrollArea", "Collapsible", "Empty", "Separator", "Skeleton"],
    additions: ["None in the first slice"],
    storyChecks: ["Grouped", "Empty", "Loading", "Selected", "Done collapsed"],
    referenceTargetId: "desktop-inbox",
  },
  {
    id: "task-composer",
    kind: "Component",
    title: "Task composer",
    summary:
      "Inline add-task affordance that is quiet at rest and explicit when active.",
    specPath: "packages/tasks/specs/components/task-composer.md",
    fixtureState: "Blank draft, then a synthetic title before submit.",
    responsibilities: [
      "Submit a non-empty title on Enter and restore focus to the new row.",
      "Cancel only a blank draft with Escape.",
    ],
    reuse: ["Input", "Textarea", "InputGroup", "Field", "Popover", "Button"],
    additions: ["None in the first slice"],
    storyChecks: ["Idle", "Active", "Validation", "Enter", "Escape"],
    referenceTargetId: "desktop-list-detail",
  },
  {
    id: "task-detail",
    kind: "Component",
    title: "Task detail",
    summary:
      "Controlled selected-task editor used in a desktop rail or mobile pager pane.",
    specPath: "packages/tasks/specs/components/task-detail.md",
    fixtureState:
      "Review the launch brief with note, due date, labels, and assignee.",
    responsibilities: [
      "Host title, properties, note, activity, and a comment placeholder.",
      "Expose a labelled close/back route with reliable focus restoration.",
    ],
    reuse: ["ScrollArea", "Separator", "Textarea", "Popover", "DropdownMenu"],
    additions: ["Avatar before assignee/presence treatment"],
    storyChecks: [
      "Desktop rail",
      "Mobile pager",
      "Initial focus",
      "Close/back",
    ],
    referenceTargetId: "desktop-task-detail",
  },
  {
    id: "task-properties",
    kind: "Component",
    title: "Task properties",
    summary:
      "Ordered, visible-label property controls for due date, people, priority, labels, and list.",
    specPath: "packages/tasks/specs/components/task-properties.md",
    fixtureState:
      "One task with all properties populated and another with empty values.",
    responsibilities: [
      "Keep the current value and action purpose visible for every row.",
      "Use menus/popovers rather than syntax-only metadata edits.",
    ],
    reuse: [
      "TaskDueCalendar",
      "Popover",
      "Select",
      "DropdownMenu",
      "Badge",
      "Field",
    ],
    additions: ["Checkbox for multi-select menus"],
    storyChecks: ["Filled", "Empty", "Property change", "Keyboard menu return"],
    referenceTargetId: "desktop-task-detail",
  },
  {
    id: "list-navigation",
    kind: "Component",
    title: "List navigation and index",
    summary:
      "Persistent list collection and index rows with predictable independent actions.",
    specPath: "packages/tasks/specs/components/list-navigation.md",
    fixtureState: "Tasks UI Reference private favourite list.",
    responsibilities: [
      "Separate list activation, favourite, and overflow focus targets.",
      "Support scrolling collections without hiding the active destination.",
    ],
    reuse: [
      "Sidebar",
      "ScrollArea",
      "Separator",
      "DropdownMenu",
      "ToggleGroup",
    ],
    additions: ["ContextMenu when desktop secondary actions are implemented"],
    storyChecks: [
      "Active",
      "Favourite",
      "Overflow",
      "List filters",
      "Keyboard focus",
    ],
    referenceTargetId: "desktop-lists",
  },
  {
    id: "tasks-filters-menus",
    kind: "Component",
    title: "Filters and menus",
    summary:
      "Exclusive filters and compact action menus using existing managed primitives.",
    specPath: "packages/tasks/specs/components/tasks-filters-menus.md",
    fixtureState:
      "Tasks overview ownership filter and Updates activity filter.",
    responsibilities: [
      "Keep exclusive choices in ToggleGroup and action groups in managed menus.",
      "Restore focus to a trigger after menu actions close.",
    ],
    reuse: ["ToggleGroup", "DropdownMenu", "Popover", "Command", "Dialog"],
    additions: ["None in the first slice"],
    storyChecks: [
      "Selected filter",
      "Open menu",
      "Focus return",
      "Destructive separation",
    ],
    referenceTargetId: "desktop-tasks",
  },
  {
    id: "tasks-feedback",
    kind: "Component",
    title: "Feedback and empty states",
    summary:
      "Honest loading, empty, error, and update feedback without borrowed product artwork.",
    specPath: "packages/tasks/specs/components/tasks-feedback.md",
    fixtureState: "Empty Updates plus loading rows matching task-row geometry.",
    responsibilities: [
      "Provide a clear next action in empty and error states.",
      "Keep existing usable content visible when a recoverable error occurs.",
    ],
    reuse: ["Empty", "Spinner", "Skeleton", "Alert", "Button"],
    additions: ["White-label illustration only after a separate decision"],
    storyChecks: ["Empty", "Loading", "Error retry", "Last usable result"],
    referenceTargetId: "desktop-updates",
  },
  {
    id: "tasks-motion",
    kind: "Component",
    title: "Motion and gestures",
    summary:
      "Interaction controller contracts for completion, detail open, reorder, row swipe, and pager back.",
    specPath: "packages/tasks/specs/components/tasks-motion.md",
    fixtureState: "Selected open task and mobile row action reveal.",
    responsibilities: [
      "Keep gestures functional with an accessible button/keyboard equivalent.",
      "Respect reduced motion and avoid conflicts between row and pager swipes.",
    ],
    reuse: ["Button", "Tooltip"],
    additions: ["Pointer/touch interaction controller local to Tasks"],
    storyChecks: [
      "Motion keyframes",
      "Reduced motion",
      "Velocity threshold",
      "Keyboard parity",
    ],
    referenceTargetId: "task-open-motion",
  },
] as const satisfies readonly TasksImplementationBrief[];

export function getComponentImplementationBrief(
  id: string,
): TasksImplementationBrief {
  const brief = componentImplementationBriefs.find(
    (candidate) => candidate.id === id,
  );
  if (!brief)
    throw new Error(`Unknown Tasks component implementation brief: ${id}`);
  return brief;
}

export const allImplementationBriefs = [
  ...pageImplementationBriefs,
  ...componentImplementationBriefs,
] as const satisfies readonly TasksImplementationBrief[];
