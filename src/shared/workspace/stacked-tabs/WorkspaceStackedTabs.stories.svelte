<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceStackedTabs from "./WorkspaceStackedTabs.svelte";
  import "./WorkspaceStackedTabs.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Stacked Tabs",
    component: WorkspaceStackedTabs,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-shaped stacked workspace tabs with controller-backed activation, closing, overflow actions, drag targets, and hidden-scrollbar pane overflow.",
        },
      },
    },
  });
</script>

<script lang="ts">
  const initialPane = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "stacked-home",
        title: "Framework home",
        icon: "layout-template",
      }),
      createWorkspaceTab({
        id: "stacked-reference",
        title: "Reference",
        icon: "book-open",
        view: { type: "stacked-interaction-story" },
      }),
      createWorkspaceTab({
        id: "stacked-details",
        title: "Details",
        icon: "panel-right",
      }),
    ],
    {
      id: "stacked-story-pane",
      activeItemId: "stacked-home",
      presentation: "stacked",
    },
  );
  const layout = createDefaultWorkspaceLayout();
  layout.main = initialPane;
  layout.active = {
    hostId: "root",
    paneId: initialPane.id,
    tabId: "stacked-home",
  };
  const controller = new WorkspaceShellController({ layout });
  controller.registry.register({
    kind: "imperative",
    type: "stacked-interaction-story",
    mount(target, context) {
      target.textContent = `${context.tab.title} view`;
      return () => target.replaceChildren();
    },
    getChrome: () => ({
      buildPaneMenu: (menu) => {
        menu.addItem((item) => item.setTitle("Example stacked view action"));
      },
    }),
  });
  const livePane = $derived(
    controller.layout.main.kind === "tabs"
      ? controller.layout.main
      : initialPane,
  );

  const focusPane = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "stacked-focus-home",
        title: "Focus home",
        icon: "layout-template",
      }),
      createWorkspaceTab({
        id: "stacked-focus-reference",
        title: "Focus reference",
        icon: "book-open",
      }),
    ],
    {
      id: "stacked-focus-pane",
      activeItemId: "stacked-focus-home",
      presentation: "stacked",
    },
  );
  const focusLayout = createDefaultWorkspaceLayout();
  focusLayout.main = focusPane;
  focusLayout.active = {
    hostId: "root",
    paneId: focusPane.id,
    tabId: "stacked-focus-home",
  };
  const focusController = new WorkspaceShellController({
    layout: focusLayout,
  });
</script>

<Story
  name="Activates and closes vertical tabs"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>(
      '[data-ui-part="container"]',
    );
    await expect(container).not.toBeNull();
    await expect(container!.scrollWidth).toBeGreaterThan(
      container!.clientWidth,
    );

    const reference = canvas.getByRole("button", { name: "Reference" });
    await userEvent.click(reference);
    await expect(reference).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => {
      expect(container!.scrollLeft).toBeGreaterThan(0);
    });

    const details = canvas.getByRole("button", { name: "Details" });
    await userEvent.click(
      details
        .closest('[data-ui-part="stacked-tab-header"]')!
        .querySelector('[data-ui-part="stacked-tab-close"]')!,
    );
    await expect(canvas.queryByRole("button", { name: "Details" })).toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/stacked-tabs/activates-and-closes-vertical-tabs-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-stacked-tabs-story-frame">
      <WorkspaceStackedTabs
        {controller}
        pane={livePane}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Pane menus and action hover"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    controller.exitFocusMode();
    controller.selectTab("stacked-home");
    const page = within(canvasElement.ownerDocument.body);
    const home = canvas.getByRole("button", { name: "Framework home" });
    const reference = canvas.getByRole("button", { name: "Reference" });

    await userEvent.pointer({ keys: "[MouseRight]", target: reference });
    await expect(home).toHaveAttribute("aria-pressed", "true");
    await expect(reference).toHaveAttribute("aria-pressed", "false");
    for (const name of [
      "Split right",
      "Split down",
      "Move to floating window",
      "Open in new window",
      "Close",
      "Example stacked view action",
    ]) {
      await expect(page.getByRole("menuitem", { name })).toBeVisible();
    }
    await userEvent.keyboard("{Escape}");

    const menuTrigger = canvas.getByRole("button", {
      name: "Open Reference tab menu",
    });
    await waitFor(() =>
      expect(getComputedStyle(menuTrigger).pointerEvents).toBe("auto"),
    );
    const header = menuTrigger.closest<HTMLElement>(
      ".ui-workspace-stacked-tabs__tab-header",
    );
    await expect(
      getComputedStyle(menuTrigger).getPropertyValue(
        "--ui-workspace-tab-action-hover-background",
      ),
    ).not.toBe("");
    await userEvent.click(menuTrigger);
    await waitFor(() =>
      expect(reference).toHaveAttribute("aria-pressed", "true"),
    );
    await expect(getComputedStyle(menuTrigger).backgroundColor).not.toBe(
      getComputedStyle(header!).backgroundColor,
    );
    await expect(
      page.getByRole("menuitem", { name: "Example stacked view action" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    menuTrigger.focus();
    await userEvent.keyboard("{Enter}");
    await expect(
      page.getByRole("menuitem", { name: "Example stacked view action" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-stacked-tabs-story-frame">
      <WorkspaceStackedTabs
        {controller}
        pane={livePane}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Focus mode"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    focusController.exitFocusMode();
    focusController.selectTab("stacked-focus-home");
    const reference = canvas.getByRole("button", {
      name: "Focus reference",
    });
    await userEvent.dblClick(reference);
    const pane = canvasElement.querySelector(
      '[data-workspace-pane-id="stacked-focus-pane"]',
    );
    await expect(pane).toHaveAttribute("data-workspace-focus-mode", "true");
    await userEvent.dblClick(reference);
    await expect(pane).not.toHaveAttribute("data-workspace-focus-mode");

    const maximize = canvas.getByRole("button", {
      name: "Maximize tab group",
    });
    const restingBackground = getComputedStyle(maximize).backgroundColor;
    await userEvent.click(maximize);
    const restore = canvas.getByRole("button", {
      name: "Restore tab group",
    });
    await expect(restore).toHaveAttribute("aria-pressed", "true");
    await waitFor(() =>
      expect(getComputedStyle(restore).backgroundColor).not.toBe(
        restingBackground,
      ),
    );
    await userEvent.click(restore);
    await expect(pane).not.toHaveAttribute("data-workspace-focus-mode");
    await userEvent.click(
      canvas.getByRole("button", { name: "Maximize tab group" }),
    );
    await expect(pane).toHaveAttribute("data-workspace-focus-mode", "true");
    await expect(
      canvas.queryByRole("button", { name: "Exit focus mode" }),
    ).toBeNull();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-stacked-tabs-story-frame">
      <WorkspaceStackedTabs
        controller={focusController}
        pane={focusPane}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>
