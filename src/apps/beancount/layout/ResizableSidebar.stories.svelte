<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ResizableSidebar from "./ResizableSidebar.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Layout/Resizable Sidebar",
    component: ResizableSidebar,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled, accessible sidebar resize rail. Persist `width` in the application if required; this primitive owns pointer and keyboard resize mechanics, constraints, and shared Studio styling. Use it alongside App Shell rather than rewriting a local resize handle.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let width = $state(256);
</script>

<Story
  name="Resizes with keyboard controls"
  play={async ({ canvas }) => {
    const slider = canvas.getByRole("slider", { name: "Resize sidebar" });
    slider.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect(slider).toHaveAttribute("aria-valuenow", "288");
    await expect(canvas.getByRole("status")).toHaveTextContent("288 pixels");
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/apps/beancount/layout/resizes-with-keyboard-controls-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
>
  {#snippet template()}
    <div class="bc-resizable-sidebar-story">
      <ResizableSidebar bind:width>
        <div class="bc-resizable-sidebar-story__sidebar-content">
          <p class="bc-resizable-sidebar-story__title">Northstar Ledger</p>
          <p class="bc-resizable-sidebar-story__detail">Workspace navigation</p>
        </div>
      </ResizableSidebar>
      <div class="bc-resizable-sidebar-story__workspace">
        <output aria-live="polite">Sidebar width: {width} pixels</output>
      </div>
    </div>
  {/snippet}
</Story>

<style>
  .bc-resizable-sidebar-story {
    display: flex;
    max-width: 48rem;
    height: 18rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
  }

  .bc-resizable-sidebar-story__sidebar-content {
    display: flex;
    height: 100%;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4);
  }

  .bc-resizable-sidebar-story__title,
  .bc-resizable-sidebar-story__detail {
    margin: 0;
    font-size: var(--text-sm);
  }

  .bc-resizable-sidebar-story__title {
    font-weight: var(--font-weight-semibold);
  }

  .bc-resizable-sidebar-story__detail,
  .bc-resizable-sidebar-story__workspace {
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-resizable-sidebar-story__workspace {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: calc(var(--ui-beancount-space-3) * 2);
    font-size: var(--text-sm);
  }
</style>
