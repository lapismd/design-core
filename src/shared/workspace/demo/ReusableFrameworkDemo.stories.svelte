<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import ReusableFrameworkDemo from "./ReusableFrameworkDemo.svelte";
  import { createFrameworkDemo } from "./framework-demo.js";

  const overview = createFrameworkDemo();
  const interaction = createFrameworkDemo({ includeFloating: false });
  const pluginLifecycle = createFrameworkDemo({ includeFloating: false });
  const pointer = createFrameworkDemo({ includeFloating: false });
  const bottomPanel = createFrameworkDemo({
    includeFloating: false,
    includeBottomPanel: true,
  });
  const emptySidebarPointer = createFrameworkDemo({
    includeFloating: false,
    emptyLeftSidebar: true,
  });
  const sidebarInsertionPointer = createFrameworkDemo({
    includeFloating: false,
    directLeftSidebar: true,
  });
  const stackedInsertionPointer = createFrameworkDemo({
    includeFloating: false,
    stackedPrimary: true,
  });
  const mobile = createFrameworkDemo({
    includeFloating: true,
    mobileMode: "always",
  });

  const { Story } = defineMeta({
    title: "Workspace/Demo/Reusable Framework",
    component: ReusableFrameworkDemo,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "A Lapis-like application assembled only from public Workspace controller, layout, view, persistence, settings, command, and static-plugin APIs.",
        },
      },
    },
  });
</script>

<Story
  name="Overview"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(overview.app.ready).toBe(true));
    const settingsButton = canvas.getByRole("button", {
      name: "Open settings",
    });
    await userEvent.click(settingsButton);
    const dialog = canvas.getByRole("dialog", { name: "Settings" });
    await expect(dialog).toBeVisible();
    await expect(
      within(dialog).getByRole("complementary", {
        name: "Settings navigation",
      }),
    ).toBeVisible();
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close settings" }),
    );
    await expect(dialog).not.toBeInTheDocument();
    await expect(settingsButton).toHaveFocus();

    const initiallyCollapsedLinks = canvas.queryByRole("button", {
      name: "Expand Links",
    });
    if (initiallyCollapsedLinks) {
      await userEvent.click(initiallyCollapsedLinks);
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Links" }),
    );
    const expandLinks = canvas.getByRole("button", { name: "Expand Links" });
    const statusBar = canvas.getByLabelText("Workspace status");
    const statusSafeArea = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="status-safe-area"]',
    );
    await expect(statusSafeArea).toBeInTheDocument();
    await expect(getComputedStyle(statusSafeArea!).display).toBe("block");
    await waitFor(() =>
      expect(expandLinks.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        statusBar.getBoundingClientRect().top,
      ),
    );
    await userEvent.click(expandLinks);
    await expect(
      canvas.getByRole("button", { name: "Collapse Links" }),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/reusable-framework-demo/overview-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={overview.app} />
  {/snippet}
</Story>

<Story
  name="Bottom panel shell"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(bottomPanel.app.ready).toBe(true));
    await expect(canvas.getByLabelText("Bottom panel")).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Diagnostics" }));
    await expect(
      canvas.getByRole("button", { name: "Collapse Problems" }),
    ).toBeVisible();
    const expandOutput = canvas.queryByRole("button", {
      name: "Expand Output",
    });
    if (expandOutput) {
      await expect(
        expandOutput.querySelector(".lucide-chevron-right"),
      ).not.toBeNull();
      await userEvent.click(expandOutput);
    }
    await expect(
      canvas
        .getByRole("button", { name: "Collapse Output" })
        .querySelector(".lucide-chevron-down"),
    ).not.toBeNull();
    const closeRightSidebar = canvas.getByRole("button", {
      name: "Close right sidebar",
    });
    const bottomPanelToggle = within(
      canvas.getByLabelText("Bottom panel"),
    ).getByRole("button", { name: "Close bottom panel" });
    const bottomPanelToggleIcon = bottomPanelToggle.querySelector("svg")!;
    const rightSidebarToggleIcon = closeRightSidebar.querySelector("svg")!;
    await expect(
      bottomPanelToggleIcon.getBoundingClientRect().width,
    ).toBeCloseTo(rightSidebarToggleIcon.getBoundingClientRect().width, 2);
    await expect(
      bottomPanelToggleIcon.getBoundingClientRect().height,
    ).toBeCloseTo(rightSidebarToggleIcon.getBoundingClientRect().height, 2);
    const expandedSidebarBottomToggle =
      closeRightSidebar.previousElementSibling;
    await expect(expandedSidebarBottomToggle).toHaveAttribute(
      "data-ui-component",
      "workspace-bottom-panel-toggle",
    );
    await expect(expandedSidebarBottomToggle).toHaveAttribute(
      "aria-label",
      "Close bottom panel",
    );
    await userEvent.click(expandedSidebarBottomToggle!);
    await expect(
      canvas.queryByLabelText("Bottom panel"),
    ).not.toBeInTheDocument();
    await expect(expandedSidebarBottomToggle).toHaveAttribute(
      "aria-label",
      "Open bottom panel",
    );

    await userEvent.click(closeRightSidebar);
    const openRightSidebar = canvas.getByRole("button", {
      name: "Open right sidebar",
    });
    const collapsedSidebarBottomToggle =
      openRightSidebar.previousElementSibling;
    await expect(collapsedSidebarBottomToggle).toHaveAttribute(
      "data-ui-component",
      "workspace-bottom-panel-toggle",
    );
    await expect(collapsedSidebarBottomToggle).toHaveAttribute(
      "aria-label",
      "Open bottom panel",
    );
    await userEvent.click(collapsedSidebarBottomToggle!);
    await expect(canvas.getByLabelText("Bottom panel")).toBeVisible();
    await expect(collapsedSidebarBottomToggle).toHaveAttribute(
      "aria-label",
      "Close bottom panel",
    );

    await userEvent.click(openRightSidebar);
    const restoredRightSidebarToggle = canvas.getByRole("button", {
      name: "Close right sidebar",
    });
    await expect(
      restoredRightSidebarToggle.previousElementSibling,
    ).toHaveAttribute("aria-label", "Close bottom panel");
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={bottomPanel.app} />
  {/snippet}
</Story>

<Story name="Empty sidebar drop surface" tags={["visual-pending"]}>
  {#snippet template()}
    <ReusableFrameworkDemo app={emptySidebarPointer.app} />
  {/snippet}
</Story>

<Story name="Sidebar insertion drag surface" tags={["visual-pending"]}>
  {#snippet template()}
    <ReusableFrameworkDemo app={sidebarInsertionPointer.app} />
  {/snippet}
</Story>

<Story name="Stacked insertion drag surface" tags={["visual-pending"]}>
  {#snippet template()}
    <ReusableFrameworkDemo app={stackedInsertionPointer.app} />
  {/snippet}
</Story>

<Story
  name="Controller and persistence interaction"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await waitFor(() => expect(interaction.app.ready).toBe(true));
    const savesBeforeAdd = interaction.tracker.saveCount;
    await userEvent.click(
      canvas.getAllByRole("button", { name: "New tab" })[0],
    );
    const newTab = canvas.getByRole("button", {
      name: /^New Tab$/,
    });
    await expect(newTab).toHaveAttribute("aria-pressed", "true");
    await interaction.app.workspace.flushSave();
    await waitFor(() =>
      expect(interaction.tracker.saveCount).toBeGreaterThan(savesBeforeAdd),
    );

    const plan = canvas.getByRole("button", { name: /^Plan$/ });
    await userEvent.click(plan);
    await expect(plan).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Delete}");
    await interaction.app.workspace.flushSave();
    await waitFor(() =>
      expect(interaction.tracker.saveCount).toBeGreaterThan(0),
    );
    await expect(
      canvas.queryByRole("button", { name: /^Plan$/ }),
    ).not.toBeInTheDocument();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/controller-and-persistence-interaction-chromium.png",
        "/visual-baselines/workspace/demo/reusable-framework-demo/controller-and-persistence-interaction-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={interaction.app} />
  {/snippet}
</Story>

<Story
  name="Plugin lifecycle"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    await waitFor(() => expect(pluginLifecycle.app.ready).toBe(true));
    const documentCanvas = within(canvasElement.ownerDocument.body);
    const pluginsButton = canvas.getByRole("button", {
      name: "Manage demo plugin",
    });
    await userEvent.click(pluginsButton);
    await userEvent.click(
      documentCanvas.getByRole("menuitem", {
        name: "Disable Framework demo",
      }),
    );
    await expect(
      documentCanvas.getByText("Framework demo disabled"),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(pluginsButton).toHaveAttribute("aria-expanded", "false"),
    );
    const enabledPluginsButton = canvas.getByRole("button", {
      name: "Manage demo plugin",
    });
    await waitFor(() =>
      expect(getComputedStyle(enabledPluginsButton).pointerEvents).toBe("auto"),
    );
    await userEvent.click(enabledPluginsButton);
    await userEvent.click(
      documentCanvas.getByRole("menuitem", {
        name: "Enable Framework demo",
      }),
    );
    await expect(
      documentCanvas.getByText("Framework demo enabled"),
    ).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/plugin-lifecycle-chromium.png",
        "/visual-baselines/workspace/demo/reusable-framework-demo/plugin-lifecycle-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={pluginLifecycle.app} />
  {/snippet}
</Story>

<Story
  name="Mobile composition"
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/reusable-framework-demo/mobile-composition-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={mobile.app} displayMode="mobile" />
  {/snippet}
</Story>

<Story
  name="Pointer drag surface"
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/demo/pointer-drag-surface-chromium.png",
        "/visual-baselines/workspace/demo/reusable-framework-demo/pointer-drag-surface-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ReusableFrameworkDemo app={pointer.app} />
  {/snippet}
</Story>
