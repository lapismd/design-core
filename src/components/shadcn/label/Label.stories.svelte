<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Label } from "./index.js";
  import { Input } from "../input/index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Label",
    component: Label,
    parameters: {
      docs: {
        description: {
          component: "Accessible label for form controls.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
</script>

<Story
  name="Associates with an input"
  play={async ({ canvas }) => {
    await userEvent.type(canvas.getByLabelText("Email"), "a@b.co");
    await expect(canvas.getByRole("status")).toHaveTextContent("a@b.co");
  }}
>
  {#snippet template()}
    <div class="flex max-w-sm flex-col gap-2">
      <Label for="catalog-email">Email</Label>
      <Input id="catalog-email" bind:value />
      <output class="text-muted-foreground text-sm">{value || "empty"}</output>
    </div>
  {/snippet}
</Story>
