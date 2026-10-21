<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import ReferenceChip from "./ReferenceChip.svelte";
  import Fixture from "./ReferenceChip.stories.fixture.svelte";
  import { Basic } from "./ReferenceChip.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Data/Reference Chip",
    component: ReferenceChip,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="References actions and removal"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /^Design\ brief$/ }),
    );
    await expect(canvas.getByTestId("chip-result")).toHaveTextContent("opened");
    await expect(
      canvas.getByRole("button", { name: "Unavailable" }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole("button", { name: "Remove Selected context" }),
    );
    await expect(canvas.queryByText("Selected context")).toBeNull();
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Full label tooltip"
  play={async ({ canvas }) => {
    const target = canvas.getByLabelText(
      "A very long supplied reference label that must retain its complete text",
    );
    target.focus();
    await expect(
      await within(document.body).findByRole("tooltip"),
    ).toHaveTextContent("Full reference description");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
