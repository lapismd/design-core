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
          component:
            "Display additional information or actions to an input or textarea. Upstream example variations are adapted from the [shadcn-svelte Input Group docs](https://shadcn-svelte.com/docs/components/input-group.md).",
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
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <InputGroup.Root>
        <InputGroup.Addon>USD</InputGroup.Addon>
        <InputGroup.Input aria-label="Amount" bind:value={amount} />
      </InputGroup.Root>
      <output class="text-muted-foreground text-sm">{amount}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Focused control"
  tags={["visual-state", "visual-ready"]}
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Amount");
    await userEvent.click(input);
    await userEvent.keyboard("1");
    await expect(input).toHaveFocus();
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2 p-4">
      <InputGroup.Root>
        <InputGroup.Addon>USD</InputGroup.Addon>
        <InputGroup.Input aria-label="Amount" value="120" />
      </InputGroup.Root>
    </div>
  {/snippet}
</Story>
