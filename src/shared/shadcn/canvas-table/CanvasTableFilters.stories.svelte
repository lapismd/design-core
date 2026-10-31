<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { CanvasTable } from "./index.js";
  import Demo from "./CanvasTableFilters.stories.fixture.svelte";
  import { StructuredFilters } from "./CanvasTableFilters.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data Display/Canvas Table",
    component: CanvasTable,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        source: { code: StructuredFilters, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story
  name="Structured filters"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: "Filter rows" }));
    await userEvent.type(
      body.getByRole("textbox", { name: "Name filter value" }),
      "Record 24",
    );
    await expect(canvas.getByLabelText("Filter count")).toHaveTextContent(
      "1 root conditions",
    );
    await userEvent.click(body.getByRole("button", { name: "Clear filters" }));
    await expect(canvas.getByLabelText("Filter count")).toHaveTextContent(
      "0 root conditions",
    );
    await userEvent.keyboard("{Escape}");
  }}>{#snippet template()}<Demo />{/snippet}</Story
>
<Story name="Detected column types"
  >{#snippet template()}<Demo />{/snippet}</Story
>
<Story name="Explicit filter types"
  >{#snippet template()}<Demo explicit />{/snippet}</Story
>
<Story name="Large filtered dataset"
  >{#snippet template()}<Demo large />{/snippet}</Story
>
<Story name="Narrow filter popover"
  >{#snippet template()}<Demo narrow />{/snippet}</Story
>
<Story name="Independent filtered tables"
  >{#snippet template()}<Demo /><Demo />{/snippet}</Story
>
