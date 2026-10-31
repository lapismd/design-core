<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { FilterBuilder } from "./index.js";
  import Demo from "./FilterBuilder.stories.fixture.svelte";
  import { Basic } from "./FilterBuilder.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Forms/Filter Builder",
    component: FilterBuilder,
    tags: ["visual-pending"],
    parameters: {
      docs: {
        description: {
          component:
            "Standalone structured conditions with nested All/Any/None groups. Host-controlled values; no table, raw query or application dependency. See Shadcn/Guidance.",
        },
        source: { code: Basic, language: "tsx", type: "code" },
      },
    },
  });
</script>

<Story
  name="Standalone"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "Name filter value" }),
      "Lapis",
    );
    await expect(canvas.getByLabelText("Applied conditions")).toHaveTextContent(
      "1 root conditions",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Clear filters" }),
    );
    await expect(canvas.getByLabelText("Applied conditions")).toHaveTextContent(
      "0 root conditions",
    );
  }}>{#snippet template()}<Demo />{/snippet}</Story
>
<Story name="Nested groups"
  >{#snippet template()}<Demo nested />{/snippet}</Story
>
<Story name="Typed editors">{#snippet template()}<Demo typed />{/snippet}</Story
>
<Story
  name="Invalid drafts"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("spinbutton", {
      name: "Amount filter value",
    });
    await userEvent.clear(input);
    await expect(
      canvas.getByRole("status", { name: "Filter draft status" }),
    ).toHaveTextContent("Changes not applied");
    await expect(canvas.getByLabelText("Applied conditions")).toHaveTextContent(
      "4 root conditions",
    );
    await userEvent.type(input, "200");
    await expect(
      canvas.queryByRole("status", { name: "Filter draft status" }),
    ).not.toBeInTheDocument();
  }}>{#snippet template()}<Demo typed />{/snippet}</Story
>
<Story name="Narrow"
  >{#snippet template()}<Demo narrow nested />{/snippet}</Story
>
<Story name="No fields">{#snippet template()}<Demo empty />{/snippet}</Story>
<Story name="Independent builders"
  >{#snippet template()}<Demo /><Demo />{/snippet}</Story
>
