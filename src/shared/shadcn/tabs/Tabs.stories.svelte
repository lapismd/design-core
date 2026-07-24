<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Tabs from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Disclosure/Tabs",
    component: Tabs.Root,
    parameters: {
      docs: {
        description: {
          component: "Tabbed navigation between related views.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("overview");
</script>

<Story
  name="Switches panels"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Details" }));
    await expect(canvas.getByText("Details panel")).toBeVisible();
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <Tabs.Root bind:value class="max-w-md">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="overview">Overview panel</Tabs.Content>
      <Tabs.Content value="details">Details panel</Tabs.Content>
    </Tabs.Root>
  {/snippet}
</Story>
