/** Realistic product-delivery fixture used by the full Column Canvas story. */

export type ShowcaseActivity = {
  id: string;
  person: string;
  action: string;
  time: string;
};

export type ShowcaseChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type ShowcaseTask = {
  id: string;
  key: string;
  title: string;
  summary: string;
  status: "Planned" | "In progress" | "In review" | "Blocked" | "Done";
  priority: "Low" | "Medium" | "High";
  assignee: string;
  due: string;
  progress: number;
  tags: string[];
  checklist: ShowcaseChecklistItem[];
  activity: ShowcaseActivity[];
};

export type ShowcaseBoard = {
  id: string;
  label: string;
  summary: string;
  tasks: ShowcaseTask[];
};

export type ShowcaseProject = {
  id: string;
  label: string;
  summary: string;
  status: "On track" | "At risk" | "Complete";
  due: string;
  boards: ShowcaseBoard[];
};

export type ShowcaseWorkspace = {
  id: string;
  label: string;
  description: string;
  projects: ShowcaseProject[];
};

export const showcaseWorkspaces: ShowcaseWorkspace[] = [
  {
    id: "lapis",
    label: "Lapis workspace",
    description: "Local-first writing, editing, and shared interface systems.",
    projects: [
      {
        id: "design-core",
        label: "Design Core",
        summary:
          "Reusable Svelte components and the canonical Storybook catalog.",
        status: "On track",
        due: "22 Aug",
        boards: [
          {
            id: "column-canvas",
            label: "Column Canvas",
            summary:
              "Responsive navigation, input arbitration, and sticky context.",
            tasks: [
              {
                id: "showcase",
                key: "DC-184",
                title: "Build the complete Column Canvas showcase",
                summary:
                  "Create a realistic multi-level example that demonstrates sticky context, closable detail lanes, collapse, resize, responsive following, and independent body scrolling in one coherent workflow.",
                status: "In progress",
                priority: "High",
                assignee: "Steve Juma",
                due: "15 Aug",
                progress: 68,
                tags: ["Svelte 5", "Storybook", "Interaction"],
                checklist: [
                  {
                    id: "data",
                    label: "Add realistic workspace data",
                    done: true,
                  },
                  {
                    id: "cascade",
                    label: "Wire the five-level cascade",
                    done: true,
                  },
                  {
                    id: "play",
                    label: "Cover close, reopen, and collapse",
                    done: false,
                  },
                  {
                    id: "visual",
                    label: "Inspect the responsive story",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Steve Juma",
                    action: "moved the task to In progress",
                    time: "9 min ago",
                  },
                  {
                    id: "a2",
                    person: "Maya Chen",
                    action: "asked for a compact-screen interaction pass",
                    time: "42 min ago",
                  },
                  {
                    id: "a3",
                    person: "Design QA",
                    action: "approved the sticky rail direction",
                    time: "Yesterday",
                  },
                  {
                    id: "a4",
                    person: "Steve Juma",
                    action: "linked the Column Canvas controller contract",
                    time: "Yesterday",
                  },
                ],
              },
              {
                id: "wheel-handoff",
                key: "DC-179",
                title: "Tune vertical wheel handoff",
                summary:
                  "Let a column body consume vertical input first, then move the horizontal canvas with a restrained continuous delta at the body boundary.",
                status: "In review",
                priority: "High",
                assignee: "Maya Chen",
                due: "13 Aug",
                progress: 90,
                tags: ["Pointer", "Chromium"],
                checklist: [
                  {
                    id: "body",
                    label: "Preserve body-scroll priority",
                    done: true,
                  },
                  {
                    id: "boundary",
                    label: "Route unused boundary motion",
                    done: true,
                  },
                  {
                    id: "browser",
                    label: "Complete the browser review",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Maya Chen",
                    action: "requested review on the wheel arbitration tests",
                    time: "18 min ago",
                  },
                  {
                    id: "a2",
                    person: "Steve Juma",
                    action: "reduced the horizontal delta scale",
                    time: "2 hours ago",
                  },
                  {
                    id: "a3",
                    person: "Browser tests",
                    action: "passed all Column Canvas scenarios",
                    time: "3 hours ago",
                  },
                ],
              },
              {
                id: "sticky-rails",
                key: "DC-172",
                title: "Replace pinned panels with floating return rails",
                summary:
                  "Keep source panels in normal flow and render gapless collapsed return rails only after their sources pass the canvas start.",
                status: "Done",
                priority: "High",
                assignee: "Steve Juma",
                due: "10 Aug",
                progress: 100,
                tags: ["Sticky", "Accessibility"],
                checklist: [
                  {
                    id: "flow",
                    label: "Keep sources in native flow",
                    done: true,
                  },
                  {
                    id: "rails",
                    label: "Add labeled return rails",
                    done: true,
                  },
                  { id: "tests", label: "Cover stack geometry", done: true },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Steve Juma",
                    action: "completed the implementation",
                    time: "Yesterday",
                  },
                  {
                    id: "a2",
                    person: "Design QA",
                    action: "verified the 44px rail geometry",
                    time: "Yesterday",
                  },
                ],
              },
              {
                id: "compact-snap",
                key: "DC-165",
                title: "Validate compact snapping at 390px",
                summary:
                  "Confirm active-column following, the full-stage phone presentation, keyboard movement, and durable-width restoration.",
                status: "Done",
                priority: "Medium",
                assignee: "Ari Patel",
                due: "8 Aug",
                progress: 100,
                tags: ["Responsive", "Mobile"],
                checklist: [
                  { id: "390", label: "Test the 390px viewport", done: true },
                  { id: "700", label: "Test the 700px viewport", done: true },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Ari Patel",
                    action: "attached compact viewport evidence",
                    time: "3 days ago",
                  },
                ],
              },
              {
                id: "docs",
                key: "DC-188",
                title: "Document consumer-owned persistence boundaries",
                summary:
                  "Explain which presentation state stays transient and which width, collapse, and close fields remain durable in the V1 layout schema.",
                status: "Planned",
                priority: "Medium",
                assignee: "Noah Williams",
                due: "19 Aug",
                progress: 20,
                tags: ["Docs", "Persistence"],
                checklist: [
                  {
                    id: "contract",
                    label: "Review the public contract",
                    done: true,
                  },
                  {
                    id: "examples",
                    label: "Add persistence examples",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Noah Williams",
                    action: "started the documentation outline",
                    time: "Today",
                  },
                ],
              },
              {
                id: "rtl",
                key: "DC-191",
                title: "Audit logical-axis behavior",
                summary:
                  "Exercise sticky offsets, resize handles, and compact alignment in a right-to-left document direction.",
                status: "Blocked",
                priority: "Low",
                assignee: "Ari Patel",
                due: "26 Aug",
                progress: 10,
                tags: ["RTL", "Internationalization"],
                checklist: [
                  {
                    id: "fixtures",
                    label: "Prepare RTL fixtures",
                    done: false,
                  },
                  {
                    id: "pointer",
                    label: "Run pointer interactions",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Ari Patel",
                    action: "flagged missing RTL fixture data",
                    time: "Today",
                  },
                ],
              },
            ],
          },
          {
            id: "workspace-shell",
            label: "Workspace shell",
            summary: "Panels, tabs, explorer state, and application chrome.",
            tasks: [
              {
                id: "empty-states",
                key: "DC-143",
                title: "Unify panel and page empty states",
                summary:
                  "Compose shared empty-state primitives without moving domain actions into Design Core.",
                status: "Done",
                priority: "Medium",
                assignee: "Noah Williams",
                due: "4 Aug",
                progress: 100,
                tags: ["Workspace", "Empty state"],
                checklist: [
                  { id: "ship", label: "Ship shared surfaces", done: true },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Noah Williams",
                    action: "published the final catalog examples",
                    time: "Last week",
                  },
                ],
              },
              {
                id: "popouts",
                key: "DC-151",
                title: "Stabilize popout surface ownership",
                summary:
                  "Keep window lifecycle in the consumer while sharing the visual surface contract.",
                status: "In progress",
                priority: "Medium",
                assignee: "Maya Chen",
                due: "21 Aug",
                progress: 55,
                tags: ["Workspace", "Popout"],
                checklist: [
                  { id: "api", label: "Agree the extension point", done: true },
                  {
                    id: "acceptance",
                    label: "Add consumer acceptance",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Maya Chen",
                    action: "updated the controller proposal",
                    time: "Today",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "lapis-notes",
        label: "Lapis Notes",
        summary: "Local-first notes shell and vault workflows.",
        status: "At risk",
        due: "5 Sep",
        boards: [
          {
            id: "application-shell",
            label: "Application shell",
            summary: "Navigation, editor workspace, settings, and startup.",
            tasks: [
              {
                id: "mobile-shell",
                key: "LN-92",
                title: "Complete the mobile workspace shell",
                summary:
                  "Compose compact navigation and the editor surface while preserving current persistence behavior.",
                status: "In progress",
                priority: "High",
                assignee: "Steve Juma",
                due: "28 Aug",
                progress: 46,
                tags: ["Mobile", "Workspace"],
                checklist: [
                  { id: "nav", label: "Wire compact navigation", done: true },
                  {
                    id: "editor",
                    label: "Validate editor lifecycle",
                    done: false,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Steve Juma",
                    action: "connected the shared workspace controller",
                    time: "Yesterday",
                  },
                ],
              },
              {
                id: "settings",
                key: "LN-97",
                title: "Move settings to shared surfaces",
                summary:
                  "Use Design Core settings composition while retaining application-owned plugin and vault state.",
                status: "Planned",
                priority: "Medium",
                assignee: "Noah Williams",
                due: "3 Sep",
                progress: 12,
                tags: ["Settings", "Architecture"],
                checklist: [
                  { id: "map", label: "Map settings ownership", done: false },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Noah Williams",
                    action: "created the settings inventory",
                    time: "2 days ago",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "mira-editor",
        label: "Mira Editor",
        summary: "Portable Markdown editing and preview packages.",
        status: "Complete",
        due: "31 Jul",
        boards: [
          {
            id: "markdown-parity",
            label: "Markdown parity",
            summary:
              "Search, preview, syntax, and portable extension behavior.",
            tasks: [
              {
                id: "search-replace",
                key: "ME-64",
                title: "Ship accessible search and replace",
                summary:
                  "Provide a portable CodeMirror search extension with complete keyboard behavior.",
                status: "Done",
                priority: "High",
                assignee: "Ari Patel",
                due: "31 Jul",
                progress: 100,
                tags: ["CodeMirror", "Accessibility"],
                checklist: [
                  {
                    id: "release",
                    label: "Publish package output",
                    done: true,
                  },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Ari Patel",
                    action: "published the verified package build",
                    time: "Last month",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "studio",
    label: "Client studio",
    description: "Delivery, research, and review work shared with clients.",
    projects: [
      {
        id: "atlas",
        label: "Atlas redesign",
        summary:
          "A calmer navigation and reporting experience for operations teams.",
        status: "On track",
        due: "12 Sep",
        boards: [
          {
            id: "research",
            label: "Research synthesis",
            summary:
              "Interview themes, workflow gaps, and opportunity mapping.",
            tasks: [
              {
                id: "findings",
                key: "AT-31",
                title: "Publish the research findings",
                summary:
                  "Turn twelve interviews into a traceable opportunity map and prioritized design principles.",
                status: "In review",
                priority: "High",
                assignee: "Maya Chen",
                due: "16 Aug",
                progress: 84,
                tags: ["Research", "Synthesis"],
                checklist: [
                  { id: "themes", label: "Validate themes", done: true },
                  { id: "review", label: "Client review", done: false },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Maya Chen",
                    action: "shared the findings deck for review",
                    time: "1 hour ago",
                  },
                ],
              },
              {
                id: "journey",
                key: "AT-34",
                title: "Map the incident-response journey",
                summary:
                  "Document handoffs from initial alert through resolution and operational review.",
                status: "Planned",
                priority: "Medium",
                assignee: "Noah Williams",
                due: "20 Aug",
                progress: 5,
                tags: ["Journey map"],
                checklist: [
                  { id: "sources", label: "Collect source notes", done: false },
                ],
                activity: [
                  {
                    id: "a1",
                    person: "Noah Williams",
                    action: "scheduled the mapping workshop",
                    time: "Today",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export function findShowcaseWorkspace(
  workspaceId: string | undefined,
): ShowcaseWorkspace | undefined {
  return showcaseWorkspaces.find((workspace) => workspace.id === workspaceId);
}

export function findShowcaseProject(
  workspaceId: string | undefined,
  projectId: string | undefined,
): ShowcaseProject | undefined {
  return findShowcaseWorkspace(workspaceId)?.projects.find(
    (project) => project.id === projectId,
  );
}

export function findShowcaseBoard(
  workspaceId: string | undefined,
  projectId: string | undefined,
  boardId: string | undefined,
): ShowcaseBoard | undefined {
  return findShowcaseProject(workspaceId, projectId)?.boards.find(
    (board) => board.id === boardId,
  );
}

export function findShowcaseTask(
  workspaceId: string | undefined,
  projectId: string | undefined,
  boardId: string | undefined,
  taskId: string | undefined,
): ShowcaseTask | undefined {
  return findShowcaseBoard(workspaceId, projectId, boardId)?.tasks.find(
    (task) => task.id === taskId,
  );
}
