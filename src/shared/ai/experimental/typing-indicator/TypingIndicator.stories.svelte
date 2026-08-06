<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TypingIndicator from "./TypingIndicator.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Experimental/Typing Indicator",
    component: TypingIndicator,
    parameters: {
      docs: {
        description: {
          component:
            "Experimental reduced-motion-safe typing dots with live grammar-aware labels.",
        },
      },
    },
  });
</script>

<Story
  name="Names active typists"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/typing-indicator/names-active-typists-chromium.png",
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
    <div data-story="typing-stack">
      <TypingIndicator names={["Ana"]} />
      <TypingIndicator names={["Ana", "Ben"]} />
      <TypingIndicator names={["Ana", "Ben", "Casey"]} />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="typing-stack"]) {
    display: grid;
    gap: 0.5rem;
  }
</style>
