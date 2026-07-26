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
  heading?: string;
  description?: string;
}

class FrameworkDemoView extends WorkspaceView<DemoViewState> {
  getViewType(): string {
    return "framework-demo";
  }

  onOpen(): void {
    const state = this.getState();
    const view = document.createElement("section");
    const heading = document.createElement("h2");
    const description = document.createElement("p");
    view.className = "ui-workspace-framework-demo__view";
    heading.textContent = state.heading ?? this.getDisplayText();
    description.textContent =
      state.description ?? "Rendered by a registered WorkspaceView.";
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
      "framework-demo",
      (leaf: WorkspaceLeaf) => new FrameworkDemoView(leaf),
      { icon: "panels-top-left", showHeader: true },
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
              "framework-demo",
              {
                heading: "Provider view",
                description: "Created by an application palette provider.",
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
      id: "framework-demo-notice",
      label: "Show framework notice",
      icon: "bell",
      section: "top",
      onSelect: () => {
        new Notice(this.app, "Framework plugin action");
      },
    });
    this.addStatusBarItem({
      id: "framework-demo-ready",
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
      type: "framework-demo",
      state: { heading: title, description },
    },
  });
}

function createLayout(includeFloating: boolean): WorkspaceLayoutV2 {
  const home = tab(
    "framework-home",
    "Framework home",
    "panels-top-left",
    "Rendered by a reusable WorkspaceView registered from a static plugin.",
  );
  const plan = tab(
    "framework-plan",
    "Plan",
    "list-checks",
    "Tabs, splits, drag targets, and persistence share one controller.",
  );
  const activity = tab(
    "framework-activity",
    "Activity",
    "activity",
    "The primary pane remains overflow-ready at constrained widths.",
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
    "The lower-right pane can be split, moved, floated, or redocked.",
  );
  const files = tab(
    "framework-files",
    "Files",
    "files",
    "Sidebar leaves use the registered view lifecycle.",
  );
  const search = tab(
    "framework-search",
    "Search",
    "search",
    "Grouped sidebar panels collapse and resize.",
  );
  const outline = tab(
    "framework-outline",
    "Outline",
    "list-tree",
    "Right-sidebar groups expose top and bottom drop targets.",
  );
  const links = tab(
    "framework-links",
    "Links",
    "link",
    "Groups can be collapsed, grouped, and ungrouped.",
  );
  const leftGroup: WorkspaceSidebarGroup = {
    kind: "sidebar-group",
    id: "framework-left-group",
    title: "Explorer",
    icon: "files",
    tabs: [files, search],
    hiddenTabIds: [],
    collapsedByTabId: { [files.id]: false, [search.id]: true },
    panelSizesByTabId: { [files.id]: 70, [search.id]: 30 },
  };
  const rightGroup: WorkspaceSidebarGroup = {
    kind: "sidebar-group",
    id: "framework-right-group",
    title: "Context",
    icon: "panel-right",
    tabs: [outline, links],
    hiddenTabIds: [],
    collapsedByTabId: { [outline.id]: false, [links.id]: false },
    panelSizesByTabId: { [outline.id]: 50, [links.id]: 50 },
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
    [55, 45],
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
    size: 272,
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
    fModePlugin(),
    notificationsPlugin(),
  ];
  const app = new AppShellController({
    layout,
    application: {
      name: "Workspace Shell Demo",
      version: "1.12.3",
      icon: "panels-top-left",
      commitHash: "a371198e495d9e4e",
      buildTime: "2026-07-26T10:30:00.000Z",
    },
    plugins,
    configuration: {
      values: {
        "workspace.mobile.mode": options.mobileMode ?? "never",
        "workspace.mobile.breakpointPx": 768,
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
    id: "framework-demo-plugins",
    label: "Plugins",
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
