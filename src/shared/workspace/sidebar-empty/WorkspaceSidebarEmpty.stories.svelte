<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSidebarEmpty from "./WorkspaceSidebarEmpty.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Empty Sidebar",
    component: WorkspaceSidebarEmpty,
    parameters: {
      docs: {
        description: {
          component:
            "Special Lapis-aligned fallback for a visible sidebar that has no tabs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let closed = $state(false);
</script>

<Story
  name="Empty left sidebar"
  tags={["visual-approved"]}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Heads up!" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close left sidebar" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sidebar closed",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar-empty/empty-left-sidebar-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="h-[28rem] w-80 border">
      {#if !closed}
        <WorkspaceSidebarEmpty side="left" onClose={() => (closed = true)} />
      {/if}
    </div>
    <output class="sr-only">
      {closed ? "Sidebar closed" : "Sidebar open"}
    </output>
  {/snippet}
</Story>

<Story
  name="Empty right sidebar"
  tags={["visual-approved"]}
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-workspace-sidebar-empty="right"]'),
    ).not.toBeNull();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar-empty/empty-right-sidebar-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="h-[28rem] w-80 border">
      <WorkspaceSidebarEmpty side="right" onClose={() => undefined} />
    </div>
  {/snippet}
</Story>
