<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Sidebar from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Sidebar",
    component: Sidebar.Provider,
    parameters: {
      docs: {
        description: {
          component: "App sidebar shell primitives used by studio workspaces.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  let open = $state(true);
</script>

<Story
  name="Provider with trigger"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Navigation")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Toggle Sidebar" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}

  tags={["visual-failed"]}
>
  {#snippet template()}
    <Sidebar.Provider bind:open class="min-h-[240px]">
      <Sidebar.Root>
        <Sidebar.Header>Navigation</Sidebar.Header>
        <Sidebar.Content class="text-muted-foreground p-3 text-sm">
          Overview
        </Sidebar.Content>
        <Sidebar.Footer>v0.1</Sidebar.Footer>
      </Sidebar.Root>
      <Sidebar.Inset class="flex flex-1 items-start gap-3 p-4">
        <Sidebar.Trigger />
        <div class="flex flex-col gap-2">
          <p class="text-sm">Main content</p>
          <output class="text-muted-foreground text-sm">
            {open ? "open" : "closed"}
          </output>
        </div>
      </Sidebar.Inset>
    </Sidebar.Provider>
  {/snippet}
</Story>
