<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import AppShellBodyDemo from "./examples/AppShellBodyDemo.svelte";
  import AppShellConversationDemo from "./examples/AppShellConversationDemo.svelte";
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
            "A bounded structural shell with independently controlled collapsible, closeable, and resizable sidebars. Applications own navigation, content, and persistence.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const expandedController = new AppShellController();
  const interactiveController = new AppShellController();
  const minimalController = new AppShellController();
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
