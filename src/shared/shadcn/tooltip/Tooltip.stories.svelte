<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import { Button } from "../button/index.js";
  import * as Tooltip from "./index.js";
  import { CustomSizing } from "./Tooltip.sizing.example-sources.js";

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

<!-- Interaction story first so vitest doesn't inherit an open portal from the visual story. -->
<Story
  name="Shows on focus"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Save draft" });
    await userEvent.hover(trigger);
    await expect(trigger).toHaveAttribute("data-state", "instant-open");
    await expect(trigger).toHaveAttribute("aria-describedby");
    const content = within(document.body).getByText("Save draft");
    const contentStyle = getComputedStyle(content);
    await expect(contentStyle.fontSize).toBe("12px");
    await expect(contentStyle.lineHeight).toBe("16px");
    await expect(contentStyle.paddingBlockStart).toBe("6px");
    await expect(contentStyle.paddingInlineStart).toBe("12px");
    await expect(content.getBoundingClientRect().height).toBe(28);
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
  name="Public sizing tokens remain adjustable"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "Custom hint" });
    await userEvent.hover(trigger);
    const content = within(document.body).getByText("Custom tooltip sizing");
    const style = getComputedStyle(content);
    await expect(style.fontSize).toBe("14px");
    await expect(style.lineHeight).toBe("20px");
    await expect(style.paddingBlockStart).toBe("8px");
    await expect(style.paddingInlineStart).toBe("16px");
    await expect(content.getBoundingClientRect().height).toBe(36);
    await userEvent.unhover(trigger);
  }}
  parameters={{
    docs: {
      source: {
        code: CustomSizing,
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button {...props} variant="outline">Custom hint</Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content
          style="--ui-tooltip-font-size: 0.875rem; --ui-tooltip-line-height: 1.25rem; --ui-tooltip-padding-inline: 1rem; --ui-tooltip-padding-block: 0.5rem;"
          >Custom tooltip sizing</Tooltip.Content
        >
      </Tooltip.Root>
    </Tooltip.Provider>
  {/snippet}
</Story>

<Story
  name="Open tooltip"
  tags={["visual-state", "visual-pending"]}
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
    visualDelta: {
      images: ["/visual-baselines/shadcn/tooltip/open-tooltip-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
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
