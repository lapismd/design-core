<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AiChatTranscript from "./AiChatTranscript.svelte";
  import { sampleAiMessages, sampleReviewChanges } from "./fixtures.js";

  const { Story } = defineMeta({
    title: "AI/AI Chat Transcript",
    component: AiChatTranscript,
    parameters: {
      docs: {
        description: {
          component:
            "Compatibility transcript composed from the AI Chat message primitives and shadcn ScrollArea. Controlled via `messages` — no networking.",
        },
      },
    },
  });
</script>

<Story name="Empty" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="frame">
      <AiChatTranscript messages={[]} />
    </div>
  {/snippet}
</Story>

<Story name="With messages" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="frame">
      <AiChatTranscript messages={sampleAiMessages} />
    </div>
  {/snippet}
</Story>

<Story name="With review summary" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="frame">
      <AiChatTranscript
        messages={sampleAiMessages}
        reviewChanges={sampleReviewChanges}
      />
    </div>
  {/snippet}
</Story>

<Story name="Loading" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="frame">
      <AiChatTranscript loading messages={[]} />
    </div>
  {/snippet}
</Story>

<Story name="Error" tags={["skip-visual"]}>
  {#snippet template()}
    <div data-ui-component="ai-story-host" data-ui-part="frame">
      <AiChatTranscript error="Could not load chat session." messages={[]} />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-ui-component="ai-story-host"][data-ui-part="frame"]) {
    display: flex;
    height: 20rem;
    max-width: 24rem;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--background);
  }
</style>
