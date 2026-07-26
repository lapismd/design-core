import {
  AppShellController,
  WorkspaceView,
  createBuiltInSettingsSections,
  createDefaultWorkspaceLayout,
  createWorkspaceSplit,
  createWorkspaceTab,
  createWorkspaceTabs,
  type AppShellPluginDescriptor,
  type WorkspaceLeaf,
  type WorkspaceLayoutV2,
  type WorkspaceSettingGroup,
  type WorkspaceSettingsSection,
  type WorkspaceSidebarGroup,
  type WorkspaceTab,
  type WorkspaceWindow,
} from "../../index.js";
import { fModePlugin } from "../../plugins/f-mode/index.js";
import { notificationsPlugin } from "../../plugins/notifications/index.js";

class Cy0004EmptyView extends WorkspaceView {
  getViewType(): string {
    return "cy0004-empty";
  }

  onOpen(): void {
    const state = this.getState();
    const root = document.createElement("section");
    const body = document.createElement("div");
    const heading = document.createElement("h2");
    const actions = document.createElement("div");
    root.className = "ui-cy0004-parity__empty";
    body.className = "ui-cy0004-parity__empty-body";
    heading.textContent = String(state.heading ?? "No file is open");
    actions.className = "ui-cy0004-parity__empty-actions";
    const labels = state.fullActions
      ? [
          "Create new note (⌘ N)",
          "Got to file (⌘ O)",
          "See recent files (⌘ O)",
          "Close",
        ]
      : ["Close"];
    for (const label of labels) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      actions.append(button);
    }
    body.append(heading, actions);
    root.append(body);
    this.containerEl.replaceChildren(root);
  }

  onClose(): void {
    this.containerEl.replaceChildren();
  }
}

function tab(
  id: string,
  title: string,
  icon = "ghost",
  closable = true,
  fullActions = false,
): WorkspaceTab {
  return createWorkspaceTab({
    id,
    title,
    icon,
    closable,
    view: { type: "cy0004-empty", state: { fullActions } },
  });
}

function usesFullEmptyActions(sourceStoryId: string): boolean {
  return (
    sourceStoryId.includes("ribbon-and-status-bar") ||
    sourceStoryId.includes("full-shell") ||
    sourceStoryId.includes("reference-parity") ||
    sourceStoryId.includes("-demo-") ||
    sourceStoryId.includes("-plugins-")
  );
}

function sidebarGroup(
  scenario: string,
  side: "left" | "right",
): WorkspaceSidebarGroup {
  const fullActions = usesFullEmptyActions(scenario);
  const first = tab(
    `${side}-first`,
    side === "left" ? "Files" : "New Tab",
    side === "left" ? "folder" : "ghost",
    true,
    fullActions,
  );
  const second = tab(
    `${side}-second`,
    side === "left" ? "Search" : "New Tab",
    side === "left" ? "search" : "ghost",
    true,
    fullActions,
  );
  const fullyCollapsed = scenario.includes("fully-collapsed");
  const partiallyCollapsed =
    scenario.includes("partially-collapsed") ||
    scenario.includes("components-tabs");
  return {
    kind: "sidebar-group",
    id: `${side}-reference-group`,
    title: side === "left" ? "Explorer" : "Links",
    icon: side === "left" ? "files" : "link",
    tabs: [first, second],
    hiddenTabIds: [],
    collapsedByTabId: {
      [first.id]: fullyCollapsed,
      [second.id]: fullyCollapsed || partiallyCollapsed,
    },
    panelSizesByTabId: { [first.id]: 310, [second.id]: 190 },
  };
}

function floatingWindow(
  id: string,
  state: WorkspaceWindow["state"],
  x: number,
  y: number,
): WorkspaceWindow {
  return {
    id,
    mode: "floating",
    state,
    bounds: { x, y, width: 420, height: 300 },
    root: createWorkspaceTabs(
      [tab(`${id}-tab`, state === "normal" ? "Floating note" : "New Tab")],
      { id: `${id}-pane` },
    ),
  };
}

function cy0004MobileSettings(): WorkspaceSettingGroup {
  const field = createBuiltInSettingsSections()
    .find((section) => section.id === "workspace")
    ?.fields?.find((candidate) => candidate.id === "workspace.mobile");
  if (field?.type !== "group") {
    throw new Error("CY-0004 mobile settings are unavailable.");
  }
  return field;
}

function createCy0004SettingsSections(): WorkspaceSettingsSection[] {
  return [
    {
      id: "workspace",
      title: "Workspace",
      description: "Choose reusable workspace behaviour.",
      icon: "panels-top-left",
      order: 10,
      fields: [
        {
          type: "group",
          id: "workspace-general",
          title: "General",
          description:
            "Core workspace identity, restore behavior, and enabled surfaces.",
          fields: [
            {
              type: "string",
              id: "workspace-name",
              title: "Workspace name",
              description: "The label shown in workspace chrome.",
              default: "Lapis",
              minLength: 1,
              maxLength: 48,
            },
            {
              type: "boolean",
              id: "restore-last-session",
              title: "Restore last session",
              description:
                "Restore the most recently persisted layout when the shell starts.",
              default: true,
            },
            {
              type: "enum",
              id: "startup-surface",
              title: "Default workspace page",
              description:
                "Choose the first workspace surface shown after startup.",
              default: "editor",
              options: [
                { value: "editor", label: "Editor" },
                { value: "tabs", label: "Open tabs" },
              ],
            },
            {
              type: "multi-enum",
              id: "enabled-surfaces",
              title: "Enabled surfaces",
              description: "Choose which reusable shell regions are available.",
              default: ["left", "status"],
              options: [
                { value: "left", label: "Left sidebar" },
                { value: "right", label: "Right sidebar" },
                { value: "status", label: "Status bar" },
              ],
              minimumItems: 1,
            },
          ],
        },
        cy0004MobileSettings(),
      ],
    },
    {
      id: "editor",
      title: "Editor",
      description: "Text and editor defaults supplied by the host app.",
      icon: "file",
      order: 20,
      fields: [
        {
          type: "group",
          id: "editor-behaviour",
          title: "Behaviour",
          fields: [
            {
              type: "boolean",
              id: "spellcheck",
              title: "Spellcheck",
              description: "Use browser spellchecking in text surfaces.",
              default: true,
            },
            {
              type: "integer",
              id: "indent-size",
              title: "Indent size",
              description: "Spaces used for each indentation level.",
              default: 4,
              minimum: 1,
              maximum: 8,
            },
            {
              type: "string",
              presentation: "textarea",
              id: "new-document-template",
              title: "New document template",
              description:
                "Starter content supplied when a host creates a document.",
              default: "# Untitled\n\n",
              placeholder: "Enter starter content",
            },
          ],
        },
      ],
    },
    {
      id: "files",
      title: "Files and Links",
      description: "Generic paths, URLs, and list-valued settings.",
      icon: "folder",
      order: 30,
      fields: [
        {
          type: "group",
          id: "file-behaviour",
          title: "File behaviour",
          fields: [
            {
              type: "string",
              presentation: "url",
              id: "documentation-url",
              title: "Documentation URL",
              description:
                "A host-owned documentation destination for this workspace.",
              default: "https://example.com/docs",
            },
            {
              type: "list",
              id: "excluded-folders",
              title: "Excluded folders",
              description:
                "Folder names ignored by host-provided search and indexing.",
              itemType: "string",
              default: [".trash", "node_modules"],
              maximumItems: 8,
            },
          ],
        },
      ],
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Control shell presentation.",
      icon: "layout-grid",
      order: 40,
      fields: [
        {
          type: "group",
          id: "interface",
          title: "Interface",
          fields: [
            {
              type: "enum",
              id: "theme",
              title: "Base colour scheme",
              default: "system",
              options: [
                { value: "system", label: "Follow system" },
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
              ],
            },
            {
              type: "string",
              presentation: "color",
              id: "accent-colour",
              title: "Accent colour",
              description: "Accent used by interactive shell controls.",
              default: "#7c5cff",
            },
            {
              type: "integer",
              id: "font-size",
              title: "Interface font size",
              default: 15,
              minimum: 12,
              maximum: 22,
              step: 1,
            },
            {
              type: "number",
              id: "line-height",
              title: "Content line height",
              description: "A numeric setting without slider limits.",
              default: 1.5,
              minimum: 1,
              step: 0.1,
            },
          ],
        },
      ],
    },
    {
      id: "advanced",
      title: "Advanced",
      description:
        "Additional presentations and list types supported by the shell.",
      icon: "settings",
      order: 50,
      fields: [
        {
          type: "group",
          id: "host-integration",
          title: "Host integration",
          fields: [
            {
              type: "string",
              presentation: "email",
              id: "notification-email",
              title: "Notification email",
              description:
                "An email input that the host may use for notifications.",
              default: "team@example.com",
            },
            {
              type: "list",
              id: "retry-delays",
              title: "Retry delays",
              description: "Numeric list values in seconds.",
              itemType: "number",
              default: [0.5, 1, 2],
            },
            {
              type: "list",
              id: "enabled-experiments",
              title: "Enabled experiments",
              description: "Boolean list values managed by the host.",
              itemType: "boolean",
              default: [true, false],
            },
            {
              type: "list",
              id: "history-limits",
              title: "History limits",
              description: "Integer list values.",
              itemType: "integer",
              default: [10, 25, 50],
            },
            {
              type: "boolean",
              id: "legacy-layout",
              title: "Legacy layout compatibility",
              description: "Disabled controls remain visible in the schema.",
              deprecated: "Deprecated: new applications should use layout V2.",
              default: false,
              disabled: true,
            },
            {
              type: "action",
              id: "clear-layout-cache",
              title: "Layout cache",
              description:
                "Actions call a consumer handler and do not persist a value.",
              label: "Clear layout cache",
              icon: "rotate-ccw",
              variant: "outline",
              run: () => undefined,
            },
          ],
        },
      ],
    },
  ];
}

function createCy0004Layout(sourceStoryId: string): WorkspaceLayoutV2 {
  const layout = createDefaultWorkspaceLayout();
  const fullActions = usesFullEmptyActions(sourceStoryId);
  const constrained = sourceStoryId.includes("tabs--constrained");
  const single = sourceStoryId.includes("tabs--single");
  const stacked = sourceStoryId.includes("tabs--stacked");
  const emptySidebars = sourceStoryId.includes("empty-sidebars");
  const mainTabs = constrained
    ? Array.from({ length: 12 }, (_, index) =>
        tab(
          `overflow-${index}`,
          `Long workspace tab ${index + 1}.md`,
          "file-text",
          true,
          fullActions,
        ),
      )
    : single
      ? [tab("home", "Home.md", "file-text", false, fullActions)]
      : [
          tab("home", "Home.md", "file-text", false, fullActions),
          tab("plan", "Plan.md", "file-text", true, fullActions),
          tab("today", "Today.md", "file-text", true, fullActions),
        ];
  const primary = createWorkspaceTabs(mainTabs, {
    id: "primary-pane",
    activeItemId: sourceStoryId.includes("components-tabs--top")
      ? "today"
      : mainTabs[0]?.id,
    presentation: stacked ? "stacked" : "top",
  });
  const reference = createWorkspaceTabs(
    [tab("reference", "Reference.md", "file-text", true, fullActions)],
    { id: "reference-pane" },
  );
  const notes = createWorkspaceTabs(
    [tab("notes", "Notes.md", "file-text", true, fullActions)],
    {
      id: "notes-pane",
    },
  );
  layout.main = createWorkspaceSplit(
    "horizontal",
    [primary, createWorkspaceSplit("vertical", [reference, notes], [52, 48])],
    [62, 38],
  );
  const leftGroup = sidebarGroup(sourceStoryId, "left");
  const rightGroup = sidebarGroup(sourceStoryId, "right");
  const referenceFrame = sourceStoryId.includes("reference-parity");
  const rightItems = referenceFrame
    ? [rightGroup]
    : [
        tab("outline", "Outline", "list-tree", false, fullActions),
        tab("backlinks", "Backlinks", "network", false, fullActions),
      ];
  const rightSidebarOpen =
    sourceStoryId.includes("sidebar-groups") ||
    sourceStoryId.includes("empty-sidebars") ||
    sourceStoryId.includes("full-shell") ||
    referenceFrame;
  layout.left = {
    open: true,
    size: 304,
    root: createWorkspaceTabs(emptySidebars ? [] : [leftGroup], {
      id: "left-sidebar",
      activeItemId: emptySidebars ? undefined : leftGroup.id,
    }),
  };
  layout.right = {
    open: rightSidebarOpen,
    size: referenceFrame ? 256 : 270,
    root: createWorkspaceTabs(emptySidebars ? [] : rightItems, {
      id: "right-sidebar",
      activeItemId: emptySidebars ? undefined : rightItems[0]?.id,
    }),
  };
  layout.windows = sourceStoryId.includes("floating-windows--maximized")
    ? [floatingWindow("window-maximized", "maximized", 0, 0)]
    : sourceStoryId.includes("floating-windows--states")
      ? [
          floatingWindow("window-normal", "normal", 340, 88),
          floatingWindow("window-collapsed", "collapsed", 210, 430),
          floatingWindow("window-minimized", "minimized", 0, 0),
        ]
      : [];
  const activeWindow = layout.windows.at(-1);
  const activeWindowTabs =
    activeWindow?.root.kind === "tabs" ? activeWindow.root : null;
  layout.active = {
    hostId: activeWindow?.id ?? "root",
    paneId: activeWindowTabs?.id ?? primary.id,
    tabId: activeWindowTabs?.items[0]?.id ?? mainTabs[0]?.id,
  };
  return layout;
}

export function createCy0004App(sourceStoryId: string): AppShellController {
  const declarativeSettings = sourceStoryId.includes(
    "components-declarative-settings",
  );
  const hasApplicationChrome =
    sourceStoryId.includes("components-public-framework") ||
    sourceStoryId.includes("ribbon-and-status-bar") ||
    sourceStoryId.includes("-demo-") ||
    sourceStoryId.includes("-plugins-") ||
    sourceStoryId.includes("reference-parity") ||
    sourceStoryId.includes("shell-full-shell");
  const hasWorkspaceStatus =
    !hasApplicationChrome &&
    !sourceStoryId.includes("composable-settings") &&
    !sourceStoryId.includes("drag-and-drop-overlays");
  const plugins: AppShellPluginDescriptor[] = [];
  if (sourceStoryId.includes("plugins-f-mode")) plugins.push(fModePlugin());
  if (sourceStoryId.includes("plugins-notifications")) {
    plugins.push(notificationsPlugin({ showToasts: true, showStatus: true }));
  }
  const app = new AppShellController({
    layout: createCy0004Layout(sourceStoryId),
    application: hasApplicationChrome
      ? {
          name: "Lapis Notes",
          version: "1.12.3",
          icon: "book-open",
          buildTime: "2026-07-23T11:41:00.000Z",
          commitHash: "db08f86a25a1",
          copyright: "Copyright © Lapis Notes contributors.",
        }
      : undefined,
    views: [
      {
        type: "cy0004-empty",
        factory: (leaf: WorkspaceLeaf) => new Cy0004EmptyView(leaf),
        options: { icon: "ghost", showHeader: false },
      },
    ],
    builtInSettings: !declarativeSettings,
    plugins,
    configuration: {
      sections: declarativeSettings
        ? createCy0004SettingsSections()
        : undefined,
      navigationGroups: declarativeSettings
        ? [{ id: "options", title: "Options", order: 10 }]
        : undefined,
      values: {
        "workspace.mobile.mode": sourceStoryId.includes(
          "shell-full-shell--mobile",
        )
          ? "always"
          : "never",
      },
    },
  });
  const desktopChrome = sourceStoryId.includes("shell-full-shell--desktop");
  app.ribbon.addItem({
    id: "app-shell:open-command-palette",
    label: "Open command palette",
    icon: desktopChrome ? "terminal" : "files",
    active: !desktopChrome,
    priority: -1000,
    onSelect: () => app.commands.openPalette(),
  });
  app.ribbon.addItem({
    id: "cy-search",
    label: "Search",
    icon: desktopChrome ? "panels-top-left" : "search",
    onSelect: () => undefined,
  });
  app.ribbon.addItem({
    id: "cy-graph",
    label: "Graph",
    icon: desktopChrome ? "history" : "network",
    onSelect: () => undefined,
  });
  app.ribbon.addItem({
    id: "cy-history",
    label: "History",
    icon: desktopChrome ? "check-square" : "history",
    onSelect: () => undefined,
  });
  app.ribbon.addItem({
    id: "cy-right-sidebar",
    side: "right",
    label: "Toggle right sidebar",
    icon: "panel-right",
    onSelect: () => undefined,
  });
  if (hasWorkspaceStatus) {
    app.status.addItem({
      id: "word-count",
      align: "right",
      segments: ["5 words", "43 characters"],
      tooltip: "Word count",
    });
  }
  return app;
}
