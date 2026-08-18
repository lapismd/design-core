const placementSetup: Record<string, string> = {
  "middle top-tabs": `layout.main = createWorkspaceTabs([problems], {
    id: "main-problems",
    presentation: "top",
  });`,
  "stacked-tabs": `layout.main = createWorkspaceTabs([problems], {
    id: "main-problems",
    presentation: "stacked",
  });`,
  "left sidebar": `layout.left = {
    open: true,
    size: 320,
    root: createWorkspaceTabs([problems], { id: "left-problems" }),
  };`,
  "right sidebar": `layout.right = {
    open: true,
    size: 320,
    root: createWorkspaceTabs([problems], { id: "right-problems" }),
  };`,
  "bottom panel": `layout.bottom = {
    open: true,
    size: 280,
    root: createWorkspaceTabs([problems], { id: "bottom-problems" }),
  };`,
  "sidebar group": `const group = {
    kind: "sidebar-group" as const,
    id: "development-panels",
    title: "Development",
    tabs: [problems],
    hiddenTabIds: [],
    collapsedByTabId: { [problems.id]: false },
    panelSizesByTabId: { [problems.id]: 100 },
  };
  layout.right = {
    open: true,
    size: 360,
    root: createWorkspaceTabs([group], { id: "right-development" }),
  };`,
};

const source = (placement: string) => `<script lang="ts">
  import { AppShell } from "@lapismd/design-core/workspace/app-shell";
  import {
    AppShellController,
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
    problemsPlugin,
    PROBLEMS_VIEW_TYPE,
  } from "@lapismd/design-core/workspace";

  const layout = createDefaultWorkspaceLayout();
  const problems = createWorkspaceTab({
    title: "Problems",
    icon: "circle-alert",
    view: { type: PROBLEMS_VIEW_TYPE },
  });

  ${placementSetup[placement]}

  // The shell persists this ordinary leaf in the ${placement} surface.
  // problemsPlugin does not seed a tab; Show Problems or the status item create one when none exists.
  const app = new AppShellController({
    layout,
    plugins: [problemsPlugin({
      // Optional: use defaultViewMode: "table" for a flat initial presentation.
      navigation: { open: ({ resource, range }) => console.log("open", resource.uri, range) },
    })],
  });

  const diagnostics = app.diagnostics.createCollection("my-plugin", {
    label: "My Plugin",
    buildItemMenu(menu, entry) {
      menu.addItem((item) => item.setTitle("Apply quick fix").onClick(() => {
        console.log("apply fix", entry);
      }));
    },
  });
  diagnostics.set(
    { uri: "document:///notes/welcome.md", label: "welcome.md" },
    [{
      message: "Heading levels should increment by one level at a time",
      severity: "warning",
      range: { start: { line: 6, character: 0 }, end: { line: 6, character: 4 } },
      source: "markdownlint",
      code: "MD001",
    }],
  );
</script>

<AppShell.Root controller={app}>
  <AppShell.Ribbon />
  <AppShell.DesktopLayout>
    <AppShell.LeftSidebar />
    <AppShell.Main><AppShell.Workspace /></AppShell.Main>
    <AppShell.RightSidebar />
    <AppShell.BottomPanel />
  </AppShell.DesktopLayout>
  <AppShell.FloatingLayer />
  <AppShell.StatusBar />
</AppShell.Root>`;

export const MiddleTopTabs = source("middle top-tabs");
export const StackedTabs = source("stacked-tabs");
export const LeftSidebar = source("left sidebar");
export const RightSidebar = source("right sidebar");
export const BottomPanel = source("bottom panel");
export const SidebarGroup = source("sidebar group");
