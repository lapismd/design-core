<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as ButtonGroup from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Button Group",
    component: ButtonGroup.Root,
    parameters: {
      docs: {
        description: {
          component: "Grouped related actions in a shared control cluster.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let last = $state("none");
</script>

<Story
  name="Grouped actions"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Archive" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Archive");
  }}
  tags={["visual-pending"]}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/button-group/grouped-actions-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
>
  {#snippet template()}
    <div class="flex flex-col gap-3">
      <ButtonGroup.Root>
        <Button variant="outline" onclick={() => (last = "Copy")}>Copy</Button>
        <Button variant="outline" onclick={() => (last = "Archive")}
          >Archive</Button
        >
        <Button variant="outline" onclick={() => (last = "Delete")}
          >Delete</Button
        >
      </ButtonGroup.Root>
      <output class="text-muted-foreground text-sm">{last}</output>
    </div>
  {/snippet}
</Story>
