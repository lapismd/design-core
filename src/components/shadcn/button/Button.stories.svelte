<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Button",
    component: Button,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned shadcn-svelte button. Prefer semantic variants and sizes over ad-hoc button styling.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let saved = $state(false);
</script>

<Story
  name="Variants and action feedback"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Save changes" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Changes saved");
  }}
>
  {#snippet template()}
    <div class="flex flex-wrap items-center gap-3">
      <Button onclick={() => (saved = true)}>Save changes</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Remove</Button>
      <output class="basis-full text-sm text-muted-foreground">
        {saved ? "Changes saved" : "Changes not saved"}
      </output>
    </div>
  {/snippet}
</Story>
