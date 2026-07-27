<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import {
    createDefaultWorkspaceLayout,
    createWorkspaceTab,
    createWorkspaceTabs,
  } from "../core/layout.js";
  import type { WorkspaceLayoutChangeEvent } from "../core/types.js";
  import { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
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

  function createStoryTab() {
    const id = `new-${nextTab++}`;
    return createWorkspaceTab({ id, title: `New tab ${nextTab}` });
  }
</script>

<Story
  name="Activates, closes, and persists tabs"
  tags={["visual-approved"]}
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

    const tab = canvas.getByRole("tab", { name: "Today.md" });
    await userEvent.click(tab);
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await userEvent.click(
      canvas
        .getByRole("tab", { name: "Today.md" })
        .querySelector('[data-ui-part="tab-close"]')!,
    );
    await controller.flushSave();
    await expect(canvas.queryByRole("tab", { name: "Today.md" })).toBeNull();
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Saved tab-close",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/tabs/activates-closes-and-persists-tabs-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
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
  name="Overflow menu"
  tags={["visual-approved"]}
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
      images: [
        "/visual-baselines/workspace/tabs/overflow-menu-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
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
  tags={["visual-approved"]}
  globals={{ theme: "lapis", colorMode: "light" }}
  play={async ({ canvasElement }) => {
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
