<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Tooltip from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Tooltip",
    component: Tooltip.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Brief hover/focus hint for icon buttons and dense controls.",
        },
      },
    },
  });
</script>

<Story
  name="Shows on focus"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Save draft" });
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute("data-state", "instant-open");
    await expect(trigger).toHaveAttribute("aria-describedby");
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/tooltip/shows-on-focus-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline" aria-label="Save draft">
              Save
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>Save draft</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  {/snippet}
</Story>
