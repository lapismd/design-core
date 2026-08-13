<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceLayoutChangeEvent } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import * as exampleSources from "./WorkspaceTabs.example-sources.js";
  import WorkspaceTabs from "./WorkspaceTabs.svelte";
  import "./WorkspaceTabs.stories.css";

  const { Story } = defineMeta({
    title: "Workspace/Components/Tabs",
    component: WorkspaceTabs,
    parameters: {
      layout: "fullscreen",
      docs: {
        description: {
          component:
            "Source-shaped top tabs with direct Bits UI tab/list/content structure, hidden-scrollbar overflow, controller-owned mutation, and registered drop targets.",
        },
        source: {
          code: exampleSources.Basic,
          language: "ts",
          type: "code",
        },
      },
    },
  });
</script>

<script lang="ts">
  let saveStatus = $state("No layout saved");
  let nextTab = 1;

  const tabs = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "welcome",
        title: "Welcome.md",
        icon: "book-open",
      }),
      createWorkspaceTab({
        id: "today",
        title: "Today.md",
        icon: "calendar-days",
      }),
      createWorkspaceTab({
        id: "tasks",
        title: "Tasks.md",
        icon: "list-checks",
      }),
    ],
    { id: "story-tabs", activeItemId: "welcome" },
  );
  const layout = createDefaultWorkspaceLayout();
  layout.main = tabs;
  layout.active = {
    hostId: "root",
    paneId: tabs.id,
    tabId: "welcome",
  };
  const controller = new WorkspaceShellController({
    layout,
    saveDebounceMs: 0,
    persistence: {
      async load() {
        return null;
      },
      async save(_layout, event: WorkspaceLayoutChangeEvent) {
        saveStatus = `Saved ${event.source}`;
      },
    },
  });
  const liveTabs = $derived(
    controller.layout.main.kind === "tabs" ? controller.layout.main : tabs,
  );

  const constrainedTabs = createWorkspaceTabs(
    Array.from({ length: 8 }, (_, index) =>
      createWorkspaceTab({
        id: `constrained-${index}`,
        title: `Long document title ${index + 1}.md`,
        icon: index % 2 === 0 ? "file-text" : "book-open",
      }),
    ),
    { id: "constrained-tabs", activeItemId: "constrained-0" },
  );
  const constrainedLayout = createDefaultWorkspaceLayout();
  constrainedLayout.main = constrainedTabs;
  constrainedLayout.active = {
    hostId: "root",
    paneId: constrainedTabs.id,
    tabId: "constrained-0",
  };
  const constrainedController = new WorkspaceShellController({
    layout: constrainedLayout,
  });
  const liveConstrainedTabs = $derived(
    constrainedController.layout.main.kind === "tabs"
      ? constrainedController.layout.main
      : constrainedTabs,
  );

  const interactionTabs = createWorkspaceTabs(
    [
      createWorkspaceTab({
        id: "menu-home",
        title: "Menu home",
        icon: "layout-template",
        view: { type: "tab-interaction-story" },
      }),
      createWorkspaceTab({
        id: "menu-reference",
        title: "Menu reference",
        icon: "book-open",
        view: { type: "tab-interaction-story" },
      }),
    ],
    { id: "menu-story-tabs", activeItemId: "menu-home" },
  );
  const interactionLayout = createDefaultWorkspaceLayout();
  interactionLayout.main = interactionTabs;
  interactionLayout.active = {
    hostId: "root",
    paneId: interactionTabs.id,
    tabId: "menu-home",
  };
  const interactionController = new WorkspaceShellController({
    layout: interactionLayout,
  });
  interactionController.registry.register({
    kind: "imperative",
    type: "tab-interaction-story",
    mount(target, context) {
      target.textContent = `${context.tab.title} view`;
      return () => target.replaceChildren();
    },
    getChrome: () => ({
      buildPaneMenu: (menu) => {
        menu.addItem((item) => item.setTitle("Example view action"));
      },
    }),
  });
  const liveInteractionTabs = $derived(
    interactionController.layout.main.kind === "tabs"
      ? interactionController.layout.main
      : interactionTabs,
  );

  function createStoryTab() {
    const id = `new-${nextTab++}`;
    return createWorkspaceTab({ id, title: `New tab ${nextTab}` });
  }
</script>

<Story
  name="Activates, closes, and persists tabs"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    const headerMain = canvasElement.querySelector(
      ".ui-workspace-tabs__header-main",
    );
    const leftToggle = canvasElement.querySelector(
      ".ui-workspace-tabs__left-toggle",
    );
    const rightToggle = canvasElement.querySelector(
      ".ui-workspace-tabs__right-toggle",
    );

    await expect(headerMain).not.toBeNull();
    await expect(leftToggle).not.toBeNull();
    await expect(rightToggle).not.toBeNull();
    await expect(
      parseFloat(getComputedStyle(headerMain!).borderBottomWidth),
    ).toBeCloseTo(1);
    await expect(getComputedStyle(leftToggle!).borderBottomWidth).toBe("0px");
    await expect(
      parseFloat(getComputedStyle(rightToggle!).borderBottomWidth),
    ).toBeCloseTo(1);

    const addTab = canvas.getByRole("button", { name: "New tab" });
    controller.activateNewTabs = false;
    const initialTabCount = liveTabs.items.length;
    await userEvent.click(addTab);
    await waitFor(() => {
      expect(liveTabs.items).toHaveLength(initialTabCount + 1);
      expect(controller.activeTabId).toBe("welcome");
    });
    const backgroundTabId = liveTabs.items.at(-1)!.id;

    controller.activateNewTabs = true;
    await userEvent.click(addTab);
    await waitFor(() => {
      expect(liveTabs.items).toHaveLength(initialTabCount + 2);
      expect(controller.activeTabId).toBe(liveTabs.items.at(-1)!.id);
    });
    const activatedTabId = liveTabs.items.at(-1)!.id;
    controller.closeTab(activatedTabId);
    controller.closeTab(backgroundTabId);
    controller.selectTab("welcome");

    const tab = canvas.getByRole("button", {
      name: /^Today\.md$/,
    });
    await userEvent.click(tab);
    await expect(tab).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      canvas
        .getByRole("button", { name: /^Today\.md$/ })
        .closest('[data-ui-part="tab"]')!
        .querySelector('[data-ui-part="tab-close"]')!,
    );
    await controller.flushSave();
    await expect(
      canvas.queryByRole("button", { name: /^Today\.md$/ }),
    ).toBeNull();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Saved tab-close",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/tabs/activates-closes-and-persists-tabs-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-tabs-story-frame">
      <WorkspaceTabs
        {controller}
        pane={liveTabs}
        createTab={createStoryTab}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
    <output class="sr-only">{saveStatus}</output>
  {/snippet}
</Story>

<Story
  name="Pane menus, hover, and focus toggle"
  tags={["visual-pending"]}
  play={async ({ canvas, canvasElement }) => {
    interactionController.exitFocusMode();
    interactionController.selectTab("menu-home");
    const page = within(canvasElement.ownerDocument.body);
    const pane = canvasElement.querySelector(
      '[data-workspace-pane-id="menu-story-tabs"]',
    );
    const reference = () =>
      canvas.getByRole("button", { name: /^Menu reference$/ });

    await waitFor(() =>
      expect(interactionController.activeTabId).toBe("menu-home"),
    );

    await userEvent.pointer({ keys: "[MouseRight]", target: reference() });
    await expect(interactionController.activeTabId).toBe("menu-home");
    for (const name of [
      "Split right",
      "Split down",
      "Move to floating window",
      "Open in new window",
      "Close",
      "Example view action",
    ]) {
      await expect(page.getByRole("menuitem", { name })).toBeVisible();
    }
    await userEvent.keyboard("{Escape}");

    const referenceMenu = canvas.getByRole("button", {
      name: "Open Menu reference tab menu",
    });
    await waitFor(() =>
      expect(getComputedStyle(referenceMenu).pointerEvents).toBe("auto"),
    );
    const referenceSurface = referenceMenu.closest<HTMLElement>(
      ".ui-workspace-tab__inner",
    );
    await expect(
      getComputedStyle(referenceMenu).getPropertyValue(
        "--ui-workspace-tab-action-hover-background",
      ),
    ).not.toBe("");
    await userEvent.click(referenceMenu);
    await waitFor(() =>
      expect(interactionController.activeTabId).toBe("menu-reference"),
    );
    await expect(getComputedStyle(referenceMenu).backgroundColor).not.toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(getComputedStyle(referenceMenu).backgroundColor).not.toBe(
      getComputedStyle(referenceSurface!).backgroundColor,
    );
    await expect(
      page.getByRole("menuitem", { name: "Example view action" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    referenceMenu.focus();
    await userEvent.keyboard("{Enter}");
    await expect(
      page.getByRole("menuitem", { name: "Example view action" }),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");

    const maximize = canvas.getByRole("button", {
      name: "Maximize tab group",
    });
    const restingBackground = getComputedStyle(maximize).backgroundColor;
    await expect(maximize).toHaveAttribute("aria-pressed", "false");
    await waitFor(() =>
      expect(getComputedStyle(maximize).pointerEvents).toBe("auto"),
    );
    await userEvent.click(maximize);
    await expect(pane).toHaveAttribute("data-workspace-focus-mode", "true");
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

    await userEvent.dblClick(reference());
    await expect(pane).toHaveAttribute("data-workspace-focus-mode", "true");
    await userEvent.dblClick(reference());
    await expect(pane).not.toHaveAttribute("data-workspace-focus-mode");
    await userEvent.dblClick(reference());
    await expect(
      canvas.getByRole("button", { name: "Restore tab group" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      canvas.queryByRole("button", { name: "Exit focus mode" }),
    ).toBeNull();
  }}
>
  {#snippet template()}
    <div class="ui-workspace-tabs-story-frame">
      <WorkspaceTabs
        controller={interactionController}
        pane={liveInteractionTabs}
        sidebarToggleSides={["left", "right"]}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Overflow menu"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Tab overflow menu" }),
    );
    const page = within(document.body);
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByText("Stack tabs")).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/workspace/tabs/overflow-menu-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="ui-workspace-tabs-story-frame">
      <WorkspaceTabs {controller} pane={liveTabs} createTab={createStoryTab} />
    </div>
  {/snippet}
</Story>

<Story
  name="Constrained hidden-scrollbar row"
  tags={["visual-pending"]}
  globals={{ theme: "lapis", colorMode: "light" }}
  play={async ({ canvas, canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-tabs__list",
    );
    await expect(row).not.toBeNull();
    await expect(row!.scrollWidth).toBeGreaterThan(row!.clientWidth);
    await expect(getComputedStyle(row!).scrollbarWidth).toBe("none");
    await expect(getComputedStyle(row!).margin).toBe("6px -5px -1px");
    await expect(getComputedStyle(row!).padding).toBe("1px 15px 0px");
    const active = canvasElement.querySelector<HTMLElement>(
      '.ui-workspace-tab[data-active="true"]',
    );
    const icon = active?.querySelector<HTMLElement>(".ui-workspace-tab__icon");
    const close = active?.querySelector<HTMLElement>(
      ".ui-workspace-tab__close",
    );
    await expect(icon).not.toBeNull();
    await expect(close).not.toBeNull();
    await expect(active!.getBoundingClientRect().height).toBe(36);
    await expect(getComputedStyle(active!).padding).toBe("4px 8px");
    await expect(getComputedStyle(active!).borderRadius).toBe("4px");
    await expect(getComputedStyle(active!).boxShadow).toContain(
      "rgb(224, 224, 224) 0px 0px 0px 1px",
    );
    const inner = active!.querySelector<HTMLElement>(
      ".ui-workspace-tab__inner",
    );
    await expect(inner).not.toBeNull();
    await expect(inner!.getBoundingClientRect().height).toBe(28);
    await expect(getComputedStyle(inner!).padding).toBe("0px 3px 0px 6px");
    await expect(icon!.getBoundingClientRect().right).toBeLessThanOrEqual(
      close!.getBoundingClientRect().left,
    );
    const add = canvas.getByRole("button", { name: "New tab" });
    const maximize = canvas.getByRole("button", {
      name: "Maximize tab group",
    });
    const options = canvas.getByRole("button", {
      name: "Tab overflow menu",
    });
    const newArea = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-tabs__new-area",
    );
    const overflow = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-tabs__overflow",
    );
    await expect(add.getBoundingClientRect().width).toBe(32);
    await expect(maximize.getBoundingClientRect().width).toBe(32);
    await expect(options.getBoundingClientRect().width).toBe(32);
    await expect(getComputedStyle(add).padding).toBe("4px 8px");
    await expect(getComputedStyle(maximize).padding).toBe("4px 8px");
    await expect(getComputedStyle(options).padding).toBe("4px 8px");
    await expect(newArea!.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      32,
    );
    await expect(
      overflow!.getBoundingClientRect().width,
    ).toBeGreaterThanOrEqual(68);
    await expect(add.getBoundingClientRect().right).toBeLessThanOrEqual(
      maximize.getBoundingClientRect().left,
    );
    await expect(maximize.getBoundingClientRect().right).toBeLessThanOrEqual(
      options.getBoundingClientRect().left,
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/tabs/constrained-hidden-scrollbar-row-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div
      class="ui-workspace-tabs-story-frame ui-workspace-tabs-story-frame--constrained"
    >
      <WorkspaceTabs
        controller={constrainedController}
        pane={liveConstrainedTabs}
        createTab={createStoryTab}
      />
    </div>
  {/snippet}
</Story>
