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
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/input-group/addon-and-input-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
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
  tags={["visual-state", "visual-pending"]}
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Amount");
    await userEvent.click(input);
    await userEvent.keyboard("1");
    await expect(input).toHaveFocus();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/input-group/focused-control-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
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

<Story
  name="Divided block addons"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const top = canvas
      .getByText("Subject")
      .closest('[data-slot="input-group-addon"]')!;
    const bottom = canvas
      .getByText("Private draft")
      .closest('[data-slot="input-group-addon"]')!;
    await expect(getComputedStyle(top).borderBottomWidth).toBe("1px");
    await expect(getComputedStyle(bottom).borderTopWidth).toBe("1px");
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Draft" }),
      "Hello",
    );
    await expect(canvas.getByRole("textbox", { name: "Draft" })).toHaveValue(
      "Hello",
    );
  }}
>
  {#snippet template()}
    <InputGroup.Root>
      <InputGroup.Addon align="block-start" data-divided="true"
        >Subject</InputGroup.Addon
      >
      <InputGroup.Textarea aria-label="Draft" />
      <InputGroup.Addon align="block-end" data-divided="true"
        >Private draft</InputGroup.Addon
      >
    </InputGroup.Root>
  {/snippet}
</Story>
