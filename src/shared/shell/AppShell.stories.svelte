<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import AppShellBodyDemo from "./examples/AppShellBodyDemo.svelte";
  import AppShellCompleteDemo from "./examples/AppShellCompleteDemo.svelte";
  import AppShellConversationDemo from "./examples/AppShellConversationDemo.svelte";
  import AppShellFilesSidebarDemo from "./examples/AppShellFilesSidebarDemo.svelte";
  import AppShellMarkdownDocumentDemo from "./examples/AppShellMarkdownDocumentDemo.svelte";
  import AppShellMarkdownFilesDemo from "./examples/AppShellMarkdownFilesDemo.svelte";
  import AppShellModeSwitchDemo from "./examples/AppShellModeSwitchDemo.svelte";
  import AppShellProjectSidebarDemo from "./examples/AppShellProjectSidebarDemo.svelte";
  import AppShellSidebarDemo from "./examples/AppShellSidebarDemo.svelte";
  import AppShellToolbarDemo from "./examples/AppShellToolbarDemo.svelte";
  import { AppShellController } from "./app-shell-controller.svelte.js";
  import { AppShell, AppShellRoot } from "./index.js";
  import "./AppShell.stories.css";

  const { Story } = defineMeta({
    title: "Shell/App Shell",
    component: AppShellRoot,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A bounded structural shell with independently controlled collapsible, closeable, resizable, and persistable sidebars. Applications own navigation, content, and persistence adapter selection.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const expandedController = new AppShellController();
  const interactiveController = new AppShellController();
  const minimalController = new AppShellController();
  const nestedController = new AppShellController({ leftClosed: true });
  const documentController = new AppShellController();
  const completeController = new AppShellController({
    leftWidth: 220,
    rightWidth: 240,
  });
  const completeTabletController = new AppShellController({
    leftCollapsed: true,
    rightClosed: true,
    leftWidth: 268,
    rightWidth: 312,
  });
  const completeMobileController = new AppShellController({
    leftCollapsed: true,
    rightClosed: true,
    leftWidth: 280,
    rightWidth: 320,
  });
  const modeSwitchController = new AppShellController({
    leftWidth: 224,
    rightWidth: 256,
  });
  const constrainedDesktopController = new AppShellController({
    leftWidth: 220,
    rightWidth: 240,
  });
  const projectSidebarController = nestedController.createSidebar(
    "projects",
    "left",
  );
  const completeProjectSidebarController = completeController.createSidebar(
    "projects",
    "left",
    { width: 220 },
  );
  const completeTabletProjectSidebarController =
    completeTabletController.createSidebar("projects", "left", {
      collapsed: true,
      width: 248,
    });
  const completeMobileProjectSidebarController =
    completeMobileController.createSidebar("projects", "left", {
      closed: true,
      width: 252,
    });
  const modeSwitchProjectSidebarController = modeSwitchController.createSidebar(
    "projects",
    "left",
    { width: 224 },
  );
  const constrainedDesktopProjectSidebarController =
    constrainedDesktopController.createSidebar("projects", "left", {
      width: 220,
    });
  let nestedSelectedProject = $state("");
  let selectedMarkdownFile = $state("");
  let bodySidebarSide = $state<"left" | "right" | undefined>();

  function selectNestedProject(projectId: string): void {
    nestedSelectedProject = projectId;
    if (projectId) {
      nestedController.left.expand();
    } else {
      nestedController.left.close();
    }
  }

  function openMarkdownFile(file: string): void {
    selectedMarkdownFile = file;
    bodySidebarSide = "left";
  }

  function toggleBodySidebar(side: "left" | "right"): void {
    if (!selectedMarkdownFile) selectedMarkdownFile = "README.md";
    bodySidebarSide = bodySidebarSide === side ? undefined : side;
  }
</script>

<Story
  name="Two expanded sidebars"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    expandedController.left.expand();
    expandedController.right.expand();
    expandedController.left.resetWidth();
    expandedController.right.resetWidth();

    const leftSidebar = canvas.getByLabelText("Left sidebar");
    const rightSidebar = canvas.getByLabelText("Right sidebar");
    const mainBody = canvas.getByRole("main", { name: "Workspace content" });
    const toolbar = canvas.getByRole("banner", { name: "Main toolbar" });
    const root = leftSidebar.closest("[data-shell-root]");
    const mainSurface = mainBody.closest('[data-ui-part="main"]');
    const rightHeader = rightSidebar.querySelector(
      '[data-ui-part="sidebar-header"]',
    );
    const leftHeaderIcon = leftSidebar.querySelector(
      '[data-ui-part="sidebar-header"] svg',
    );
    const toolbarIcon = toolbar.querySelector("button svg");
    const leftSidebarScrollArea = leftSidebar.querySelector(
      '[data-ui-part="sidebar-body"] > [data-ui-part="scroll-area"]',
    );
    const rightSidebarScrollArea = rightSidebar.querySelector(
      '[data-ui-part="sidebar-body"] > [data-ui-part="scroll-area"]',
    );
    const leftSidebarViewport = leftSidebarScrollArea?.querySelector(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const rightSidebarViewport = rightSidebarScrollArea?.querySelector(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const bodyViewport = mainBody.querySelector(
      '[data-ui-part="scroll-area-viewport"]',
    );

    await expect(leftSidebar).toHaveAttribute("data-state", "expanded");
    await expect(rightSidebar).toHaveAttribute("data-state", "expanded");
    await expect(mainBody).toBeVisible();
    await expect(mainBody).toHaveStyle("overflow: hidden");
    await expect(
      mainBody.querySelector('[data-ui-component="scroll-area"]'),
    ).toBeInTheDocument();
    await expect(
      leftSidebar.querySelector('[data-ui-part="sidebar-header"]'),
    ).toBeInTheDocument();
    await expect(
      leftSidebar.querySelector('[data-ui-part="sidebar-body"]'),
    ).toBeInTheDocument();
    await expect(
      leftSidebar.querySelector('[data-ui-part="sidebar-footer"]'),
    ).toBeInTheDocument();
    await expect(
      leftSidebar.querySelector('[data-ui-component="scroll-area"]'),
    ).toBeInTheDocument();
    await expect(leftSidebarScrollArea).toBeInTheDocument();
    await expect(rightSidebarScrollArea).toBeInTheDocument();
    await expect(leftSidebarViewport).toBeInTheDocument();
    await expect(rightSidebarViewport).toBeInTheDocument();
    await expect(getComputedStyle(leftSidebarViewport!).overflowY).toBe(
      "scroll",
    );
    await expect(getComputedStyle(rightSidebarViewport!).overflowY).toBe(
      "scroll",
    );
    await expect(root).toBeInTheDocument();
    await expect(mainSurface).toBeInTheDocument();
    await expect(rightHeader).toBeInTheDocument();
    await expect(leftHeaderIcon).toBeInTheDocument();
    await expect(toolbarIcon).toBeInTheDocument();
    await expect(bodyViewport).toBeInTheDocument();
    await expect(bodyViewport!.scrollHeight).toBeGreaterThan(
      bodyViewport!.clientHeight,
    );
    await expect(leftSidebarViewport!.scrollHeight).toBeGreaterThan(
      leftSidebarViewport!.clientHeight,
    );
    await expect(mainBody.scrollHeight).toBe(mainBody.clientHeight);

    const rootRect = root!.getBoundingClientRect();
    const mainRect = mainSurface!.getBoundingClientRect();
    const rightRect = rightSidebar.getBoundingClientRect();
    const toolbarRect = toolbar.getBoundingClientRect();
    const rightHeaderRect = rightHeader!.getBoundingClientRect();
    await expect(mainRect.top).toBeGreaterThan(rootRect.top);
    await expect(mainRect.bottom).toBeLessThan(rootRect.bottom);
    await expect(rightRect.left - mainRect.right).toBeGreaterThanOrEqual(7.5);
    await expect(Math.abs(rightRect.top - rootRect.top)).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(rightRect.bottom - rootRect.bottom),
    ).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(toolbarRect.bottom - rightHeaderRect.bottom),
    ).toBeLessThanOrEqual(0.25);
    const leftHeaderIconRect = leftHeaderIcon!.getBoundingClientRect();
    const toolbarIconRect = toolbarIcon!.getBoundingClientRect();
    await expect(
      Math.abs(
        (leftHeaderIconRect.top + leftHeaderIconRect.bottom) / 2 -
          (toolbarIconRect.top + toolbarIconRect.bottom) / 2,
      ),
    ).toBeLessThanOrEqual(0.25);
    await expect(getComputedStyle(mainSurface!).borderRadius).toBe("14px");
    await expect(getComputedStyle(mainSurface!).boxShadow).not.toBe("none");

    await expect(
      canvas.getByRole("button", { name: "CV library" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("combobox", { name: "Message" }),
    ).toBeVisible();
    await expect(
      canvas.getByText("Review the changed files first."),
    ).toBeVisible();
    const rightClose = canvas.getByRole("button", {
      name: "Close right sidebar",
    });
    await expect(rightClose).toBeVisible();
    await expect(
      rightHeaderRect.right - rightClose.getBoundingClientRect().right,
    ).toBeLessThanOrEqual(17);

    const leftResizeHandle = canvas.getByRole("slider", {
      name: "Resize left sidebar",
    });
    const rightResizeHandle = canvas.getByRole("slider", {
      name: "Resize right sidebar",
    });
    await expect(leftResizeHandle).toHaveAttribute("aria-valuemin", "220");
    await expect(leftResizeHandle).toHaveAttribute("aria-valuemax", "520");
    await expect(rightResizeHandle).toHaveAttribute("aria-valuemin", "220");
    await expect(rightResizeHandle).toHaveAttribute("aria-valuemax", "520");

    const leftWidthBefore = leftSidebar.getBoundingClientRect().width;
    const rightWidthBefore = rightSidebar.getBoundingClientRect().width;
    const leftResizeRect = leftResizeHandle.getBoundingClientRect();
    const resizeStart = {
      clientX: (leftResizeRect.left + leftResizeRect.right) / 2,
      clientY: (leftResizeRect.top + leftResizeRect.bottom) / 2,
    };
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: leftResizeHandle,
        coords: resizeStart,
      },
      {
        coords: {
          clientX: resizeStart.clientX + 24,
          clientY: resizeStart.clientY,
        },
      },
      "[/MouseLeft]",
    ]);
    await expect(Math.round(leftSidebar.getBoundingClientRect().width)).toBe(
      Math.round(leftWidthBefore) + 24,
    );
    await expect(rightSidebar.getBoundingClientRect().width).toBe(
      rightWidthBefore,
    );
    await expect(leftSidebar).not.toHaveAttribute("data-resizing");
    await expect(document.body.style.cursor).toBe("");
    await expect(document.body.style.userSelect).toBe("");

    rightResizeHandle.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(rightResizeHandle).toHaveFocus();
    await expect(rightSidebar.getBoundingClientRect().width).toBe(
      rightWidthBefore + 16,
    );

    expandedController.left.resetWidth();
    expandedController.right.resetWidth();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });

    const mainWidthBeforeClose = mainSurface!.getBoundingClientRect().width;
    const reclaimedSidebarWidth = rightSidebar.getBoundingClientRect().width;
    const rightToggle = canvas.getByRole("button", {
      name: "Collapse right sidebar",
    });
    await userEvent.click(rightClose);
    await waitFor(() =>
      expect(canvas.queryByLabelText("Right sidebar")).not.toBeInTheDocument(),
    );
    await expect(rightToggle).toHaveAttribute(
      "aria-label",
      "Open right sidebar",
    );
    const closedMainRect = mainSurface!.getBoundingClientRect();
    const closedRootRect = root!.getBoundingClientRect();
    const closedTrailingInset = closedRootRect.right - closedMainRect.right;
    const closedBottomInset = closedRootRect.bottom - closedMainRect.bottom;
    await expect(
      Math.abs(closedTrailingInset - closedBottomInset),
    ).toBeLessThanOrEqual(0.5);
    await expect(Math.round(closedMainRect.width)).toBeGreaterThanOrEqual(
      Math.round(
        mainWidthBeforeClose + reclaimedSidebarWidth - closedTrailingInset,
      ) - 1,
    );

    await userEvent.click(rightToggle);
    await expect(rightToggle).toHaveFocus();
    const reopenedRightSidebar = canvas.getByLabelText("Right sidebar");
    await expect(reopenedRightSidebar).toHaveAttribute(
      "data-state",
      "expanded",
    );
    await expect(
      canvas.getByRole("button", { name: "Close right sidebar" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={expandedController}
        displayMode="desktop"
        desktopMinMainWidth={0}
        class="ui-shell-story-surface"
      >
        <AppShell.Sidebar side="left">
          <AppShellSidebarDemo controller={expandedController} side="left" />
        </AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Toolbar>
            <AppShellToolbarDemo />
          </AppShell.Toolbar>
          <AppShell.Body label="Workspace content">
            <AppShellBodyDemo />
          </AppShell.Body>
        </AppShell.Main>
        <AppShell.Sidebar side="right" closeable>
          <AppShellConversationDemo controller={expandedController} />
        </AppShell.Sidebar>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Nested project and file sidebars"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    nestedSelectedProject = "";
    projectSidebarController.expand();
    projectSidebarController.resetWidth();
    nestedController.left.close();
    nestedController.left.resetWidth();
    nestedController.right.expand();
    nestedController.right.resetWidth();

    const root = canvas
      .getByRole("main", { name: "Workspace content" })
      .closest("[data-shell-root]");
    const mainSurface = root?.querySelector<HTMLElement>(
      '[data-ui-part="main"]',
    );
    const projectsSidebar = canvas.getByLabelText("Projects sidebar");

    await expect(root).toBeInTheDocument();
    await expect(mainSurface).toBeInTheDocument();
    await expect(projectsSidebar).toHaveAttribute("data-variant", "outer");
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    const expandedProjectHeader = projectsSidebar.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-header"]',
    );
    await expect(expandedProjectHeader).toBeInTheDocument();
    await expect(
      getComputedStyle(expandedProjectHeader!).borderBlockEndWidth,
    ).toBe("0px");
    await expect(
      canvas.queryByLabelText("Files sidebar"),
    ).not.toBeInTheDocument();
    const mainToolbar = canvas.getByRole("banner", { name: "Main toolbar" });
    const filesToggle = canvas.getByRole("button", {
      name: "Open files sidebar",
    });
    await expect(filesToggle.closest('[data-ui-part="toolbar"]')).toBe(
      mainToolbar,
    );

    const projectSelector = canvas.getByRole("combobox", {
      name: "Project selector",
    });
    await userEvent.click(projectSelector);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Lapis Notes" }),
    );
    await userEvent.keyboard("{Escape}");
    await expect(
      within(document.body).queryByRole("listbox", {
        name: "Project options",
      }),
    ).not.toBeInTheDocument();

    const filesSidebar = canvas.getByLabelText("Files sidebar");
    await expect(filesSidebar).toHaveAttribute("data-state", "expanded");
    await expect(
      canvas.getByRole("navigation", { name: "Lapis Notes files" }),
    ).toBeVisible();
    await expect(projectSelector).toHaveTextContent("Lapis Notes");

    const cardGrid = canvas
      .getByText("Active CVs")
      .closest(".ui-shell-story-card-grid");
    const firstCard = canvas.getByText("Active CVs").closest("section");
    await expect(cardGrid).toBeInTheDocument();
    await expect(firstCard).toBeInTheDocument();
    await expect(
      getComputedStyle(cardGrid!).gridTemplateColumns.split(" "),
    ).toHaveLength(1);
    await expect(getComputedStyle(firstCard!).display).toBe("grid");

    const aiLayout = canvas.getByLabelText("Complete AI conversation");
    const aiViewport = aiLayout.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    await expect(aiViewport).toBeInTheDocument();
    await expect(getComputedStyle(aiViewport!).overflowY).toBe("scroll");
    await expect(aiViewport!.scrollHeight).toBeGreaterThan(
      aiViewport!.clientHeight,
    );
    const aiMessageArea = aiLayout.querySelector<HTMLElement>(
      '[data-ui-part="message-area"]',
    );
    await expect(aiMessageArea).toBeInTheDocument();
    await expect(
      Number.parseFloat(getComputedStyle(aiMessageArea!).paddingBlockEnd),
    ).toBeGreaterThanOrEqual(112);
    const typingIndicator = aiLayout.querySelector<HTMLElement>(
      '[data-ui-component="ai-chat-typing-indicator"]',
    );
    await expect(typingIndicator).toBeInTheDocument();
    await expect(getComputedStyle(typingIndicator!).backgroundColor).toBe(
      getComputedStyle(aiLayout).backgroundColor,
    );
    await expect(getComputedStyle(typingIndicator!.parentElement!).rowGap).toBe(
      "0px",
    );

    await expect(filesToggle).toHaveAttribute(
      "aria-label",
      "Collapse files sidebar",
    );
    const filesHeader = filesSidebar.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-header"]',
    );
    await expect(filesHeader).toBeInTheDocument();
    await expect(getComputedStyle(filesHeader!).borderBlockEndWidth).toBe(
      "1px",
    );
    const projectToggle = canvas.getByRole("button", {
      name: "Collapse projects sidebar",
    });
    const firstFileIcon = canvas
      .getByRole("button", { name: "Source folder" })
      .querySelector("svg");
    await expect(firstFileIcon).toBeInTheDocument();
    const expandedProjectToggleRect = projectToggle.getBoundingClientRect();
    const expandedFirstFileIconRect = firstFileIcon!.getBoundingClientRect();
    await userEvent.click(filesToggle);
    await expect(filesToggle).toHaveFocus();
    await expect(filesSidebar).toHaveAttribute("data-state", "collapsed");
    const filesFooter = filesSidebar.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-footer"]',
    );
    await expect(filesFooter).toBeInTheDocument();
    await expect(getComputedStyle(filesHeader!).borderBlockEndWidth).toBe(
      "0px",
    );
    await expect(getComputedStyle(filesFooter!).borderBlockStartWidth).toBe(
      "0px",
    );
    const projectToggleRect = projectToggle.getBoundingClientRect();
    const firstFileIconRect = firstFileIcon!.getBoundingClientRect();
    const bodyToggleRect = filesToggle.getBoundingClientRect();
    await expect(
      Math.abs(
        expandedProjectToggleRect.left +
          expandedProjectToggleRect.width / 2 -
          (projectToggleRect.left + projectToggleRect.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(
        expandedFirstFileIconRect.left +
          expandedFirstFileIconRect.width / 2 -
          (firstFileIconRect.left + firstFileIconRect.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(
        projectToggleRect.left +
          projectToggleRect.width / 2 -
          (firstFileIconRect.left + firstFileIconRect.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      Math.abs(
        projectToggleRect.top +
          projectToggleRect.height / 2 -
          (bodyToggleRect.top + bodyToggleRect.height / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand files sidebar" }),
    );
    await expect(filesSidebar).toHaveAttribute("data-state", "expanded");
    await expect(getComputedStyle(filesHeader!).borderBlockEndWidth).toBe(
      "1px",
    );
    await expect(projectToggle.closest('[data-ui-part="sidebar-header"]')).toBe(
      filesSidebar.querySelector('[data-ui-part="sidebar-header"]'),
    );

    const indicator = projectToggle.querySelector(
      '[data-ui-part="sidebar-toggle-indicator"]',
    );
    const toggleIcon = projectToggle.querySelector(
      '[data-ui-part="sidebar-toggle-icon"]',
    );
    await expect(indicator).toBeInTheDocument();
    await expect(toggleIcon).toBeInTheDocument();
    await expect(projectToggle).toHaveAttribute("data-size", "icon-sm");
    await expect(projectToggle.getBoundingClientRect().width).toBe(32);
    await expect(toggleIcon!.getBoundingClientRect().width).toBe(16);
    await expect(getComputedStyle(projectToggle).backgroundColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(
      getComputedStyle(projectToggle)
        .getPropertyValue("--ui-shell-sidebar-toggle-indicator-width")
        .trim(),
    ).toBe("24%");
    await expect(indicator!.getBoundingClientRect().width).toBeGreaterThan(3.5);

    const firstProjectIcon = canvas
      .getByRole("button", { name: "CV Studio" })
      .querySelector("svg");
    await expect(firstProjectIcon).toBeInTheDocument();
    const expandedFirstProjectIconRect =
      firstProjectIcon!.getBoundingClientRect();
    await userEvent.click(projectToggle);
    await expect(projectToggle).toHaveFocus();
    await expect(projectsSidebar).toHaveAttribute("data-state", "collapsed");
    await expect(filesSidebar).toHaveAttribute("data-state", "expanded");
    const collapsedFirstProjectIconRect =
      firstProjectIcon!.getBoundingClientRect();
    await expect(
      Math.abs(
        expandedFirstProjectIconRect.left +
          expandedFirstProjectIconRect.width / 2 -
          (collapsedFirstProjectIconRect.left +
            collapsedFirstProjectIconRect.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    const collapsedProjectHeader = projectsSidebar.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-header"]',
    );
    const collapsedProjectFooter = projectsSidebar.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-footer"]',
    );
    await expect(collapsedProjectHeader).toBeInTheDocument();
    await expect(collapsedProjectFooter).toBeInTheDocument();
    const collapsedProjectClose = canvas.getByRole("button", {
      name: "Close left sidebar",
    });
    const collapsedProjectCloseRect =
      collapsedProjectClose.getBoundingClientRect();
    const currentBodyToggleRect = filesToggle.getBoundingClientRect();
    await expect(
      Math.abs(
        collapsedProjectCloseRect.top +
          collapsedProjectCloseRect.height / 2 -
          (currentBodyToggleRect.top + currentBodyToggleRect.height / 2),
      ),
    ).toBeLessThanOrEqual(1);
    await expect(
      getComputedStyle(collapsedProjectHeader!).borderBlockEndWidth,
    ).toBe("0px");
    await expect(
      getComputedStyle(collapsedProjectFooter!).borderBlockStartWidth,
    ).toBe("0px");

    const filesLeftBeforePreview = filesSidebar.getBoundingClientRect().left;
    const mainWidthBeforePreview = mainSurface!.getBoundingClientRect().width;
    const collapsedEdgeTrigger = canvas.getByRole("button", {
      name: "Preview projects sidebar",
    });
    await userEvent.hover(collapsedEdgeTrigger);
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await expect(projectsSidebar).toHaveAttribute("data-state", "collapsed");
    await expect(
      canvas.getByRole("combobox", { name: "Project selector" }),
    ).toBeVisible();
    await expect(
      root!.querySelector('[data-ui-part="sidebar-placeholder"]'),
    ).toBeInTheDocument();
    await expect(filesSidebar.getBoundingClientRect().left).toBeCloseTo(
      filesLeftBeforePreview,
      0,
    );
    await expect(mainSurface!.getBoundingClientRect().width).toBeCloseTo(
      mainWidthBeforePreview,
      0,
    );
    await userEvent.hover(projectsSidebar);
    await userEvent.unhover(projectsSidebar);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "inline",
    );

    await userEvent.hover(projectToggle);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 100);
    });
    await userEvent.unhover(projectToggle);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 260);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(projectsSidebar).not.toHaveAttribute("data-previewed");

    await userEvent.hover(projectToggle);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 620);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await expect(projectsSidebar).toHaveAttribute("data-state", "collapsed");
    await expect(projectsSidebar).toHaveAttribute("data-previewed", "true");
    await expect(
      root!.querySelector('[data-ui-part="sidebar-placeholder"]'),
    ).toBeInTheDocument();
    await expect(filesSidebar.getBoundingClientRect().left).toBeCloseTo(
      filesLeftBeforePreview,
      0,
    );
    await expect(mainSurface!.getBoundingClientRect().width).toBeCloseTo(
      mainWidthBeforePreview,
      0,
    );
    await expect(
      canvas.getByRole("combobox", { name: "Project selector" }),
    ).toBeVisible();
    await expect(
      getComputedStyle(collapsedProjectHeader!).borderBlockEndWidth,
    ).toBe("0px");
    await expect(
      getComputedStyle(collapsedProjectFooter!).borderBlockStartWidth,
    ).toBe("1px");
    const popupProjectSelector = canvas.getByRole("combobox", {
      name: "Project selector",
    });
    await userEvent.click(popupProjectSelector);
    const popupProjectOption = within(document.body).getByRole("option", {
      name: "UI Catalog",
    });
    await userEvent.hover(popupProjectOption);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await userEvent.click(popupProjectOption);
    await expect(popupProjectSelector).toHaveTextContent("UI Catalog");
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    projectSidebarController.schedulePreviewDismiss(0);
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "inline",
    );

    const expandProjects = canvas.getByRole("button", {
      name: "Expand projects sidebar",
    });
    expandProjects.focus();
    await userEvent.keyboard("{Enter}");
    await expect(projectsSidebar).toHaveAttribute("data-state", "expanded");

    const rootRect = root!.getBoundingClientRect();
    const projectsWidth = projectsSidebar.getBoundingClientRect().width;
    const mainWidthBeforeClose = mainSurface!.getBoundingClientRect().width;
    const closeProjects = canvas.getByRole("button", {
      name: "Close left sidebar",
    });
    await expect(root).not.toHaveAttribute("data-desktop-overlay-panels");
    closeProjects.focus();
    await userEvent.keyboard("{Enter}");
    await expect(projectSidebarController.closed).toBe(true);
    await waitFor(() =>
      expect(
        canvas.queryByLabelText("Projects sidebar"),
      ).not.toBeInTheDocument(),
    );
    await expect(
      Math.abs(filesSidebar.getBoundingClientRect().left - rootRect.left),
    ).toBeLessThanOrEqual(1.25);
    await expect(mainSurface!.getBoundingClientRect().width).toBeGreaterThan(
      mainWidthBeforeClose + projectsWidth - 2,
    );
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={nestedController}
        displayMode="desktop"
        desktopMinMainWidth={0}
        class="ui-shell-story-surface"
      >
        <AppShell.Sidebar
          side="left"
          sidebarController={projectSidebarController}
          label="Projects sidebar"
          variant="outer"
          closeable
          revealOnEdgeHover
          edgeRevealLabel="Preview projects sidebar"
        >
          <AppShellProjectSidebarDemo
            sidebar={projectSidebarController}
            selectedProject={nestedSelectedProject}
            onSelectProject={selectNestedProject}
          />
        </AppShell.Sidebar>

        <AppShell.Sidebar side="left" label="Files sidebar">
          <AppShellFilesSidebarDemo
            controller={nestedController}
            projectSidebar={projectSidebarController}
            selectedProject={nestedSelectedProject}
          />
        </AppShell.Sidebar>

        <AppShell.Main>
          <AppShell.Toolbar>
            <AppShellToolbarDemo leftSidebarName="files" />
          </AppShell.Toolbar>
          <AppShell.Body label="Workspace content">
            <AppShellBodyDemo />
          </AppShell.Body>
        </AppShell.Main>

        <AppShell.Sidebar side="right" closeable>
          <AppShellConversationDemo controller={nestedController} />
        </AppShell.Sidebar>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Complete shell composition"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "Full nested shell topology on a wide desktop frame, then the same composition under constrained desktop overlays (right → projects → files). Overlay toggles open full-height previews without changing durable sidebar state. Rests constrained.",
      },
    },
  }}
  play={async ({ canvas }) => {
    completeProjectSidebarController.expand();
    completeProjectSidebarController.setWidth(220);
    completeController.left.expand();
    completeController.left.setWidth(220);
    completeController.right.expand();
    completeController.right.setWidth(240);

    const mainBody = canvas.getByRole("main", {
      name: "Markdown document",
    });
    const root = mainBody.closest<HTMLElement>("[data-shell-root]")!;
    const frame = root.closest<HTMLElement>(".ui-shell-story-frame")!;
    const mainToolbar = canvas.getByRole("banner", {
      name: "Main toolbar",
    });

    frame.style.width = "1400px";
    frame.style.maxWidth = "none";
    await waitFor(() =>
      expect(root).not.toHaveAttribute("data-desktop-constrained"),
    );

    const projectsSidebar = canvas.getByLabelText("Projects sidebar");
    const filesSidebar = canvas.getByLabelText("Files sidebar");
    const aiSidebar = canvas.getByLabelText("AI sidebar");
    let bodySidebar = canvas.getByRole("complementary", {
      name: "Table of contents",
    });

    await expect(projectsSidebar).toHaveAttribute("data-state", "expanded");
    await expect(projectsSidebar).toHaveAttribute("data-variant", "outer");
    await expect(filesSidebar).toHaveAttribute("data-state", "expanded");
    await expect(aiSidebar).toHaveAttribute("data-state", "expanded");
    await expect(bodySidebar).toHaveAttribute("data-side", "right");
    await expect(mainBody).toHaveAttribute("data-layout", "regions");
    await expect(
      canvas.getByRole("region", { name: "README.md content" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("combobox", { name: "Project selector" }),
    ).toHaveTextContent("Lapis Notes");

    const projectToggle = canvas.getByRole("button", {
      name: "Collapse projects sidebar",
    });
    const filesToggle = canvas.getByRole("button", {
      name: "Collapse files sidebar",
    });
    const rightToggle = canvas.getByRole("button", {
      name: "Collapse right sidebar",
    });
    await expect(projectToggle.closest('[data-ui-part="sidebar-header"]')).toBe(
      filesSidebar.querySelector('[data-ui-part="sidebar-header"]'),
    );
    await expect(filesToggle.closest('[data-ui-part="toolbar"]')).toBe(
      mainToolbar,
    );
    await expect(rightToggle.closest('[data-ui-part="toolbar"]')).toBe(
      mainToolbar,
    );

    for (const sidebar of [projectsSidebar, filesSidebar, aiSidebar]) {
      await expect(
        sidebar.querySelector(
          '[data-ui-part="sidebar-body"] [data-ui-component="scroll-area"]',
        ),
      ).toBeInTheDocument();
    }
    await expect(
      mainBody.querySelector(
        '[data-ui-part="body-content"] [data-ui-component="scroll-area"]',
      ),
    ).toBeInTheDocument();
    await expect(
      bodySidebar.querySelector('[data-ui-component="scroll-area"]'),
    ).toBeInTheDocument();

    const projectResize = canvas.getByRole("slider", {
      name: "Resize projects sidebar",
    });
    const filesResize = canvas.getByRole("slider", {
      name: "Resize files sidebar",
    });
    const aiResize = canvas.getByRole("slider", {
      name: "Resize AI sidebar",
    });
    await expect(projectResize).toHaveAttribute("aria-valuenow", "220");
    await expect(filesResize).toHaveAttribute("aria-valuenow", "220");
    await expect(aiResize).toHaveAttribute("aria-valuenow", "240");
    filesResize.focus();
    await userEvent.keyboard("{ArrowRight}");
    await expect(filesResize).toHaveFocus();
    await expect(filesResize).toHaveAttribute("aria-valuenow", "236");
    await userEvent.keyboard("{ArrowLeft}");
    await expect(filesResize).toHaveAttribute("aria-valuenow", "220");

    await userEvent.click(projectToggle);
    await expect(projectToggle).toHaveFocus();
    await expect(projectsSidebar).toHaveAttribute("data-state", "collapsed");
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand projects sidebar" }),
    );
    await expect(projectsSidebar).toHaveAttribute("data-state", "expanded");

    await userEvent.click(filesToggle);
    await expect(filesToggle).toHaveFocus();
    await expect(filesSidebar).toHaveAttribute("data-state", "collapsed");
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand files sidebar" }),
    );
    await expect(filesSidebar).toHaveAttribute("data-state", "expanded");

    await userEvent.click(rightToggle);
    await expect(rightToggle).toHaveFocus();
    await expect(aiSidebar).toHaveAttribute("data-state", "collapsed");
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand right sidebar" }),
    );
    await expect(aiSidebar).toHaveAttribute("data-state", "expanded");

    await userEvent.click(
      canvas.getByRole("button", {
        name: "Show table of contents on left",
      }),
    );
    bodySidebar = canvas.getByRole("complementary", {
      name: "Table of contents",
    });
    await expect(bodySidebar).toHaveAttribute("data-side", "left");
    await userEvent.click(
      canvas.getByRole("button", {
        name: "Show table of contents on right",
      }),
    );
    bodySidebar = canvas.getByRole("complementary", {
      name: "Table of contents",
    });
    await expect(bodySidebar).toHaveAttribute("data-side", "right");

    await userEvent.click(
      canvas.getByRole("button", { name: "Close left sidebar" }),
    );
    await expect(
      canvas.queryByLabelText("Projects sidebar"),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Preview projects sidebar" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open projects sidebar" }),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).toHaveAttribute(
      "data-state",
      "expanded",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Close right sidebar" }),
    );
    await expect(canvas.queryByLabelText("AI sidebar")).not.toBeInTheDocument();
    const openRight = canvas.getByRole("button", {
      name: "Open right sidebar",
    });
    await userEvent.click(openRight);
    await expect(openRight).toHaveFocus();
    await expect(canvas.getByLabelText("AI sidebar")).toHaveAttribute(
      "data-state",
      "expanded",
    );

    const architectureFile = canvas.getByRole("button", {
      name: "Open architecture.md",
    });
    await userEvent.click(architectureFile);
    await expect(architectureFile).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("region", { name: "architecture.md content" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open README.md" }),
    );
    await expect(
      canvas.getByRole("region", { name: "README.md content" }),
    ).toBeVisible();

    completeProjectSidebarController.expand();
    completeProjectSidebarController.setWidth(220);
    completeController.left.expand();
    completeController.left.setWidth(220);
    completeController.right.expand();
    completeController.right.setWidth(240);

    await userEvent.click(
      canvas.getByRole("button", {
        name: "Hide table of contents on right",
      }),
    );
    await expect(
      canvas.queryByRole("complementary", { name: "Table of contents" }),
    ).not.toBeInTheDocument();

    frame.style.width = "62rem";
    frame.style.maxWidth = "62rem";
    await waitFor(() =>
      expect(root).toHaveAttribute("data-desktop-constrained", "true"),
    );
    await expect(canvas.getByLabelText("Files sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(canvas.getByLabelText("Projects sidebar")).not.toBeVisible();
    await expect(canvas.getByLabelText("AI sidebar")).not.toBeVisible();

    const constrainedRightToggle = canvas.getByRole("button", {
      name: "Open right sidebar",
    });
    await userEvent.click(constrainedRightToggle);
    const constrainedAiSidebar = canvas.getByLabelText("AI sidebar");
    await expect(constrainedAiSidebar).toHaveAttribute(
      "data-desktop-overlay-preview",
      "",
    );
    await expect(completeController.right.state).toBe("expanded");
    await userEvent.click(
      within(constrainedAiSidebar).getByRole("button", {
        name: "Close right sidebar",
      }),
    );
    await expect(canvas.getByLabelText("AI sidebar")).not.toBeVisible();

    const constrainedProjectsToggle = canvas.getByRole("button", {
      name: "Open projects sidebar",
    });
    await userEvent.click(constrainedProjectsToggle);
    const constrainedProjectsSidebar = canvas.getByLabelText("Projects sidebar");
    await expect(constrainedProjectsSidebar).toHaveAttribute(
      "data-desktop-overlay-preview",
      "",
    );
    await expect(completeProjectSidebarController.state).toBe("expanded");
    await userEvent.click(
      within(constrainedProjectsSidebar).getByRole("button", {
        name: "Close left sidebar",
      }),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).not.toBeVisible();
  }}
>
  {#snippet template()}
    <AppShellCompleteDemo
      controller={completeController}
      projectSidebar={completeProjectSidebarController}
      displayMode="desktop"
    />
  {/snippet}
</Story>

<Story
  name="Automatic tablet composition"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const root = canvas.getByRole("group", {
      name: "Mobile application shell",
    }).parentElement;
    const frame = root!.closest<HTMLElement>(".ui-shell-story-frame")!;
    await waitFor(() =>
      expect(root).toHaveAttribute("data-display-mode", "mobile"),
    );
    await expect(root!.getBoundingClientRect().width).toBeLessThan(1024);
    await expect(
      canvas.queryByRole("slider", { name: "Resize files sidebar" }),
    ).not.toBeInTheDocument();

    frame.style.width = "1100px";
    frame.style.maxWidth = "none";
    await waitFor(() =>
      expect(root).toHaveAttribute("data-display-mode", "desktop"),
    );
    await expect(root).toHaveAttribute("data-left-sidebar-state", "collapsed");
    await expect(root).toHaveAttribute("data-right-sidebar-state", "closed");
    await expect(canvas.getByLabelText("Files sidebar")).toHaveAttribute(
      "data-state",
      "collapsed",
    );
    await expect(
      canvas.queryByRole("slider", { name: "Resize files sidebar" }),
    ).not.toBeInTheDocument();

    frame.style.width = "800px";
    await waitFor(() =>
      expect(root).toHaveAttribute("data-display-mode", "mobile"),
    );

    const filesToggle = canvas.getByRole("button", {
      name: "Open files sidebar",
    });
    await userEvent.click(filesToggle);
    await expect(root).toHaveAttribute("data-mobile-stage", "left");
    await expect(canvas.getByLabelText("Files sidebar")).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await expect(root).toHaveAttribute("data-mobile-stage", "main");
    await expect(filesToggle).toHaveFocus();
    await expect(completeTabletProjectSidebarController.state).toBe(
      "collapsed",
    );
    await expect(completeTabletController.left.state).toBe("collapsed");
    await expect(completeTabletController.right.state).toBe("closed");
    await expect(completeTabletProjectSidebarController.width).toBe(248);
    await expect(completeTabletController.left.width).toBe(268);
    await expect(completeTabletController.right.width).toBe(312);
  }}
>
  {#snippet template()}
    <AppShellCompleteDemo
      controller={completeTabletController}
      projectSidebar={completeTabletProjectSidebarController}
      frameClass="ui-shell-story-frame-tablet"
    />
  {/snippet}
</Story>

<Story
  name="Mobile edge panels"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const mobileGroup = canvas.getByRole("group", {
      name: "Mobile application shell",
    });
    const root = mobileGroup.parentElement!;
    const mainLane = root.querySelector('[data-ui-part="mobile-main-lane"]');
    const leftLane = root.querySelector(
      '[data-ui-part="mobile-lane"][data-side="left"]',
    );
    const rightLane = root.querySelector(
      '[data-ui-part="mobile-lane"][data-side="right"]',
    );

    await expect(root).toHaveAttribute("data-display-mode", "mobile");
    await expect(root).toHaveAttribute("data-mobile-stage", "main");
    await expect(mainLane).not.toHaveAttribute("inert");
    await expect(leftLane).toHaveAttribute("inert");
    await expect(rightLane).toHaveAttribute("inert");
    await expect(
      canvas.queryByRole("slider", { name: /Resize/ }),
    ).not.toBeInTheDocument();

    const filesToggle = canvas.getByRole("button", {
      name: "Open files sidebar",
    });
    await userEvent.click(filesToggle);
    await expect(root).toHaveAttribute("data-mobile-stage", "left");
    await expect(leftLane).not.toHaveAttribute("inert");
    await expect(mainLane).toHaveAttribute("inert");

    const filesSidebar = canvas.getByLabelText("Files sidebar");
    const projectsSidebar = canvas.getByLabelText("Projects sidebar");
    await expect(filesSidebar).toHaveAttribute(
      "data-mobile-panel-active",
      "true",
    );
    await expect(filesSidebar).toHaveFocus();
    await expect(projectsSidebar).toHaveAttribute("aria-hidden", "true");

    const leftSelector = canvas.getByRole("button", {
      name: "Choose left sidebar panel",
    });
    await expect(leftSelector).toHaveTextContent("Files");
    await userEvent.click(leftSelector);
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Projects" }),
    );
    await expect(projectsSidebar).toHaveAttribute(
      "data-mobile-panel-active",
      "true",
    );
    await expect(filesSidebar).toHaveAttribute("aria-hidden", "true");

    const closeProjects = within(projectsSidebar).getByRole("button", {
      name: "Close left sidebar",
    });
    await waitFor(() =>
      expect(getComputedStyle(closeProjects).pointerEvents).toBe("auto"),
    );
    await userEvent.click(closeProjects);
    await expect(root).toHaveAttribute("data-mobile-stage", "main");
    await expect(filesToggle).toHaveFocus();

    const rightToggle = canvas.getByRole("button", {
      name: "Open right sidebar",
    });
    await userEvent.click(rightToggle);
    await expect(root).toHaveAttribute("data-mobile-stage", "right");
    const aiSidebar = canvas.getByLabelText("AI sidebar");
    await expect(aiSidebar).toHaveAttribute("data-mobile-panel-active", "true");
    await expect(aiSidebar).toHaveFocus();

    const rightSelector = canvas.getByRole("button", {
      name: "Choose right sidebar panel",
    });
    await expect(rightSelector).toHaveTextContent("AI conversation");
    await userEvent.click(rightSelector);
    await userEvent.click(
      within(document.body).getByRole("option", {
        name: "Document contents",
      }),
    );
    await expect(
      canvas.getByRole("complementary", { name: "Table of contents" }),
    ).toHaveAttribute("data-mobile-panel-active", "true");
    await expect(aiSidebar).toHaveAttribute("aria-hidden", "true");

    await userEvent.keyboard("{Escape}");
    await expect(root).toHaveAttribute("data-mobile-stage", "main");
    await expect(rightToggle).toHaveFocus();

    await expect(completeMobileProjectSidebarController.state).toBe("closed");
    await expect(completeMobileController.left.state).toBe("collapsed");
    await expect(completeMobileController.right.state).toBe("closed");
    await expect(completeMobileProjectSidebarController.width).toBe(252);
    await expect(completeMobileController.left.width).toBe(280);
    await expect(completeMobileController.right.width).toBe(320);
  }}
>
  {#snippet template()}
    <AppShellCompleteDemo
      controller={completeMobileController}
      projectSidebar={completeMobileProjectSidebarController}
      displayMode="mobile"
      frameClass="ui-shell-story-frame-mobile"
    />
  {/snippet}
</Story>

<Story
  name="Programmatic display modes"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const root = canvas
      .getByRole("main", {
        name: "Markdown document",
      })
      .closest<HTMLElement>("[data-shell-root]")!;

    await userEvent.click(canvas.getByRole("button", { name: "desktop" }));
    await expect(root).toHaveAttribute("data-display-mode", "desktop");
    await expect(
      canvas.getByRole("button", { name: "desktop" }),
    ).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(canvas.getByRole("button", { name: "mobile" }));
    await expect(root).toHaveAttribute("data-display-mode", "mobile");
    await expect(
      canvas.queryByRole("slider", { name: "Resize files sidebar" }),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole("button", { name: "auto" }));
    await expect(canvas.getByRole("button", { name: "auto" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await waitFor(() =>
      expect(root).toHaveAttribute(
        "data-display-mode",
        root.getBoundingClientRect().width < 1024 ? "mobile" : "desktop",
      ),
    );
  }}
>
  {#snippet template()}
    <AppShellModeSwitchDemo
      controller={modeSwitchController}
      projectSidebar={modeSwitchProjectSidebarController}
    />
  {/snippet}
</Story>

<Story
  name="Constrained desktop overlays"
  tags={["visual-pending"]}
  parameters={{
    docs: {
      description: {
        story:
          "When the desktop root cannot protect the min main width, lower-priority rails leave inline flow (right → named outer-left → left). Toggles open full-height overlay previews without mutating durable state. At 62rem, Files may remain inline; Projects and AI overlay.",
      },
    },
  }}
  play={async ({ canvas }) => {
    constrainedDesktopProjectSidebarController.expand();
    constrainedDesktopProjectSidebarController.setWidth(220);
    constrainedDesktopController.left.expand();
    constrainedDesktopController.left.setWidth(220);
    constrainedDesktopController.right.expand();
    constrainedDesktopController.right.setWidth(240);

    const root = canvas
      .getByRole("main", {
        name: "Markdown document",
      })
      .closest<HTMLElement>("[data-shell-root]")!;
    const frame = root.closest<HTMLElement>(".ui-shell-story-frame")!;
    const main = root.querySelector<HTMLElement>('[data-ui-part="main"]')!;

    await waitFor(() =>
      expect(root).toHaveAttribute("data-desktop-constrained", "true"),
    );
    await expect(root).toHaveAttribute("data-display-mode", "desktop");
    await expect(main.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      576,
    );
    await expect(canvas.getByLabelText("Files sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(canvas.getByLabelText("Projects sidebar")).not.toBeVisible();
    await expect(canvas.getByLabelText("AI sidebar")).not.toBeVisible();
    await expect(
      canvas.queryByRole("complementary", { name: "Table of contents" }),
    ).not.toBeInTheDocument();

    const rightToggle = canvas.getByRole("button", {
      name: "Open right sidebar",
    });
    await userEvent.click(rightToggle);
    const aiSidebar = canvas.getByLabelText("AI sidebar");
    await expect(aiSidebar).toHaveAttribute("data-desktop-overlay-preview", "");
    await expect(aiSidebar).toHaveAttribute("data-state", "expanded");
    await userEvent.click(
      within(aiSidebar).getByRole("button", {
        name: "Close right sidebar",
      }),
    );
    await expect(canvas.getByLabelText("AI sidebar")).not.toBeVisible();
    await expect(constrainedDesktopController.right.state).toBe("expanded");

    const projectsToggle = canvas.getByRole("button", {
      name: "Open projects sidebar",
    });
    await userEvent.click(projectsToggle);
    const projectsSidebar = canvas.getByLabelText("Projects sidebar");
    await expect(projectsSidebar).toHaveAttribute(
      "data-desktop-overlay-preview",
      "",
    );
    await userEvent.click(
      within(projectsSidebar).getByRole("button", {
        name: "Close left sidebar",
      }),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).not.toBeVisible();
    await expect(constrainedDesktopProjectSidebarController.state).toBe(
      "expanded",
    );

    frame.style.width = "1400px";
    frame.style.maxWidth = "none";
    await waitFor(() =>
      expect(root).not.toHaveAttribute("data-desktop-constrained"),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(canvas.getByLabelText("AI sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(constrainedDesktopController.left.width).toBe(220);
    await expect(constrainedDesktopController.right.width).toBe(240);
    await expect(constrainedDesktopProjectSidebarController.width).toBe(220);

    frame.style.width = "";
    frame.style.maxWidth = "";
    await waitFor(() =>
      expect(root).toHaveAttribute("data-desktop-constrained", "true"),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).not.toBeVisible();
    await expect(canvas.getByLabelText("AI sidebar")).not.toBeVisible();
    await expect(canvas.getByLabelText("Files sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
  }}
>
  {#snippet template()}
    <AppShellCompleteDemo
      controller={constrainedDesktopController}
      projectSidebar={constrainedDesktopProjectSidebarController}
      displayMode="desktop"
      frameClass="ui-shell-story-frame-constrained-desktop"
      showBodySidebar={false}
    />
  {/snippet}
</Story>

<Story
  name="Markdown document body sidebars"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    documentController.left.expand();
    documentController.left.resetWidth();
    selectedMarkdownFile = "";
    bodySidebarSide = undefined;

    const mainBody = canvas.getByRole("main", { name: "Markdown document" });
    await expect(mainBody).toHaveAttribute("data-layout", "regions");
    await expect(mainBody).toHaveStyle("overflow: hidden");
    const storyFrame = mainBody.closest<HTMLElement>(".ui-shell-story-frame");
    await expect(storyFrame).toBeInTheDocument();
    const leftBodyToggle = canvas.getByRole("button", {
      name: "Show table of contents on left",
    });
    const rightBodyToggle = canvas.getByRole("button", {
      name: "Show table of contents on right",
    });
    await expect(mainBody).toContainElement(leftBodyToggle);
    await expect(mainBody).toContainElement(rightBodyToggle);
    const bodyRect = mainBody.getBoundingClientRect();
    const leftToggleRect = leftBodyToggle.getBoundingClientRect();
    const rightToggleRect = rightBodyToggle.getBoundingClientRect();
    await expect(
      Math.abs(leftToggleRect.left - (bodyRect.left + 8)),
    ).toBeLessThanOrEqual(0.5);
    await expect(
      Math.abs(rightToggleRect.right - (bodyRect.right - 8)),
    ).toBeLessThanOrEqual(0.5);
    await expect(
      Math.abs(leftToggleRect.top - (bodyRect.top + 8)),
    ).toBeLessThanOrEqual(0.5);
    await expect(
      Math.abs(rightToggleRect.top - (bodyRect.top + 8)),
    ).toBeLessThanOrEqual(0.5);
    await expect(
      canvas.queryByRole("complementary", { name: "Table of contents" }),
    ).not.toBeInTheDocument();
    await expect(canvas.getByText("Select a Markdown file")).toBeVisible();

    const readmeButton = canvas.getByRole("button", {
      name: "Open README.md",
    });
    await userEvent.click(readmeButton);
    await expect(readmeButton).toHaveFocus();
    await expect(readmeButton).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.getByRole("button", {
        name: "Hide table of contents on left",
      }),
    ).toHaveAttribute("aria-pressed", "true");

    const leftToc = canvas.getByRole("complementary", {
      name: "Table of contents",
    });
    const markdownContent = canvas.getByRole("region", {
      name: "README.md content",
    });
    await expect(leftToc).toHaveAttribute("data-side", "left");
    await expect(markdownContent).toBeVisible();
    await expect(
      canvas.getByRole("navigation", { name: "Document sections" }),
    ).toBeVisible();

    const tocViewport = leftToc.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    const contentViewport = markdownContent.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    await expect(tocViewport).toBeInTheDocument();
    await expect(contentViewport).toBeInTheDocument();
    await expect(getComputedStyle(tocViewport!).overflowY).toBe("scroll");
    await expect(getComputedStyle(contentViewport!).overflowY).toBe("scroll");
    await expect(contentViewport!.scrollHeight).toBeGreaterThan(
      contentViewport!.clientHeight,
    );
    await expect(mainBody.scrollHeight).toBe(mainBody.clientHeight);
    const contentWidthWithSidebar =
      markdownContent.getBoundingClientRect().width;

    const rightButton = canvas.getByRole("button", {
      name: "Show table of contents on right",
    });
    await userEvent.click(rightButton);
    await expect(rightButton).toHaveFocus();
    await expect(rightButton).toHaveAttribute("aria-pressed", "true");
    const rightToc = canvas.getByRole("complementary", {
      name: "Table of contents",
    });
    await expect(rightToc).toHaveAttribute("data-side", "right");

    const hideRightButton = canvas.getByRole("button", {
      name: "Hide table of contents on right",
    });
    await userEvent.click(hideRightButton);
    await expect(hideRightButton).toHaveFocus();
    await expect(
      canvas.queryByRole("complementary", { name: "Table of contents" }),
    ).not.toBeInTheDocument();
    await expect(markdownContent.getBoundingClientRect().width).toBeGreaterThan(
      contentWidthWithSidebar,
    );

    const showRightButton = canvas.getByRole("button", {
      name: "Show table of contents on right",
    });
    await userEvent.click(showRightButton);
    await expect(showRightButton).toHaveFocus();
    const openRightToc = canvas.getByRole("complementary", {
      name: "Table of contents",
    });
    await expect(openRightToc).toHaveAttribute("data-side", "right");
    const activeRightButton = canvas.getByRole("button", {
      name: "Hide table of contents on right",
    });
    await expect(activeRightButton).toHaveAttribute("aria-pressed", "true");
    await expect(activeRightButton).toHaveAttribute("data-variant", "ghost");
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={documentController}
        displayMode="desktop"
        desktopMinMainWidth={0}
        class="ui-shell-story-surface"
      >
        <AppShell.Sidebar side="left" label="Markdown files sidebar">
          <AppShellMarkdownFilesDemo
            controller={documentController}
            selectedFile={selectedMarkdownFile}
            onSelectFile={openMarkdownFile}
          />
        </AppShell.Sidebar>

        <AppShell.Main>
          <AppShell.Toolbar>
            <div class="ui-shell-story-toolbar-controls">
              <AppShell.Sidebar.Toggle side="left" />
              <strong class="ui-shell-story-toolbar-title">
                {selectedMarkdownFile || "Document viewer"}
              </strong>
              <span class="ui-shell-story-toolbar-spacer"></span>
            </div>
          </AppShell.Toolbar>

          <AppShellMarkdownDocumentDemo
            file={selectedMarkdownFile}
            sidebarSide={bodySidebarSide}
            onToggleSidebar={toggleBodySidebar}
          />
        </AppShell.Main>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Independent icon rails"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    interactiveController.left.expand();
    interactiveController.right.expand();
    interactiveController.left.resetWidth();
    interactiveController.right.resetWidth();

    const leftSidebar = canvas.getByLabelText("Left sidebar");
    const rightSidebar = canvas.getByLabelText("Right sidebar");
    await expect(leftSidebar).toHaveAttribute("data-state", "expanded");
    await expect(rightSidebar).toHaveAttribute("data-state", "expanded");

    const leftToggle = canvas.getByRole("button", {
      name: "Collapse left sidebar",
    });
    await expect(leftToggle).toHaveAttribute("data-ui-part", "sidebar-toggle");
    await userEvent.click(leftToggle);
    await expect(leftToggle).toHaveFocus();
    await expect(leftSidebar).toHaveAttribute("data-state", "collapsed");
    await expect(rightSidebar).toHaveAttribute("data-state", "expanded");
    await expect(
      canvas.getByRole("button", { name: "CV library" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Expand left sidebar" }),
    ).toBeVisible();
    const collapsedLeftViewport = leftSidebar.querySelector(
      '[data-ui-part="sidebar-body"] [data-ui-part="scroll-area-viewport"]',
    );
    await expect(collapsedLeftViewport).toBeInTheDocument();
    await expect(collapsedLeftViewport!.scrollHeight).toBeGreaterThan(
      collapsedLeftViewport!.clientHeight,
    );
    collapsedLeftViewport!.scrollTop = 120;
    await expect(collapsedLeftViewport!.scrollTop).toBeGreaterThan(0);
    const collapsedLeftScrollbar = leftSidebar.querySelector(
      '[data-ui-part="sidebar-body"] > [data-ui-part="scroll-area"] > [data-ui-part="scroll-area-scrollbar"]',
    );
    if (collapsedLeftScrollbar) {
      await expect(getComputedStyle(collapsedLeftScrollbar).display).toBe(
        "none",
      );
    }

    const rightToggle = canvas.getByRole("button", {
      name: "Collapse right sidebar",
    });
    await userEvent.click(rightToggle);
    await expect(rightToggle).toHaveFocus();
    await expect(leftSidebar).toHaveAttribute("data-state", "collapsed");
    await expect(rightSidebar).toHaveAttribute("data-state", "collapsed");
    const collapsedRightHeader = rightSidebar.querySelector(
      '[data-ui-part="sidebar-header"]',
    );
    await expect(collapsedRightHeader).toBeInTheDocument();
    await expect(getComputedStyle(rightSidebar).borderInlineStartWidth).toBe(
      "0px",
    );
    await expect(
      canvas.queryByRole("slider", { name: "Resize left sidebar" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole("slider", { name: "Resize right sidebar" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Open AI conversation" }),
    ).toBeVisible();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    const collapsedRightActions = Array.from(
      rightSidebar.querySelectorAll("button"),
    );
    await expect(collapsedRightActions[0]).toHaveAttribute(
      "aria-label",
      "Close right sidebar",
    );
    const toolbarIcon = leftToggle.querySelector("svg");
    const leftRailIcon = leftSidebar.querySelector(
      '[data-ui-part="sidebar-header"] svg',
    );
    const rightRailIcon = canvas
      .getByRole("button", { name: "Close right sidebar" })
      .querySelector("svg");
    await expect(toolbarIcon).toBeInTheDocument();
    await expect(leftRailIcon).toBeInTheDocument();
    await expect(rightRailIcon).toBeInTheDocument();
    const toolbarIconRect = toolbarIcon!.getBoundingClientRect();
    const leftRailIconRect = leftRailIcon!.getBoundingClientRect();
    const rightRailIconRect = rightRailIcon!.getBoundingClientRect();
    const toolbarIconCenter =
      (toolbarIconRect.top + toolbarIconRect.bottom) / 2;
    const leftRailIconCenter =
      (leftRailIconRect.top + leftRailIconRect.bottom) / 2;
    const rightRailIconCenter =
      (rightRailIconRect.top + rightRailIconRect.bottom) / 2;
    await expect(
      Math.abs(leftRailIconCenter - toolbarIconCenter),
      "left collapsed icon should align with the toolbar",
    ).toBeLessThanOrEqual(0.25);
    await expect(
      Math.abs(rightRailIconCenter - toolbarIconCenter),
      "right collapsed close icon should align with the toolbar",
    ).toBeLessThanOrEqual(0.25);
    await expect(
      canvas.getByRole("main", { name: "Workspace content" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={interactiveController}
        displayMode="desktop"
        desktopMinMainWidth={0}
        class="ui-shell-story-surface"
      >
        <AppShell.Sidebar side="left">
          <AppShellSidebarDemo controller={interactiveController} side="left" />
        </AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Toolbar>
            <AppShellToolbarDemo />
          </AppShell.Toolbar>
          <AppShell.Body label="Workspace content">
            <AppShellBodyDemo />
          </AppShell.Body>
        </AppShell.Main>
        <AppShell.Sidebar side="right" closeable>
          <AppShellConversationDemo controller={interactiveController} />
        </AppShell.Sidebar>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>

<Story
  name="Single sidebar composition"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    minimalController.left.expand();
    minimalController.left.resetWidth();

    await expect(canvas.getByLabelText("Left sidebar")).toBeVisible();
    await expect(
      canvas.queryByLabelText("Right sidebar"),
    ).not.toBeInTheDocument();
    const mainBody = canvas.getByRole("main", { name: "Workspace content" });
    await expect(mainBody).toBeVisible();
    const mainSurface = mainBody.closest<HTMLElement>('[data-ui-part="main"]');
    const shellRoot = mainBody.closest<HTMLElement>('[data-ui-part="root"]');
    await expect(mainSurface).toBeInTheDocument();
    await expect(shellRoot).toBeInTheDocument();
    const mainSurfaceRect = mainSurface!.getBoundingClientRect();
    const shellRootRect = shellRoot!.getBoundingClientRect();
    const bottomInset = shellRootRect.bottom - mainSurfaceRect.bottom;
    const rightInset = shellRootRect.right - mainSurfaceRect.right;
    await expect(rightInset).toBeGreaterThan(0);
    await expect(Math.abs(rightInset - bottomInset)).toBeLessThanOrEqual(0.5);
    await expect(
      canvas.queryByRole("button", { name: "Collapse right sidebar" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole("slider", { name: "Resize left sidebar" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("slider", { name: "Resize right sidebar" }),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={minimalController}
        displayMode="desktop"
        desktopMinMainWidth={0}
        class="ui-shell-story-surface"
      >
        <AppShell.Sidebar side="left">
          <AppShellSidebarDemo controller={minimalController} side="left" />
        </AppShell.Sidebar>
        <AppShell.Main>
          <AppShell.Toolbar>
            <AppShellToolbarDemo showRightToggle={false} />
          </AppShell.Toolbar>
          <AppShell.Body label="Workspace content">
            <AppShellBodyDemo />
          </AppShell.Body>
        </AppShell.Main>
      </AppShell.Root>
    </div>
  {/snippet}
</Story>
