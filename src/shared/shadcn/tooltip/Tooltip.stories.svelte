<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Tooltip from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Overlays/Tooltip",
    component: Tooltip.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Brief hover/focus hint for icon buttons and dense controls."}}}});
</script>

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Shows on focus"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Save draft" });
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute("data-state", "instant-open");
    await expect(trigger).toHaveAttribute("aria-describedby");
    await userEvent.unhover(trigger);
  }}
  tags={["skip-visual"]}
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

<Story
  name="Open tooltip"
  tags={["visual-state", "visual-approved"]}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Hover" });
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.hover(trigger);
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute("data-state", "instant-open");
      await expect(
        within(document.body).getByText("Add to library"),
      ).toBeVisible();
    });
  }}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/tooltip/open-tooltip-chromium.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right"}}}
>
  {#snippet template()}
    <div class="p-4">
      <!-- Mirrors upstream Preview with delayDuration=0 for stable open visuals. -->
      <Tooltip.Provider delayDuration={0}>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <Button {...props} variant="outline">Hover</Button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content>Add to library</Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  {/snippet}
</Story>
