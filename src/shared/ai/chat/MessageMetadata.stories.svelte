<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MessageMetadata from "./MessageMetadata.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Message Metadata",
    component: MessageMetadata,
    parameters: {
      docs: {
        description: {
          component:
            "Timestamp, footer, and accessible sending/delivery status presentation.",
        },
      },
    },
  });
</script>

<Story name="Delivery states">
  {#snippet template()}
    <div data-story="metadata-stack">
      <MessageMetadata timestamp="10:41" status="sending" />
      <MessageMetadata timestamp="10:42" status="sent" />
      <MessageMetadata timestamp="10:43" status="delivered" />
      <MessageMetadata timestamp="10:44" status="read" />
      <MessageMetadata timestamp="10:45" status="error" />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="metadata-stack"]) {
    display: flex;
    min-width: 18rem;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
  }
</style>
