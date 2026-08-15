<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Accordion from "./index.js";
  import { StartIndicator } from "./Accordion.story-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Disclosure/Accordion",
    component: Accordion.Root,
    parameters: {
      docs: {
        description: {
          component:
            "Stacked expandable sections for FAQs and grouped details.",
        },
      },
    },
  });
</script>

<Story
  name="Opens a section"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Shipping" }));
    await expect(canvas.getByText("Arrives in 2-3 days")).toBeVisible();
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/accordion/opens-a-section-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Accordion.Root type="single" class="max-w-md">
      <Accordion.Item value="shipping">
        <Accordion.Trigger>Shipping</Accordion.Trigger>
        <Accordion.Content>Arrives in 2-3 days</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Trigger>Returns</Accordion.Trigger>
        <Accordion.Content>30-day return window</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/snippet}
</Story>

<Story
  name="Uses a leading disclosure indicator"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "All views" });
    const collapsedIndicator = trigger.querySelector<SVGElement>(
      '[data-ui-part="accordion-collapsed-icon"]',
    );
    const label = trigger.querySelector<HTMLElement>("span");

    await expect(trigger).toHaveAttribute("data-indicator-position", "start");
    await expect(trigger).toHaveAttribute(
      "data-indicator-variant",
      "disclosure",
    );
    await expect(collapsedIndicator).toHaveAttribute(
      "data-indicator-glyph",
      "chevron-right",
    );
    await expect(collapsedIndicator).toBeVisible();
    await expect(
      collapsedIndicator!.getBoundingClientRect().right,
    ).toBeLessThan(label!.getBoundingClientRect().left);
    await userEvent.click(trigger);
    const expandedIndicator = trigger.querySelector<SVGElement>(
      '[data-ui-part="accordion-expanded-icon"]',
    );
    await expect(expandedIndicator).toHaveAttribute(
      "data-indicator-glyph",
      "chevron-down",
    );
    await expect(expandedIndicator).toBeVisible();
    await expect(canvas.getByText("Shared filters")).toBeVisible();
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: StartIndicator,
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <Accordion.Root type="single" class="max-w-md">
      <Accordion.Item value="all-views">
        <Accordion.Trigger
          indicatorPosition="start"
          indicatorVariant="disclosure"
        >
          <span>All views</span>
        </Accordion.Trigger>
        <Accordion.Content>Shared filters</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  {/snippet}
</Story>
