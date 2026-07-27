import {
  AppShellController,
  AppShellPlugin,
  Notice,
  WorkspaceView,
  createDefaultWorkspaceLayout,
  createWorkspaceSplit,
  createWorkspaceTab,
  createWorkspaceTabs,
  workspaceLayoutToJson,
  type AppShellPluginDescriptor,
  type WorkspaceLeaf,
  type WorkspaceLayoutV2,
  type WorkspaceSidebarGroup,
} from "../core/index.js";
import { fModePlugin } from "../plugins/f-mode/index.js";
import { notificationsPlugin } from "../plugins/notifications/index.js";

interface DemoViewState extends Record<string, unknown> {
  message?: string;
}

class FrameworkHomeView extends WorkspaceView<DemoViewState> {
  getViewType(): string {
    return "framework-home";
  }

  getDisplayText(): string {
    return "Framework home";
  }

  getIcon(): string {
    return "panels-top-left";
  }

  onOpen(): void {
    const view = document.createElement("section");
    const heading = document.createElement("h2");
    const description = document.createElement("p");
    view.className =
      "ui-workspace-framework-demo__view ui-workspace-framework-demo__view--home";
    heading.textContent = "Reusable application shell";
    description.textContent =
      this.getState().message ??
      "This view was registered by a statically configured plugin.";
    view.append(heading, description);
    this.containerEl.replaceChildren(view);
  }

  onClose(): void {
    this.containerEl.replaceChildren();
  }
}

class FrameworkPanelView extends WorkspaceView<DemoViewState> {
  getViewType(): string {
    return "framework-panel";
  }

  getDisplayText(): string {
    return this.leaf.title;
  }

  getIcon(): string {
    return this.leaf.icon || "panel-top";
  }

  onOpen(): void {
    const view = document.createElement("section");
    const heading = document.createElement("h3");
    const description = document.createElement("p");
    view.className =
      "ui-workspace-framework-demo__view ui-workspace-framework-demo__view--panel";
    heading.textContent = this.leaf.title;
    description.textContent =
      this.getState().message ?? "A second registered framework view.";
    view.append(heading, description);
    this.containerEl.replaceChildren(view);
  }

  onClose(): void {
    this.containerEl.replaceChildren();
  }
}

class FrameworkDemoPlugin extends AppShellPlugin {
  onload(): void {
    this.registerView(
      "framework-home",
      (leaf: WorkspaceLeaf) => new FrameworkHomeView(leaf),
      { icon: "panels-top-left", showHeader: true },
    );
    this.registerView(
      "framework-panel",
      (leaf: WorkspaceLeaf) => new FrameworkPanelView(leaf),
      { icon: "panel-top", showHeader: true },
    );
    this.addCommand({
      id: "framework-demo:split-right",
      title: "Split active view right",
      category: "Workspace",
      icon: "separator-vertical",
      hotkeys: [{ modifiers: ["Mod"], key: "\\" }],
      when: ({ leaf }) => Boolean(leaf),
      callback: () => {
        this.app.workspace.splitActiveLeaf("right", "empty");
      },
    });
    this.registerPaletteProvider({
      id: "framework-demo-actions",
      prefix: ">",
      search: () => [
        {
          id: "new-view",
          title: "Create framework view",
          subtitle: "Demo provider",
          icon: "panels-top-left",
          providerId: "framework-demo-actions",
          run: () => {
            this.app.workspace.openLeaf(
              "framework-home",
              {
                message: "Created from a command-palette provider.",
              },
              { title: "Provider view", icon: "panels-top-left" },
            );
          },
        },
      ],
    });
    this.registerSettingsSection({
      id: "framework-demo-plugin",
      title: "Framework plugin",
      description: "Settings contributed by a static plugin class.",
      icon: "puzzle",
      fields: [
        {
          id: "framework-demo.enabled",
          type: "boolean",
          title: "Plugin feature",
          default: true,
        },
        {
          id: "framework-demo.label",
          type: "string",
          title: "Demo label",
          default: "Reusable workspace",
        },
      ],
    });
    this.addRibbonItem({
      id: "framework-notice",
      label: "Show framework notice",
      icon: "bell",
      section: "top",
      onSelect: () => {
        new Notice(this.app, "Framework plugin action");
      },
    });
    this.addStatusBarItem({
      id: "framework-status",
      label: "Framework ready",
      icon: "circle-check",
      align: "right",
    });
  }
}

function tab(id: string, title: string, icon: string, description: string) {
  return createWorkspaceTab({
    id,
    title,
    icon,
    view: {
      type: id === "framework-home" ? "framework-home" : "framework-panel",
      state: { message: description },
    },
  });
}

function createLayout(includeFloating: boolean): WorkspaceLayoutV2 {
  const home = tab(
    "framework-home",
    "Framework home",
    "panels-top-left",
    "Rendered by a reusable WorkspaceView class.",
  );
  const plan = tab(
    "framework-plan",
    "Plan",
    "list-checks",
    "A second tab in the primary pane.",
  );
  const activity = tab(
    "framework-activity",
    "Activity",
    "activity",
    "A third tab demonstrating overflow-ready tab composition.",
  );
  const reference = tab(
    "framework-reference",
    "Reference",
    "book-open",
    "The top-right pane is controlled by the same workspace API.",
  );
  const details = tab(
    "framework-details",
    "Details",
    "panel-bottom",
    "The lower-right pane can be split, moved, or floated.",
  );
  const files = tab(
    "framework-files",
    "Files",
    "files",
    "Sidebar leaves use the same registered view lifecycle.",
  );
  const search = tab(
    "framework-search",
    "Search",
    "search",
    "Grouped sidebar panels can collapse and resize.",
  );
  const outline = tab(
    "framework-outline",
    "Outline",
    "list-tree",
    "Right-sidebar groups support the same reusable controls.",
  );
  const links = tab(
    "framework-links",
    "Links",
    "link",
    "Drag tabs here to exercise sidebar drop targets.",
  );
  const leftGroup: WorkspaceSidebarGroup = {
    kind: "sidebar-group",
    id: "framework-explorer-group",
    title: "Explorer",
    icon: "files",
    tabs: [files, search],
    hiddenTabIds: [],
    collapsedByTabId: { [files.id]: false, [search.id]: true },
    panelSizesByTabId: { [files.id]: 320, [search.id]: 180 },
  };
  const rightGroup: WorkspaceSidebarGroup = {
    kind: "sidebar-group",
    id: "framework-context-group",
    title: "Context",
    icon: "panel-right",
    tabs: [outline, links],
    hiddenTabIds: [],
    collapsedByTabId: { [outline.id]: false, [links.id]: false },
    panelSizesByTabId: { [outline.id]: 260, [links.id]: 260 },
  };
  const primary = createWorkspaceTabs([home, plan, activity], {
    id: "framework-primary-pane",
    activeItemId: home.id,
  });
  const layout = createDefaultWorkspaceLayout();
  layout.main = createWorkspaceSplit(
    "horizontal",
    [
      primary,
      createWorkspaceSplit(
        "vertical",
        [
          createWorkspaceTabs([reference], {
            id: "framework-reference-pane",
          }),
          createWorkspaceTabs([details], { id: "framework-details-pane" }),
        ],
        [50, 50],
      ),
    ],
    [52, 48],
  );
  layout.left = {
    open: true,
    size: 292,
    root: createWorkspaceTabs([leftGroup], {
      id: "framework-left-sidebar",
      activeItemId: leftGroup.id,
    }),
  };
  layout.right = {
    open: true,
    size: 256,
    root: createWorkspaceTabs([rightGroup], {
      id: "framework-right-sidebar",
      activeItemId: rightGroup.id,
    }),
  };
  layout.windows = includeFloating
    ? [
        {
          id: "framework-inspector-window",
          mode: "floating",
          state: "normal",
          bounds: { x: 360, y: 140, width: 360, height: 260 },
          root: createWorkspaceTabs(
            [
              tab(
                "framework-inspector",
                "Floating inspector",
                "picture-in-picture",
                "Floating windows participate in the serializable layout.",
              ),
            ],
            { id: "framework-inspector-pane" },
          ),
        },
      ]
    : [];
  layout.active = {
    hostId: "root",
    paneId: primary.id,
    tabId: home.id,
  };
  return layout;
}

export interface FrameworkDemoTracker {
  loadCount: number;
  saveCount: number;
}

export function createFrameworkDemo(
  options: {
    includeFloating?: boolean;
    includeFMode?: boolean;
    includeNotifications?: boolean;
    initialConfiguration?: Record<string, unknown>;
    mobileMode?: "always" | "never" | "auto";
  } = {},
): {
  app: AppShellController;
  tracker: FrameworkDemoTracker;
} {
  const layout = createLayout(options.includeFloating ?? true);
  const tracker: FrameworkDemoTracker = { loadCount: 0, saveCount: 0 };
  let snapshot: unknown = workspaceLayoutToJson(layout);
  const plugins: AppShellPluginDescriptor[] = [
    {
      id: "framework-demo",
      name: "Framework demo",
      description:
        "Views, commands, settings, ribbon, and status contributions.",
      icon: "puzzle",
      plugin: FrameworkDemoPlugin,
      enabled: true,
    },
  ];
  if (options.includeFMode ?? true) {
    plugins.push(fModePlugin());
  }
  if (options.includeNotifications ?? true) {
    plugins.push(notificationsPlugin());
  }
  const app = new AppShellController({
    layout,
    application: {
      name: "Workspace Shell Demo",
      version: "1.12.3",
      icon: "book-open",
      commitHash: "8dc49957a2c1",
      buildTime: "2026-07-23T11:41:00.000Z",
      copyright: "Copyright © Workspace Shell contributors.",
    },
    plugins,
    configuration: {
      values: {
        "workspace.mobile.mode": options.mobileMode ?? "never",
        "workspace.mobile.breakpointPx": 768,
        ...options.initialConfiguration,
      },
    },
    persistence: {
      layout: {
        async load() {
          tracker.loadCount += 1;
          return snapshot;
        },
        async save(next) {
          tracker.saveCount += 1;
          snapshot = next;
        },
      },
    },
  });
  app.status.addItem({
    id: "framework-plugin-manager",
    label: "Plugins",
    tooltip: "Manage demo plugin",
    icon: "puzzle",
    align: "right",
    buildMenu(menu) {
      const plugin = app.plugins.get("framework-demo");
      const enabled = plugin?.status === "enabled";
      menu.addItem((item) =>
        item
          .setTitle(
            enabled ? "Disable Framework demo" : "Enable Framework demo",
          )
          .setIcon(enabled ? "toggle-right" : "toggle-left")
          .onClick(async () => {
            const changed = enabled
              ? await app.plugins.disable("framework-demo")
              : await app.plugins.enable("framework-demo");
            if (changed) {
              app.notices.show(
                `Framework demo ${enabled ? "disabled" : "enabled"}`,
              );
            }
          }),
      );
    },
  });
  return { app, tracker };
}
