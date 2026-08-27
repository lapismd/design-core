<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import {
    expect,
    fireEvent,
    userEvent,
    waitFor,
    within,
  } from "storybook/test";
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

<Story
  name="Compact popover palette"
  tags={["visual-pending", "test"]}
  play={async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Group color picker" });
    await userEvent.click(trigger);
    const preset = await page.findByRole("button", { name: "Use #16a34a" });
    const triggerBounds = trigger.getBoundingClientRect();
    const content = preset.closest<HTMLElement>(
      '[data-ui-part="popover-content"]',
    );
    await expect(content).not.toBeNull();
    const contentBounds = content!.getBoundingClientRect();
    await expect(
      Math.min(
        Math.abs(contentBounds.top - triggerBounds.bottom),
        Math.abs(contentBounds.bottom - triggerBounds.top),
        Math.abs(contentBounds.left - triggerBounds.right),
        Math.abs(contentBounds.right - triggerBounds.left),
      ),
    ).toBeLessThanOrEqual(8);
    await userEvent.click(preset);
    await expect(canvas.getByRole("status")).toHaveTextContent("#16a34a");
    const anyColor = page.getByLabelText("Group any color");
    await expect(anyColor).toHaveValue("#16a34a");
    (anyColor as HTMLInputElement).value = "#0ea5e9";
    await fireEvent.input(anyColor);
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("#0ea5e9"),
    );
    const value = page.getByLabelText("Group color value");
    await userEvent.clear(value);
    await userEvent.type(value, "#112233");
    await waitFor(() =>
      expect(canvas.getByRole("status")).toHaveTextContent("#112233"),
    );
  }}
>
  {#snippet template()}
    <div style="padding: 4rem;">
      <ColorPicker
        value={color}
        ariaLabel="Group"
        presentation="popover"
        presets={["#3b82f6", "#16a34a", "#d97706", "#9333ea", "#db2777"]}
        onChange={(next) => {
          color = next;
        }}
      />
      <output>{color}</output>
    </div>
  {/snippet}
</Story>
