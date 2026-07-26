<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import WorkspaceSidebarToggle from "./WorkspaceSidebarToggle.svelte";

  const { Story } = defineMeta({
    title: "Workspace/Components/Sidebar Toggle",
    component: WorkspaceSidebarToggle,
    parameters: {
      docs: {
        description: {
          component:
            "Source-shaped left and right sidebar visibility control with serializable F-mode hint metadata.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let selected = $state("No sidebar selected");
</script>

<Story
  name="Both sidebar directions"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle right sidebar" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Right sidebar selected",
    );
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-2">
      <WorkspaceSidebarToggle
        side="left"
        label="Toggle left sidebar"
        onSelect={() => (selected = "Left sidebar selected")}
      />
      <WorkspaceSidebarToggle
        side="right"
        label="Toggle right sidebar"
        onSelect={() => (selected = "Right sidebar selected")}
      />
      <output class="sr-only">{selected}</output>
    </div>
  {/snippet}
</Story>
