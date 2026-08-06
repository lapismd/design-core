<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import UnreadDivider from "./UnreadDivider.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Experimental/Unread Divider",
    component: UnreadDivider,
    parameters: {
      docs: {
        description: {
          component:
            "Experimental semantic separator marking the first unread message.",
        },
      },
    },
  });
</script>

<Story
  name="Marks unread messages"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/experimental/unread-divider/marks-unread-messages-chromium.png",
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
    <div data-story="unread-frame">
      <UnreadDivider label="Unread" />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="unread-frame"]) {
    width: min(36rem, 90vw);
  }
</style>
