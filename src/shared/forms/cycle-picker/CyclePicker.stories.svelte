<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Basic } from "./CyclePicker.example-sources";
  import CyclePicker from "./CyclePicker.svelte";

  const themes = [
    { value: "classic", label: "Classic" },
    { value: "moderncv", label: "ModernCV" },
    {
      value: "opal",
      label: "Opal with a deliberately long theme name",
    },
  ];

  const fonts = [
    { value: "EB Garamond", label: "EB Garamond" },
    { value: "Fontin", label: "Fontin" },
    { value: "Source Sans 3", label: "Source Sans 3" },
  ];

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Cycle Picker",
    component: CyclePicker,
    parameters: {
      docs: {
        description: {
          component:
            "Compact previous/current/next option control with an expandable option list and optional font previews.",
        },
        source: { code: Basic, language: "ts", type: "code" },
      },
    },
  });
</script>

<script lang="ts">
  let theme = $state("moderncv");
  let font = $state("Fontin");
</script>

<Story
  name="Cycles and reveals options"
  play={async ({ canvas }) => {
    const previous = canvas.getByRole("button", { name: "Previous Theme" });
    const current = canvas.getByRole("button", { name: "Select Theme" });
    const next = canvas.getByRole("button", { name: "Next Theme" });
    await expect(
      getComputedStyle(previous.parentElement as HTMLElement).gap,
    ).toBe("2px");
    for (const control of [previous, current, next]) {
      await expect(control).toHaveAttribute("data-variant", "ghost");
      await expect(getComputedStyle(control).borderRadius).toBe("8px");
      await expect(getComputedStyle(control).borderTopColor).toBe(
        "rgba(0, 0, 0, 0)",
      );
    }
    await expect(current.querySelector("svg")).toBeNull();
    await userEvent.click(next);
    const label = current.querySelector(
      ".ui-cycle-picker__current-content > span:last-child",
    ) as HTMLElement;
    await expect(getComputedStyle(label).textOverflow).toBe("ellipsis");
    await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
    await expect(canvas.getByRole("status")).toHaveTextContent("opal");
    await userEvent.click(canvas.getByRole("button", { name: "Select Theme" }));
    await userEvent.click(canvas.getByRole("option", { name: "Classic" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("classic");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="p-4">
      <CyclePicker
        value={theme}
        options={themes}
        ariaLabel="Theme"
        onChange={(next) => {
          theme = next;
        }}
      />
      <output class="sr-only">{theme}</output>
    </div>
  {/snippet}
</Story>

<Story name="Previews fonts" tags={["visual-ready"]}>
  {#snippet template()}
    <div class="p-4">
      <CyclePicker
        value={font}
        options={fonts}
        ariaLabel="Body font"
        preview="font"
        onChange={(next) => {
          font = next;
        }}
      />
    </div>
  {/snippet}
</Story>
