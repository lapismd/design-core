<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within, waitFor } from "storybook/test";
  import { TagList } from "./index.js";
  import Fixture from "./TagList.stories.fixture.svelte";
  import * as sources from "./TagList.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data Display/Tag List",
    component: TagList,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: sources.Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story name="Overview"
  >{#snippet template()}<Fixture scenario="overview" />{/snippet}</Story
>
<Story
  name="Resize and overflow"
  play={async ({ canvas }) => {
    await waitFor(() =>
      expect(canvas.queryByRole("button", { name: /more tags/ })).toBeNull(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Overflow" }));
    const trigger = await canvas.findByRole("button", { name: /more tags/ });
    await userEvent.click(trigger);
    const popup = await within(document.body).findByRole("dialog", {
      name: "Tags (8)",
    });
    await expect(within(popup).getAllByRole("listitem")).toHaveLength(8);
    await expect(
      within(popup).getByRole("button", { name: "feature" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      within(popup).getByRole("button", { name: "needs-review" }),
    );
    await expect(canvas.getByTestId("tag-action")).toHaveTextContent("review");
    await waitFor(() =>
      expect(within(document.body).queryByRole("dialog")).toBeNull(),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Narrow" }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: /8 more tags/ })).toBeVisible(),
    );
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Long labels and tooltips"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Overflow" }));
    await waitFor(() => {
      const tag = canvas
        .getByTestId("tag-container")
        .querySelector<HTMLElement>('[data-tag-id="long"]');
      expect(tag).not.toBeNull();
      expect(tag).toHaveAttribute("tabindex", "0");
    });
    await userEvent.tab(); // Narrow preset follows the clicked Overflow preset.
    await userEvent.tab(); // The passive, described tag is keyboard reachable.
    const tooltip = await within(document.body).findByRole("tooltip");
    await expect(tooltip).toHaveTextContent(
      "very-long-tag-name-that-keeps-its-entire-label",
    );
    await expect(tooltip).toHaveTextContent(
      "A full description supplied by the host.",
    );
  }}>{#snippet template()}<Fixture scenario="long" />{/snippet}</Story
>
<Story
  name="Sizes and states"
  parameters={{
    docs: { source: { code: sources.Sizes, language: "tsx", type: "code" } },
  }}
  play={async ({ canvas }) => {
    const disabled = await canvas.findAllByRole("button", {
      name: "Disabled",
    });
    await userEvent.click(disabled[0]!);
    await expect(canvas.getByTestId("tag-action")).toHaveTextContent(
      "No action yet",
    );
    await expect(disabled[0]!).toHaveAttribute("aria-disabled", "true");
    const active = canvas.getAllByRole("button", {
      name: "Active",
    })[0]!;
    await userEvent.click(active);
    await expect(active).toHaveAttribute("aria-pressed", "true");
  }}>{#snippet template()}<Fixture scenario="states" />{/snippet}</Story
>
<Story
  name="Live updates and lifecycle"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add tag" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "Reverse order" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Rename first" }));
    await waitFor(() =>
      expect(
        canvas
          .getByTestId("tag-container")
          .querySelector('[data-ui-part="row"] [data-tag-id]'),
      ).toHaveTextContent("extra-1-updated"),
    );
    await userEvent.click(canvas.getByRole("button", { name: "Unmount" }));
    await expect(
      canvas
        .getByTestId("tag-container")
        .querySelector('[data-ui-component="tag-list"]'),
    ).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Mount" }));
  }}>{#snippet template()}<Fixture scenario="lifecycle" />{/snippet}</Story
>
<Story
  name="Empty"
  parameters={{
    docs: { source: { code: sources.Empty, language: "tsx", type: "code" } },
  }}
  play={async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-ui-component="tag-list"]'),
    ).toBeNull();
  }}
>
  {#snippet template()}<TagList tags={[]} />{/snippet}
</Story>
