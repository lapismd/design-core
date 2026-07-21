<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Accordion from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Disclosure/Accordion",
    component: Accordion.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Stacked expandable sections for FAQs and grouped details.",
        },
      },
    },
  });
</script>

<Story
  name="Opens a section"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Shipping" }));
    await expect(canvas.getByText("Arrives in 2-3 days")).toBeVisible();
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <Accordion.Root type="single" class="max-w-md">
      <Accordion.Item value="shipping">
        <Accordion.Trigger>Shipping</Accordion.Trigger>
        <Accordion.Content>Arrives in 2-3 days</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Trigger>Returns</Accordion.Trigger>
        <Accordion.Content>30-day return window</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/snippet}
</Story>
