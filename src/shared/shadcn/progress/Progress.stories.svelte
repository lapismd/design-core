<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Progress } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Progress",
    component: Progress,
    parameters: {
      docs: {
        description: {
          component:
            "UI-owned progress bar for installs and long-running tasks.",
        },
      },
    },
  });
</script>

<Story
  name="Default"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const bar = canvas.getByRole("progressbar");
    await expect(bar).toBeVisible();
    await expect(bar).toHaveAttribute("aria-valuenow", "60");
  }}
>
  {#snippet template()}
    <div class="w-64">
      <Progress value={60} max={100} aria-label="Install progress" />
    </div>
  {/snippet}
</Story>
