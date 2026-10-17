<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within, waitFor } from "storybook/test";
  import QuantityInput from "./QuantityInput.svelte";
  import Fixture from "./QuantityInput.stories.fixture.svelte";
  import { Basic } from "./QuantityInput.example-sources.js";
  const { Story } = defineMeta({
    title: "UI Forms/Quantity Input",
    component: QuantityInput,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: Basic, language: "tsx", type: "code" } },
    },
  });
</script>

<Story
  name="Display units preserve canonical value"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Capacity unit" }),
    );
    await userEvent.click(
      await within(document.body).findByRole("option", { name: /^KiB$/ }),
    );
    await expect(
      canvas.getByRole("spinbutton", { name: "Capacity" }),
    ).toHaveValue(1024);
    await expect(canvas.getByTestId("quantity-edits")).toHaveTextContent("0");
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story
  name="Invalid drafts and reset"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("spinbutton", { name: "Capacity" });
    await userEvent.clear(input);
    await userEvent.type(input, "0.1");
    await expect(input).toHaveValue(0.1);
    await expect(input).toHaveAttribute("aria-invalid", "true");
    await expect(canvas.getByTestId("quantity-value")).toHaveTextContent("NaN");
    await userEvent.click(
      canvas.getByRole("button", { name: "Reset Capacity to default" }),
    );
    await expect(canvas.getByTestId("quantity-value")).toHaveTextContent(
      "1048576",
    );
    await waitFor(() => expect(input).toHaveFocus());
  }}>{#snippet template()}<Fixture />{/snippet}</Story
>
<Story name="Large slider range"
  >{#snippet template()}<Fixture large />{/snippet}</Story
>
<Story name="Disabled"
  >{#snippet template()}<Fixture disabled />{/snippet}</Story
>
