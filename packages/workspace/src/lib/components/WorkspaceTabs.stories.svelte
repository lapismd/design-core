<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent } from "storybook/test";
  import WorkspaceTabs from "./WorkspaceTabs.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Workspace Tabs",
    component: WorkspaceTabs,
    parameters: {
      docs: {
        description: {
          component:
            "Selectable, closable tab panes with consumer-owned tab creation.",
        },
      },
    },
  });
</script>

<script lang="ts">
  import type { WorkspaceTabsNode } from "../core/types";
  import { createDemoController } from "./stories/fixtures";
  import WorkspaceLapisReference from "./stories/WorkspaceLapisReference.svelte";

  let controller = $state(
    createDemoController({
      version: 1,
      left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      main: {
        kind: "tabs",
        id: "tabs",
        activeTabId: "notes",
        presentation: "top",
        tabs: [
          { id: "notes", title: "Notes", view: { type: "story", state: {} } },
          {
            id: "details",
            title: "Details",
            view: { type: "story", state: {} },
          },
        ],
      },
    }),
  );
  let overflowController = $state(
    createDemoController({
      version: 1,
      left: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      right: { open: false, size: 280, activeTabId: null, collapsedGroups: {} },
      main: {
        kind: "tabs",
        id: "overflow-tabs",
        activeTabId: "tab-1",
        presentation: "top",
        tabs: Array.from({ length: 12 }, (_, index) => ({
          id: `tab-${index + 1}`,
          title: `Workspace tab ${index + 1}`,
          view: { type: "story", state: {} },
        })),
      },
    }),
  );
</script>

<Story
  name="Adds selects and closes"
  play={async ({ canvas, canvasElement }) => {
    const details = canvas.getByRole("tab", { name: "Details" });
    const detailsContainer = details.closest<HTMLElement>(
      '[data-ui-part="tab"]',
    );
    if (!detailsContainer) throw new Error("Details tab container not found");
    const closeDetails = canvasElement.querySelector<HTMLButtonElement>(
      'button[aria-label="Close Details"]',
    );
    if (!closeDetails) throw new Error("Details close button not found");
    await fireEvent.pointerEnter(detailsContainer);
    await expect(getComputedStyle(closeDetails).visibility).toBe("visible");

    const notes = canvas.getByRole("tab", { name: "Notes" });
    const notesContainer = notes.closest<HTMLElement>('[data-ui-part="tab"]');
    const tabList = notes.closest<HTMLElement>('[role="tablist"]');
    if (!notesContainer || !tabList) {
      throw new Error("Tab drag targets not found");
    }
    const dataTransfer = new DataTransfer();
    details.dispatchEvent(
      new DragEvent("dragstart", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    notesContainer.dispatchEvent(
      new DragEvent("dragover", {
        bubbles: true,
        cancelable: true,
        clientX: notesContainer.getBoundingClientRect().left,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await expect(notesContainer).toHaveAttribute("data-drop-before", "true");
    tabList.dispatchEvent(
      new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer,
      }),
    );
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
    await expect(
      canvas.getAllByRole("tab").map((tab) => tab.textContent?.trim()),
    ).toEqual(["Details", "Notes"]);

    await userEvent.click(details);
    await expect(details).toHaveAttribute("aria-selected", "true");
    await expect(canvas.getByText("Details view")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Add tab" }));
    await expect(canvas.getByRole("tab", { name: "New tab" })).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close New tab" }),
    );
    await expect(
      canvas.queryByRole("tab", { name: "New tab" }),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <WorkspaceLapisReference>
      <div data-ui-component="workspace-tabs-story" data-ui-part="host">
        <WorkspaceTabs
          {controller}
          group={controller.layout.main as WorkspaceTabsNode}
          createTab={() => ({
            id: "new-tab",
            title: "New tab",
            view: { type: "story", state: {} },
          })}
        />
      </div>
    </WorkspaceLapisReference>
  {/snippet}
</Story>

<Story
  name="Many tabs without native scrollbars"
  play={async ({ canvasElement }) => {
    const list = canvasElement.querySelector<HTMLElement>(
      '[data-workspace-part="tab-list"]',
    );
    if (!list) throw new Error("Tab list not found");
    const style = getComputedStyle(list);
    await expect(style.overflowX).toBe("auto");
    await expect(style.overflowY).toBe("hidden");
    await expect(style.scrollbarWidth).toBe("none");
    await expect(list.scrollHeight).toBeLessThanOrEqual(list.clientHeight);
  }}
>
  {#snippet template()}
    <WorkspaceLapisReference>
      <div
        data-ui-component="workspace-tabs-story"
        data-ui-part="host"
        data-scenario="overflow"
      >
        <WorkspaceTabs
          controller={overflowController}
          group={overflowController.layout.main as WorkspaceTabsNode}
        />
      </div>
    </WorkspaceLapisReference>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="workspace-tabs-story"][data-ui-part="host"]) {
    height: 24rem;
    border: 1px solid var(--border);
  }

  :global(
      [data-ui-component="workspace-tabs-story"][data-scenario="overflow"]
    ) {
    width: 22rem;
  }
</style>
