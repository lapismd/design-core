<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ScreenFrame from "./ScreenFrame.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens/Screen Frame",
    component: ScreenFrame,
    parameters: {
      docs: {
        description: {
          component:
            "Fixed Fava-reference frame with host-owned route actions and colour-mode request.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("");
</script>

<Story
  name="Requests colour-mode change"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Toggle theme" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Theme toggle requested",
    );
  }}
>
  {#snippet template()}
    <ScreenFrame
      pageTitle="Dashboard"
      onThemeToggle={() => {
        action = "Theme toggle requested";
      }}
    >
      <div class="bc-screen-frame-story__content">Screen content</div>
      <output class="bc-screen-frame-story__status" aria-live="polite"
        >{action}</output
      >
    </ScreenFrame>
  {/snippet}
</Story>

<style>
  .bc-screen-frame-story__content {
    padding: var(--ui-beancount-space-6);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-screen-frame-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
