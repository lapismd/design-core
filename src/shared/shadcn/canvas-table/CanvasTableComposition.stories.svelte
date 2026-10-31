<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { CanvasTable } from "./index.js";
  import Demo from "./CanvasTableComposition.stories.fixture.svelte";
  import { Composable } from "./CanvasTableComposition.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data Display/Canvas Table",
    component: CanvasTable,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Composable, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Rich data table"
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      await c.findByRole("button", { name: "Expand row 1" }),
    );
    await expect(c.getByText("Details for Record 1")).toBeVisible();
    await userEvent.click(c.getByRole("button", { name: "Close row details" }));
    await expect(c.queryByText("Details for Record 1")).not.toBeInTheDocument();
    await userEvent.click(
      c.getByRole("checkbox", { name: "Select all filtered rows" }),
    );
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent("40");
    await userEvent.click(c.getByRole("button", { name: "Change page" }));
    await expect(
      c.getByRole("checkbox", { name: "Select row 21" }),
    ).toBeChecked();
  }}>{#snippet template()}<Demo />{/snippet}</Story
>
<Story
  name="Single required selection"
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(
      await c.findByRole("radio", { name: "Select row 2" }),
    );
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent(/^2$/);
  }}>{#snippet template()}<Demo single />{/snippet}</Story
>
<Story name="Large rich table"
  >{#snippet template()}<Demo large />{/snippet}</Story
>

<Story
  name="Optional single selection"
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    const radio = await c.findByRole("radio", {
      name: "Select row 2",
      exact: true,
    });
    await userEvent.click(radio);
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent(/^2$/);
    await userEvent.click(radio);
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent(/^$/);
    await expect(radio).not.toBeChecked();
  }}>{#snippet template()}<Demo single optional />{/snippet}</Story
>
