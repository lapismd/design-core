<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import IconColorPicker from "./IconColorPicker.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Pickers/Icon & Colour Picker",
    component: IconColorPicker,
    parameters: {
      docs: {
        description: {
          component:
            "The account-appearance editor. It protects icon contrast against the selected tint and uses stored Beancount icon values. It is not a generic colour picker.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let appearance = $state({ color: "#22C55E", icon: "shopping-cart" });
</script>

<Story
  name="Changes an account appearance"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", {
      name: "Choose account colour and icon",
    });
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  }}
>
  {#snippet template()}
    <div class="bc-icon-color-picker-story">
      <IconColorPicker
        color={appearance.color}
        icon={appearance.icon}
        onChange={(next) => (appearance = next)}
      />
      <output class="bc-icon-color-picker-story__status">
        {appearance.color} / {appearance.icon}
      </output>
    </div>
  {/snippet}
</Story>

<style>
  .bc-icon-color-picker-story {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-icon-color-picker-story__status {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }
</style>
