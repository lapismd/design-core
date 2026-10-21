export const Basic = `<script lang="ts">
  import { SentContext, MarkdownContent, type ContextDelivery } from "@lapismd/design-core/chat";
  let delivery = $state<ContextDelivery>("unknown");
  const content = '<agent_context>\\n## Captured task\\n\\nKeep **Markdown** and exact source text.\\n</agent_context>';
  // Supply your actual captured raw text and receipt, without inferring success.
  const rawContent = JSON.stringify({ wireContext: content }, null, 2);
</script>
<SentContext {content} {delivery} {rawContent} />
<MarkdownContent content="Please update the parser." compact />`;

export const Acknowledgement = `<script lang="ts">
  import { SentContext, type ContextDelivery } from "@lapismd/design-core/chat";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let delivery = $state<ContextDelivery>("queued");
  let open = $state(false);
  let raw = $state(false);
  const content = '<agent_context>\\n## Captured task\\n\\nKeep exact captured text.\\n</agent_context>';
</script>
<Button onclick={() => delivery = "sent"}>Simulate host acknowledgement</Button>
<SentContext {content} {delivery} bind:open bind:raw />`;
