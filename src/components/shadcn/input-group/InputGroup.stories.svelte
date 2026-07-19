<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as InputGroup from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Input Group",
    component: InputGroup.Root,
    parameters: {
      docs: {
        description: {
          component: "Input with leading/trailing addons for units and actions.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let amount = $state("120");
</script>

<Story
  name="Addon and input"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Amount");
    await userEvent.clear(input);
    await userEvent.type(input, "250");
    await expect(canvas.getByRole("status")).toHaveTextContent("250");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <InputGroup.Root>
        <InputGroup.Addon>USD</InputGroup.Addon>
        <InputGroup.Input aria-label="Amount" bind:value={amount} />
      </InputGroup.Root>
      <output class="text-sm text-muted-foreground">{amount}</output>
    </div>
  {/snippet}
</Story>
