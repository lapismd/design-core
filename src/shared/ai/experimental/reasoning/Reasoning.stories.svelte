<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Reasoning from "./Reasoning.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Experimental/Reasoning",
    component: Reasoning,
    parameters: {
      docs: {
        description: {
          component:
            "Experimental compact reasoning disclosure with controlled expansion and streaming state.",
        },
      },
    },
  });
</script>

<Story
  name="Expands reasoning"
  play={async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: /Thinking/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByText(/constraints before choosing/)).toBeVisible();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/reasoning/expands-reasoning-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="experimental-frame">
      <Reasoning
        duration="12s"
        preview="I should compare the constraints first."
      >
        {#snippet children()}
          I compared the constraints before choosing the smallest reversible
          change.
        {/snippet}
      </Reasoning>
    </div>
  {/snippet}
</Story>

<Story
  name="Streams reasoning"
  play={async ({ canvasElement }) => {
    const icon = canvasElement.querySelector(
      '[data-ui-component="ai-chat-reasoning"][data-streaming="true"] [data-ui-part="reasoning-icon"]',
    );
    expect(icon).not.toBeNull();
    const styles = getComputedStyle(icon!);
    expect(styles.animationName).not.toBe("none");
    expect(styles.animationIterationCount).toBe("infinite");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/reasoning/streams-reasoning-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="experimental-frame">
      <Reasoning streaming preview="This preview stays hidden while streaming.">
        {#snippet children()}
          Inspecting the available tools and preparing a response…
        {/snippet}
      </Reasoning>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="experimental-frame"]) {
    width: min(38rem, 90vw);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--background);
    padding: 1rem;
    color: var(--foreground);
  }
</style>
