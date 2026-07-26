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
  import { withLapisStorybookReference } from "../reference/lapis-visual-delta.js";
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
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
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
  tags={["visual-pending", "lapis-reference-visual"]}
  play={async ({ canvasElement }) => {
    const row = canvasElement.querySelector<HTMLElement>(
      ".ui-workspace-tabs__list",
    );
    await expect(row).not.toBeNull();
    await expect(row!.scrollWidth).toBeGreaterThan(row!.clientWidth);
    await expect(getComputedStyle(row!).scrollbarWidth).toBe("none");
    const active = canvasElement.querySelector<HTMLElement>(
      '.ui-workspace-tab[data-active="true"]',
    );
    const icon = active?.querySelector<HTMLElement>(".ui-workspace-tab__icon");
    const close = active?.querySelector<HTMLElement>(
      ".ui-workspace-tab__close",
    );
    await expect(icon).not.toBeNull();
    await expect(close).not.toBeNull();
    await expect(icon!.getBoundingClientRect().right).toBeLessThanOrEqual(
      close!.getBoundingClientRect().left,
    );
  }}
  parameters={{
    visualDelta: withLapisStorybookReference(
      "/visual-baselines/workspace/tabs/constrained-hidden-scrollbar-row-chromium-darwin.png",
      "workspace-shell-components-tabs--constrained-chromium-darwin.png",
    ),
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
