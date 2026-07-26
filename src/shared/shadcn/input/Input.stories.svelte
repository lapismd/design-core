<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Input } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Input",
    component: Input,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned single-line input. Pair with Field when composing structured forms.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let name = $state("Northstar");
</script>

<Story
  name="Edits a single-line value"
  play={async ({ canvas }) => {
    const input = canvas.getByLabelText("Display name");
    await userEvent.clear(input);
    await userEvent.type(input, "Personal");
    await expect(canvas.getByRole("status")).toHaveTextContent("Personal");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <label class="text-sm font-medium" for="catalog-display-name"
        >Display name</label
      >
      <Input id="catalog-display-name" bind:value={name} />
      <output class="text-muted-foreground text-sm">{name}</output>
    </div>
  {/snippet}
</Story>
