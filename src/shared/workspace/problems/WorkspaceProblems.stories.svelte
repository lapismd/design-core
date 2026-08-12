<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { AppShell } from "../app-shell/index.js";
  import { AppShellController } from "../core/app-shell-controller.svelte.js";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type {
    WorkspaceLayout,
    WorkspaceSidebarGroup,
  } from "../core/types.js";
  import WorkspaceProblems from "./WorkspaceProblems.svelte";
  import { PROBLEMS_VIEW_TYPE, problemsPlugin } from "./problems-plugin.js";
  import * as exampleSources from "./WorkspaceProblems.example-sources.js";
  import "./WorkspaceProblems.stories.css";

  type Placement = "middle" | "stacked" | "left" | "right" | "bottom" | "group";

  function problemsTab(id: string) {
    return createWorkspaceTab({
      id,
      title: "Problems",
      icon: "circle-alert",
      view: { type: PROBLEMS_VIEW_TYPE },
    });
  }

  function contentTab(id: string, title = "Document") {
    return createWorkspaceTab({
      id,
      title,
      icon: "file",
      view: { type: "empty" },
    });
  }

  function buildLayout(placement: Placement): WorkspaceLayout {
    const layout = createDefaultWorkspaceLayout();
    const problems = problemsTab(`problems-${placement}`);
    const content = contentTab(`content-${placement}`);
    layout.main = createWorkspaceTabs([content], {
      id: `main-${placement}`,
      activeItemId: content.id,
    });
    layout.active = {
      hostId: "root",
      paneId: layout.main.id,
      tabId: content.id,
    };
    if (placement === "middle" || placement === "stacked") {
      layout.main = createWorkspaceTabs([problems, content], {
        id: `main-${placement}`,
        activeItemId: problems.id,
        presentation: placement === "stacked" ? "stacked" : "top",
      });
      layout.active = {
        hostId: "root",
        paneId: layout.main.id,
        tabId: problems.id,
      };
    } else if (placement === "left") {
      layout.left = {
        open: true,
        size: 340,
        root: createWorkspaceTabs([problems], { id: "left-problems" }),
      };
    } else if (placement === "right") {
      layout.right = {
        open: true,
        size: 340,
        root: createWorkspaceTabs([problems], { id: "right-problems" }),
      };
    } else if (placement === "bottom") {
      layout.bottom = {
        open: true,
        size: 300,
        root: createWorkspaceTabs([problems], { id: "bottom-problems" }),
      };
    } else {
      const companion = contentTab("group-companion", "Output");
      const group: WorkspaceSidebarGroup = {
        kind: "sidebar-group",
        id: "problems-group",
        title: "Development",
        icon: "panel-right",
        tabs: [problems, companion],
        hiddenTabIds: [],
        collapsedByTabId: { [problems.id]: false, [companion.id]: false },
        panelSizesByTabId: { [problems.id]: 66, [companion.id]: 34 },
      };
      layout.right = {
        open: true,
        size: 380,
        root: createWorkspaceTabs([group], {
          id: "right-problems-group",
          activeItemId: group.id,
        }),
      };
    }
    return layout;
  }

  function createProblemsApp(placement: Placement) {
    const navigationLog: string[] = [];
    const copyLog: string[] = [];
    const app = new AppShellController({
      layout: buildLayout(placement),
      plugins: [
        problemsPlugin({
          navigation: {
            open(location) {
              navigationLog.push(location.resource.uri);
            },
          },
          clipboard: {
            writeText(_label, value) {
              copyLog.push(value);
            },
          },
        }),
      ],
    });
    const collection = app.diagnostics.createCollection("story:markdownlint", {
      label: "Markdownlint",
      buildItemMenu(menu) {
        menu.addItem((item) => item.setTitle("Fix heading level"));
      },
    });
    collection.set([
      [
        {
          uri: "document:///notes/welcome.md",
          label: "welcome.md",
          detail: "notes",
          icon: "file-text",
        },
        [
          {
            message: "Heading levels should increment by one level at a time",
            severity: "warning",
            range: {
              start: { line: 6, character: 0 },
              end: { line: 6, character: 4 },
            },
            source: "markdownlint",
            code: "MD001",
            relatedInformation: [
              {
                resource: {
                  uri: "document:///notes/style-guide.md",
                  label: "style-guide.md",
                },
                range: {
                  start: { line: 2, character: 0 },
                  end: { line: 2, character: 8 },
                },
                message: "Heading convention is documented here",
              },
            ],
          },
          {
            message: "Bare URL should be enclosed in angle brackets",
            severity: "error",
            range: {
              start: { line: 12, character: 0 },
              end: { line: 12, character: 19 },
            },
            source: "markdownlint",
            code: "MD034",
          },
        ],
      ],
      [
        { uri: "document:///notes/archive.md", label: "archive.md" },
        [
          {
            message: "Deprecated configuration key",
            severity: "information",
            tags: ["deprecated"],
            source: "configuration",
          },
          { message: "Consider a shorter title", severity: "hint" },
        ],
      ],
      [
        null,
        [
          {
            message: "Extension host failed to restore one contribution",
            severity: "error",
            source: "App Shell",
            code: "extension-restore",
          },
        ],
      ],
    ]);
    return { app, navigationLog, copyLog };
  }

  const fixtures = {
    middle: createProblemsApp("middle"),
    stacked: createProblemsApp("stacked"),
    left: createProblemsApp("left"),
    right: createProblemsApp("right"),
    bottom: createProblemsApp("bottom"),
    group: createProblemsApp("group"),
  };

  async function assertProblems(canvasElement: HTMLElement, surface: string) {
    const canvas = within(canvasElement);
    const panel = await canvas.findByRole("region", { name: "Problems" });
    expect(panel).toBeVisible();
    expect(panel.closest("[data-workspace-surface]")).toHaveAttribute(
      "data-workspace-surface",
      surface,
    );
    expect(canvas.getByLabelText("Errors: 2")).toBeVisible();
    expect(canvas.getByText("welcome.md")).toBeVisible();
  }

  const { Story } = defineMeta({
    title: "Workspace/Panels/Problems",
    component: WorkspaceProblems,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Application-independent diagnostics panel backed by owner-isolated collections and host navigation adapters.",
        },
        source: {
          code: exampleSources.BottomPanel,
          language: "svelte",
          type: "code",
        },
      },
    },
    tags: ["visual-pending"],
  });
</script>

{#snippet Shell(app: AppShellController)}
  <div class="ui-workspace-problems-story-frame">
    <AppShell.Root controller={app} theme="inherit">
      <AppShell.Ribbon />
      <AppShell.DesktopLayout>
        <AppShell.LeftSidebar />
        <AppShell.Main><AppShell.Workspace /></AppShell.Main>
        <AppShell.RightSidebar />
        <AppShell.BottomPanel />
      </AppShell.DesktopLayout>
      <AppShell.FloatingLayer />
      <AppShell.StatusBar />
    </AppShell.Root>
  </div>
{/snippet}

<Story
  name="Middle (Top Tabs)"
  parameters={{ docs: { source: { code: exampleSources.MiddleTopTabs } } }}
  play={async ({ canvasElement }) => assertProblems(canvasElement, "body")}
>
  {#snippet template()}{@render Shell(fixtures.middle.app)}{/snippet}
</Story>

<Story
  name="Stacked Tabs"
  parameters={{ docs: { source: { code: exampleSources.StackedTabs } } }}
  play={async ({ canvasElement }) => assertProblems(canvasElement, "body")}
>
  {#snippet template()}{@render Shell(fixtures.stacked.app)}{/snippet}
</Story>

<Story
  name="Left Sidebar"
  parameters={{ docs: { source: { code: exampleSources.LeftSidebar } } }}
  play={async ({ canvasElement }) =>
    assertProblems(canvasElement, "left-sidebar")}
>
  {#snippet template()}{@render Shell(fixtures.left.app)}{/snippet}
</Story>

<Story
  name="Right Sidebar"
  parameters={{ docs: { source: { code: exampleSources.RightSidebar } } }}
  play={async ({ canvasElement }) =>
    assertProblems(canvasElement, "right-sidebar")}
>
  {#snippet template()}{@render Shell(fixtures.right.app)}{/snippet}
</Story>

<Story
  name="Bottom Panel"
  parameters={{ docs: { source: { code: exampleSources.BottomPanel } } }}
  play={async ({ canvasElement }) => {
    await assertProblems(canvasElement, "bottom-panel");
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText("Warnings: 1"));
    await waitFor(() =>
      expect(
        canvas.queryByText(
          "Heading levels should increment by one level at a time",
        ),
      ).not.toBeInTheDocument(),
    );
    await userEvent.type(canvas.getByLabelText("Filter problems"), "bare URL");
    await expect(
      canvas.getByText("Bare URL should be enclosed in angle brackets"),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByText("Bare URL should be enclosed in angle brackets"),
    );
    expect(fixtures.bottom.navigationLog).toContain(
      "document:///notes/welcome.md",
    );
  }}
>
  {#snippet template()}{@render Shell(fixtures.bottom.app)}{/snippet}
</Story>

<Story
  name="Sidebar As a Group"
  parameters={{ docs: { source: { code: exampleSources.SidebarGroup } } }}
  play={async ({ canvasElement }) => {
    await assertProblems(canvasElement, "right-sidebar");
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /workspace/i }));
    await expect(
      canvas.queryByText(/Extension host failed/u),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}{@render Shell(fixtures.group.app)}{/snippet}
</Story>
