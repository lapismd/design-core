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
    return { app, collection, navigationLog, copyLog };
  }

  const fixtures = {
    middle: createProblemsApp("middle"),
    stacked: createProblemsApp("stacked"),
    left: createProblemsApp("left"),
    right: createProblemsApp("right"),
    bottom: createProblemsApp("bottom"),
    group: createProblemsApp("group"),
  };

  async function dismissProblemsFilter(ownerDocument: Document) {
    await userEvent.keyboard("{Escape}");
    ownerDocument
      .querySelectorAll('[data-slot="dropdown-menu-content"]')
      .forEach((node) => node.remove());
    ownerDocument.body.style.pointerEvents = "";
    ownerDocument.body.style.overflow = "";
    ownerDocument.body.removeAttribute("data-scroll-locked");
    await waitFor(() => {
      expect(
        ownerDocument.querySelector('[role="menu"][data-state="open"]'),
      ).toBeNull();
      expect(ownerDocument.body.style.pointerEvents).not.toBe("none");
    });
  }

  async function assertProblems(canvasElement: HTMLElement, surface: string) {
    await dismissProblemsFilter(canvasElement.ownerDocument);
    const canvas = within(canvasElement);
    const panel = await canvas.findByRole("region", { name: "Problems" });
    expect(panel).toBeVisible();
    expect(
      within(panel).queryByRole("heading", { name: "Problems" }),
    ).not.toBeInTheDocument();
    const toolbar = panel.querySelector<HTMLElement>(
      '[data-ui-part="toolbar"]',
    );
    expect(toolbar).not.toBeNull();
    expect(getComputedStyle(toolbar!).justifyContent).toBe("flex-end");
    expect(panel.closest("[data-workspace-surface]")).toHaveAttribute(
      "data-workspace-surface",
      surface,
    );
    const severityFilter = canvas.getByRole("button", {
      name: "Filter problem severities",
    });
    expect(severityFilter).toBeVisible();
    expect(severityFilter.querySelector(".lucide-list-filter")).toBeVisible();
    const leafBadge = canvasElement.querySelector<HTMLElement>(
      "[data-workspace-view-badge]",
    );
    const leafLabel = leafBadge?.closest<HTMLElement>(
      '[data-ui-component="workspace-view-label"]',
    );
    expect(leafLabel).not.toBeNull();
    expect(leafLabel).toHaveAttribute(
      "data-ui-component",
      "workspace-view-label",
    );
    expect(leafBadge).toHaveTextContent("5");
    expect(getComputedStyle(leafBadge!).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    expect(
      panel.querySelector(".ui-workspace-problems__title-count"),
    ).not.toBeInTheDocument();
    expect(canvas.getByLabelText("2 problems in welcome.md")).toHaveAttribute(
      "data-ui-component",
      "badge",
    );
    const tableToggle = canvas.getByRole("button", { name: "View as Table" });
    expect(tableToggle).toBeVisible();
    expect(tableToggle.querySelector(".lucide-table-properties")).toBeVisible();
    expect(canvas.getByText("welcome.md")).toBeVisible();
    expect(
      canvas.getAllByRole("button", { name: "Quick fix" }).length,
    ).toBeGreaterThan(0);
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
          language: "tsx",
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
    const documentCanvas = within(canvasElement.ownerDocument.body);
    const quickFix = canvas.getAllByRole("button", { name: "Quick fix" })[0];
    expect(quickFix).toBeDefined();
    expect(
      quickFix.querySelector(".ui-workspace-problems__severity"),
    ).not.toBeNull();
    await userEvent.click(quickFix);
    const quickFixItem = await documentCanvas.findByRole("menuitem", {
      name: "Fix heading level",
    });
    const quickFixMenu = quickFixItem.closest<HTMLElement>('[role="menu"]');
    const panel = canvasElement.querySelector(".ui-workspace-problems");
    expect(quickFixMenu).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.contains(quickFixMenu)).toBe(false);
    expect(quickFixMenu!.scrollHeight).toBeLessThanOrEqual(
      quickFixMenu!.clientHeight + 1,
    );
    const menuRect = quickFixMenu!.getBoundingClientRect();
    const panelRect = panel!.getBoundingClientRect();
    expect(menuRect.top).toBeLessThan(panelRect.top);
    const centerX = Math.floor((menuRect.left + menuRect.right) / 2);
    const centerY = Math.floor((menuRect.top + menuRect.bottom) / 2);
    const overlay = canvasElement.ownerDocument.elementFromPoint(
      centerX,
      centerY,
    );
    expect(overlay).not.toBeNull();
    expect(panel!.contains(overlay)).toBe(false);
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        canvasElement.ownerDocument.querySelector('[role="menu"][data-state="open"]'),
      ).toBeNull(),
    );
    const groupTrigger = canvas.getByRole("button", {
      name: /welcome\.md/i,
    });
    await userEvent.pointer({ keys: "[MouseRight]", target: groupTrigger });
    await documentCanvas.findByRole("menuitem", { name: "Copy Problem" });
    await userEvent.click(
      documentCanvas.getByRole("menuitem", { name: "Copy Problem" }),
    );
    const groupCopy = fixtures.bottom.copyLog.at(-1);
    expect(JSON.parse(groupCopy ?? "[]")).toEqual([
      expect.objectContaining({
        resource: "welcome.md",
        owner: "story:markdownlint",
        message: "Bare URL should be enclosed in angle brackets",
        code: { value: "MD034" },
        severity: 8,
      }),
      expect.objectContaining({
        resource: "welcome.md",
        owner: "story:markdownlint",
        message: "Heading levels should increment by one level at a time",
        code: { value: "MD001" },
        severity: 4,
        startLineNumber: 7,
        startColumn: 1,
      }),
    ]);
    const problemRow = canvas.getByRole("button", {
      name: /Bare URL should be enclosed in angle brackets/i,
    });
    await userEvent.pointer({ keys: "[MouseRight]", target: problemRow });
    await documentCanvas.findByRole("menuitem", { name: "Copy Message" });
    await userEvent.click(
      documentCanvas.getByRole("menuitem", { name: "Copy Message" }),
    );
    expect(fixtures.bottom.copyLog.at(-1)).toBe(
      "Bare URL should be enclosed in angle brackets",
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvasElement.ownerDocument.body.style.pointerEvents).not.toBe(
        "none",
      ),
    );
    const transientResource = {
      uri: "document:///notes/transient.md",
      label: "transient.md",
    };
    fixtures.bottom.collection.set(transientResource, [
      { message: "Transient issue", severity: "warning" },
    ]);
    await waitFor(() =>
      expect(canvas.getByLabelText("Problems, 6 problems")).toBeInTheDocument(),
    );
    fixtures.bottom.collection.delete(transientResource);
    await waitFor(() =>
      expect(canvas.getByLabelText("Problems, 5 problems")).toBeInTheDocument(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "View as Table" }),
    );
    const table = canvas.getByRole("table", { name: "Problems table" });
    expect(table).toBeVisible();
    expect(
      canvasElement.querySelector(
        '[data-ui-component="scroll-area"][data-ui-part="scroll-area"][data-view-mode="table"]',
      ),
    ).toBeInTheDocument();
    const tableScope = within(table);
    expect(
      tableScope.getByRole("columnheader", { name: "Code" }),
    ).toBeVisible();
    expect(
      tableScope.getByRole("columnheader", { name: "Message" }),
    ).toBeVisible();
    expect(
      tableScope.getByRole("columnheader", { name: "File" }),
    ).toBeVisible();
    expect(
      tableScope.getByRole("columnheader", { name: "Source" }),
    ).toBeVisible();
    expect(tableScope.getByText("MD034")).toBeVisible();
    expect(tableScope.getAllByText("markdownlint").length).toBeGreaterThan(0);
    await userEvent.click(canvas.getByRole("button", { name: "View as Tree" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Filter problem severities" }),
    );
    const warningsFilter = await documentCanvas.findByRole("menuitemcheckbox", {
      name: "Warnings: 1",
    });
    const filterMenu = warningsFilter.closest<HTMLElement>('[role="menu"]');
    expect(filterMenu).not.toBeNull();
    expect(within(filterMenu!).queryByText("Severity")).not.toBeInTheDocument();
    expect(filterMenu!.scrollWidth).toBeLessThanOrEqual(
      filterMenu!.clientWidth,
    );
    const severityIconColors = new Set<string>();
    for (const label of ["Errors: 2", "Warnings: 1", "Infos: 1", "Hints: 1"]) {
      const item = documentCanvas.getByRole("menuitemcheckbox", {
        name: label,
      });
      expect(item).toBeVisible();
      const icon = item.querySelector<SVGElement>(
        '[data-ui-component="workspace-icon"]',
      );
      expect(icon).not.toBeNull();
      severityIconColors.add(getComputedStyle(icon!).color);
    }
    expect(severityIconColors.size).toBe(4);
    expect(warningsFilter).toHaveAttribute("data-state", "checked");
    await userEvent.click(warningsFilter);
    await waitFor(() =>
      expect(
        documentCanvas.queryByRole("menuitemcheckbox", {
          name: "Warnings: 1",
        }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        canvas.queryByText(
          "Heading levels should increment by one level at a time",
        ),
      ).not.toBeInTheDocument(),
    );
    await dismissProblemsFilter(canvasElement.ownerDocument);
    const searchInput = canvas.getByLabelText("Filter problems");
    await waitFor(() =>
      expect(getComputedStyle(searchInput).pointerEvents).not.toBe("none"),
    );
    await userEvent.type(searchInput, "bare URL");
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
