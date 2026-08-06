<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import { Toggle } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Toggle",
    component: Toggle,
    parameters: {
      docs: {
        description: {
          component: "Pressed/unpressed toggle for formatting and filters.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let pressed = $state(false);
</script>

<Story
  name="Toggles pressed state"
  play={async ({ canvas }) => {
    const button = canvas.getByRole("button", { name: "Bold" });
    await userEvent.click(button);
    await expect(button).toHaveAttribute("data-state", "on");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/toggle/toggles-pressed-state-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Toggle bind:pressed aria-label="Bold">Bold</Toggle>
  {/snippet}
</Story>
