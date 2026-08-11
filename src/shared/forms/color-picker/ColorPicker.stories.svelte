<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent, userEvent } from "storybook/test";
  import { Basic } from "./ColorPicker.example-sources";
  import ColorPicker from "./ColorPicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Color Picker",
    component: ColorPicker,
    parameters: {
      docs: {
        description: {
          component:
            "Controlled color swatch and text value editor with configurable hex serialization.",
        },
        source: { code: Basic, language: "ts", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  let color = $state("004f90");
</script>

<Story
  name="Edits a color"
  play={async ({ canvas }) => {
    const swatch = canvas.getByLabelText("Name color picker");
    const value = canvas.getByLabelText("Name color value");
    await expect(swatch).toHaveValue("#004f90");
    const swatchBounds = swatch.getBoundingClientRect();
    await expect(
      Math.abs(swatchBounds.width - swatchBounds.height),
    ).toBeLessThan(1);
    await expect(getComputedStyle(swatch).clipPath).toBe("circle(50%)");

    await userEvent.clear(value);
    await userEvent.type(value, "ff0000");
    await expect(canvas.getByRole("status")).toHaveTextContent("ff0000");
    await expect(swatch).toHaveValue("#ff0000");

    (swatch as HTMLInputElement).value = "#112233";
    await fireEvent.input(swatch);
    await expect(canvas.getByRole("status")).toHaveTextContent("112233");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="max-w-md p-4">
      <ColorPicker
        value={color}
        ariaLabel="Name"
        placeholder="rgb(0, 79, 144)"
        format="hex-without-hash"
        onChange={(next) => {
          color = next;
        }}
      />
      <output class="sr-only">{color}</output>
    </div>
  {/snippet}
</Story>
