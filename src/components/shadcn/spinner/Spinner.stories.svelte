<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Spinner } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Spinner",
    component: Spinner,
    parameters: {
      docs: {
        description: {
          component: "Inline loading indicator for buttons and pending states.",
        },
      },
    },
  });
</script>

<Story
  name="Pending indicator"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("Loading")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner aria-label="Loading" />
      Saving changes…
    </div>
  {/snippet}
</Story>
