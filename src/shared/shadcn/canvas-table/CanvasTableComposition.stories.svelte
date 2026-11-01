<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { CanvasTable } from "./index.js";
  import DisplayDemo from "./CanvasTableDisplay.stories.fixture.svelte";
  import Demo from "./CanvasTableComposition.stories.fixture.svelte";
  import {
    Composable,
    Editable,
    Display,
  } from "./CanvasTableComposition.example-sources.js";
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
    const expand = await c.findByRole("button", { name: "Expand row 1" });
    await expect(expand.querySelector("svg")).toHaveClass(
      "lucide-chevron-right",
    );
    await userEvent.click(expand);
    await expect(
      c.getByRole("button", { name: "Collapse row 1" }).querySelector("svg"),
    ).toHaveClass("lucide-chevron-down");
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
      name: /^Select row 2$/,
    });
    await userEvent.click(radio);
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent(/^2$/);
    await userEvent.click(radio);
    await expect(c.getByLabelText("Selected IDs")).toHaveTextContent(/^$/);
    await expect(radio).not.toBeChecked();
  }}>{#snippet template()}<Demo single optional />{/snippet}</Story
>

<Story
  name="Controlled display"
  parameters={{
    docs: { source: { code: Display, language: "tsx", type: "code" } },
  }}
  play={async ({ canvasElement }) => {
    const c = within(canvasElement);
    const cell = c.getByRole("gridcell");
    const height = cell.getBoundingClientRect().height;
    const colour = getComputedStyle(cell).color;
    const header = c.getByRole("columnheader");
    const headerColour = getComputedStyle(header).backgroundColor;
    const headerText = getComputedStyle(header).color;
    await userEvent.click(c.getByRole("button", { name: "Wrap text" }));
    await expect(cell.getBoundingClientRect().height).toBeGreaterThan(height);
    await expect(getComputedStyle(cell).whiteSpace).toBe("pre-wrap");
    await userEvent.click(c.getByRole("button", { name: "Column colours" }));
    await expect(getComputedStyle(cell).color).not.toBe(colour);
    await expect(getComputedStyle(header).backgroundColor).not.toBe(
      headerColour,
    );
    await expect(getComputedStyle(header).color).not.toBe(headerText);
    await userEvent.click(c.getByRole("button", { name: "Wrap text" }));
    await userEvent.click(c.getByRole("button", { name: "Column colours" }));
    await expect(cell.getBoundingClientRect().height).toBe(height);
    await expect(getComputedStyle(cell).color).toBe(colour);
  }}>{#snippet template()}<DisplayDemo />{/snippet}</Story
>

<Story
  name="Editable rich table"
  parameters={{
    docs: { source: { code: Editable, language: "tsx", type: "code" } },
  }}>{#snippet template()}<Demo editable />{/snippet}</Story
>
