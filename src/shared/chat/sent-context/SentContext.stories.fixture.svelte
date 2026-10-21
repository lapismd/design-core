<script lang="ts">
  import { untrack } from "svelte";
  import SentContext from "./SentContext.svelte";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import { Button } from "../../shadcn/button/index.js";
  import type { ContextDelivery } from "./sent-context.types.js";
  let {
    initialDelivery = "sent",
    empty = false,
    acknowledge = false,
    narrow = false,
    long = false,
  }: {
    initialDelivery?: ContextDelivery;
    empty?: boolean;
    acknowledge?: boolean;
    narrow?: boolean;
    long?: boolean;
  } = $props();
  let delivery = $state(untrack(() => initialDelivery));
  let open = $state(false);
  let raw = $state(false);
  const content = $derived(
    empty
      ? ""
      : `<agent_context>\n\n<origin>\n\n## Captured task\n\nKeep **Markdown**, [safe links](https://example.com) and code.\n\n\`\`\`xml\n<literal />\n\`\`\`\n\n&lt;instructions>captured text&lt;/instructions>\n\n${long ? Array.from({ length: 45 }, (_, i) => `- Captured detail ${i + 1}`).join("\n") : ""}\n\n</origin>\n\n</agent_context>`,
  );
</script>

<main class="sent-context-demo" style:max-width={narrow ? "16rem" : undefined}>
  <h1>Application context</h1>
  <p>Demonstration host receipts. No request is sent to an agent.</p>
  {#if acknowledge}<Button
      size="sm"
      variant="outline"
      onclick={() => (delivery = "sent")}>Acknowledge start</Button
    >{/if}
  <article aria-label="User message">
    <SentContext
      {content}
      {delivery}
      bind:open
      bind:raw
      rawContent={JSON.stringify(
        { delivery, wireContext: content, blocks: [] },
        null,
        2,
      )}
    />
    <MarkdownContent content="Please update the parser." compact />
  </article>
</main>

<style>
  .sent-context-demo {
    min-width: 0;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }
  h1 {
    font-size: 1rem;
    font-weight: 600;
  }
  p {
    color: var(--muted-foreground);
    margin-block: 0.5rem 1rem;
    font-size: 0.875rem;
  }
</style>
