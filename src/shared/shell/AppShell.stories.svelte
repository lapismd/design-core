<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import AppShellBodyDemo from "./examples/AppShellBodyDemo.svelte";
  import AppShellConversationDemo from "./examples/AppShellConversationDemo.svelte";
  import AppShellFilesSidebarDemo from "./examples/AppShellFilesSidebarDemo.svelte";
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
  const projectSidebarController = nestedController.createSidebar(
    "projects",
    "left",
  );
  let nestedSelectedProject = $state("");

  function selectNestedProject(projectId: string): void {
    nestedSelectedProject = projectId;
    if (projectId) {
      nestedController.left.expand();
    } else {
      nestedController.left.close();
    }
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
    const reclaimedSidebarWidth =
      rightSidebar.getBoundingClientRect().width +
      Number.parseFloat(
        getComputedStyle(rightSidebar).marginInlineStart || "0",
      );
    const rightToggle = canvas.getByRole("button", {
      name: "Collapse right sidebar",
    });
    await userEvent.click(rightClose);
    await expect(
      canvas.queryByLabelText("Right sidebar"),
    ).not.toBeInTheDocument();
    await expect(rightToggle).toHaveAttribute(
      "aria-label",
      "Open right sidebar",
    );
    await expect(
      Math.round(mainSurface!.getBoundingClientRect().width),
    ).toBeGreaterThanOrEqual(
      Math.round(mainWidthBeforeClose + reclaimedSidebarWidth) - 1,
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
    ).toBe("1px");
    await expect(
      getComputedStyle(collapsedProjectFooter!).borderBlockStartWidth,
    ).toBe("1px");
    await userEvent.hover(projectsSidebar);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await userEvent.unhover(projectsSidebar);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(projectsSidebar).toHaveAttribute(
      "data-presentation",
      "inline",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Expand projects sidebar" }),
    );
    await expect(projectsSidebar).toHaveAttribute("data-state", "expanded");

    const rootRect = root!.getBoundingClientRect();
    const projectsWidth = projectsSidebar.getBoundingClientRect().width;
    const mainWidthBeforeClose = mainSurface!.getBoundingClientRect().width;
    const closeProjects = canvas.getByRole("button", {
      name: "Close left sidebar",
    });
    await userEvent.click(closeProjects);
    await expect(
      canvas.queryByLabelText("Projects sidebar"),
    ).not.toBeInTheDocument();
    await expect(
      Math.abs(filesSidebar.getBoundingClientRect().left - rootRect.left),
    ).toBeLessThanOrEqual(1.25);
    await expect(mainSurface!.getBoundingClientRect().width).toBeGreaterThan(
      mainWidthBeforeClose + projectsWidth - 2,
    );

    const filesLeftWhileClosed = filesSidebar.getBoundingClientRect().left;
    const mainWidthWhileClosed = mainSurface!.getBoundingClientRect().width;
    const edgeTrigger = canvas.getByRole("button", {
      name: "Preview projects sidebar",
    });
    await expect(edgeTrigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.hover(edgeTrigger);

    const overlayProjects = canvas.getByLabelText("Projects sidebar");
    await expect(edgeTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(overlayProjects).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await expect(overlayProjects).toHaveAttribute("data-state", "closed");
    await expect(
      Math.abs(overlayProjects.getBoundingClientRect().left - rootRect.left),
    ).toBeLessThanOrEqual(1.25);
    await expect(filesSidebar.getBoundingClientRect().left).toBeCloseTo(
      filesLeftWhileClosed,
      0,
    );
    await expect(mainSurface!.getBoundingClientRect().width).toBeCloseTo(
      mainWidthWhileClosed,
      0,
    );

    const overlayResize = overlayProjects.querySelector<HTMLElement>(
      '[data-ui-part="sidebar-resize-handle"]',
    );
    await expect(overlayResize).toBeInTheDocument();
    const overlayWidthBefore = overlayProjects.getBoundingClientRect().width;
    const overlayResizeRect = overlayResize!.getBoundingClientRect();
    const overlayResizeStart = {
      clientX: (overlayResizeRect.left + overlayResizeRect.right) / 2,
      clientY: (overlayResizeRect.top + overlayResizeRect.bottom) / 2,
    };
    await userEvent.pointer([
      {
        keys: "[MouseLeft>]",
        target: overlayResize!,
        coords: overlayResizeStart,
      },
      {
        coords: {
          clientX: overlayResizeStart.clientX + 24,
          clientY: overlayResizeStart.clientY,
        },
      },
      "[/MouseLeft]",
    ]);
    await expect(
      Math.round(overlayProjects.getBoundingClientRect().width),
    ).toBe(Math.round(overlayWidthBefore) + 24);
    await expect(projectSidebarController.width).toBe(
      Math.round(overlayWidthBefore) + 24,
    );
    await expect(nestedController.getLayout().panels.projects).toEqual({
      side: "left",
      collapsed: false,
      closed: true,
      width: Math.round(overlayWidthBefore) + 24,
    });
    await expect(overlayProjects).not.toHaveAttribute("data-resizing");

    await userEvent.unhover(overlayProjects);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(
      canvas.queryByLabelText("Projects sidebar"),
    ).not.toBeInTheDocument();

    const openProjects = canvas.getByRole("button", {
      name: "Open projects sidebar",
    });
    await userEvent.click(openProjects);
    await expect(openProjects).toHaveFocus();
    await expect(canvas.getByLabelText("Projects sidebar")).toHaveAttribute(
      "data-presentation",
      "inline",
    );
    await expect(
      canvas.queryByRole("button", { name: "Preview projects sidebar" }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse projects sidebar" }),
    );
    const collapsedProjects = canvas.getByLabelText("Projects sidebar");
    await expect(collapsedProjects).toHaveAttribute("data-state", "collapsed");
    await userEvent.click(
      canvas.getByRole("button", { name: "Close left sidebar" }),
    );
    await expect(
      canvas.queryByLabelText("Projects sidebar"),
    ).not.toBeInTheDocument();

    const filesLeftAfterCollapsedClose =
      filesSidebar.getBoundingClientRect().left;
    const mainWidthAfterCollapsedClose =
      mainSurface!.getBoundingClientRect().width;
    const hoverOpenProjects = canvas.getByRole("button", {
      name: "Open projects sidebar",
    });
    await userEvent.hover(hoverOpenProjects);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 620);
    });

    const togglePreviewProjects = canvas.getByLabelText("Projects sidebar");
    await expect(togglePreviewProjects).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await expect(togglePreviewProjects).toHaveAttribute("data-state", "closed");
    await expect(togglePreviewProjects).toHaveAttribute(
      "data-previewed",
      "true",
    );
    await expect(
      canvas.getByRole("combobox", { name: "Project selector" }),
    ).toBeVisible();
    await expect(
      Math.round(togglePreviewProjects.getBoundingClientRect().width),
    ).toBe(projectSidebarController.width);
    await expect(filesSidebar.getBoundingClientRect().left).toBeCloseTo(
      filesLeftAfterCollapsedClose,
      0,
    );
    await expect(mainSurface!.getBoundingClientRect().width).toBeCloseTo(
      mainWidthAfterCollapsedClose,
      0,
    );
    await userEvent.hover(togglePreviewProjects);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(togglePreviewProjects).toBeInTheDocument();
    await userEvent.unhover(togglePreviewProjects);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });
    await expect(
      canvas.queryByLabelText("Projects sidebar"),
    ).not.toBeInTheDocument();

    const closedCollapsedEdgeTrigger = canvas.getByRole("button", {
      name: "Preview projects sidebar",
    });
    await userEvent.hover(closedCollapsedEdgeTrigger);
    const collapsedEdgePreview = canvas.getByLabelText("Projects sidebar");
    await expect(collapsedEdgePreview).toHaveAttribute(
      "data-presentation",
      "overlay",
    );
    await expect(collapsedEdgePreview).toHaveAttribute("data-state", "closed");
    await expect(
      canvas.getByRole("combobox", { name: "Project selector" }),
    ).toBeVisible();
    await expect(
      Math.round(collapsedEdgePreview.getBoundingClientRect().width),
    ).toBe(projectSidebarController.width);
    await userEvent.unhover(collapsedEdgePreview);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 160);
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "Open projects sidebar" }),
    );
    await expect(canvas.getByLabelText("Projects sidebar")).toHaveAttribute(
      "data-state",
      "expanded",
    );
  }}
>
  {#snippet template()}
    <div class="ui-shell-story-frame">
      <AppShell.Root
        controller={nestedController}
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
    await expect(
      canvas.getByRole("main", { name: "Workspace content" }),
    ).toBeVisible();
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
