<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSidebarToggle from "./WorkspaceSidebarToggle.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Sidebar Toggle",
    tags: ["visual-pending"],
    component: WorkspaceSidebarToggle,
    parameters: {
      docs: {
        description: {
          component:
            "Shared PanelToggle styling and fixed standard icons with controlled Workspace visibility and serializable F-mode hint metadata.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("No sidebar selected");
  let leftExpanded = $state(false);
  let rightExpanded = $state(true);
</script>

<Story
  name="Both sidebar directions"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    for (const button of canvas.getAllByRole("button")) {
      await expect(button).toHaveAttribute("data-panel-toggle");
      await expect(button).toHaveAttribute("data-size", "icon-xs");
      await expect(button.getBoundingClientRect().width).toBe(28);
      await expect(
        button.querySelector("svg")!.getBoundingClientRect().width,
      ).toBe(16);
    }
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle right sidebar" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Right sidebar selected",
    );
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/workspace/sidebar-toggle/both-sidebar-directions-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-2">
      <WorkspaceSidebarToggle
        side="left"
        label="Toggle left sidebar"
        expanded={leftExpanded}
        onSelect={() => {
          leftExpanded = !leftExpanded;
          selected = "Left sidebar selected";
        }}
      />
      <WorkspaceSidebarToggle
        side="right"
        label="Toggle right sidebar"
        expanded={rightExpanded}
        onSelect={() => {
          rightExpanded = !rightExpanded;
          selected = "Right sidebar selected";
        }}
      />
      <output class="sr-only">{selected}</output>
    </div>
  {/snippet}
</Story>
