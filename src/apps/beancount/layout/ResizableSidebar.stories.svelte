<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ResizableSidebar from "./ResizableSidebar.svelte";

  const { Story } = defineMeta({
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
>
  {#snippet template()}
    <div
      class="bg-background flex h-72 max-w-3xl overflow-hidden rounded-xl border"
    >
      <ResizableSidebar bind:width>
        <div class="flex h-full flex-col gap-3 p-4">
          <p class="text-sm font-semibold">Northstar Ledger</p>
          <p class="text-muted-foreground text-sm">Workspace navigation</p>
        </div>
      </ResizableSidebar>
      <div
        class="text-muted-foreground flex min-w-0 flex-1 items-center justify-center p-6 text-sm"
      >
        <output aria-live="polite">Sidebar width: {width} pixels</output>
      </div>
    </div>
  {/snippet}
</Story>
