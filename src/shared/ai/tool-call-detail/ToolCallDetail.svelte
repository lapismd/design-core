<script lang="ts">
  import { CodeBlock } from "@lapismd/design-core/shadcn/code-block";
  import {
    isOneLineToolAlert,
    presentToolPayload,
  } from "./tool-call-detail.js";

  let {
    input,
    output,
    error,
    toolName,
  }: {
    input?: string;
    output?: string;
    error?: string;
    toolName?: string;
  } = $props();

  const hint = $derived({
    ...(toolName === undefined ? {} : { toolName }),
    ...(input === undefined ? {} : { input }),
  });
  const inputPayload = $derived(presentToolPayload(input));
  const outputPayload = $derived(presentToolPayload(output, hint));
  const errorPayload = $derived(presentToolPayload(error, hint));
</script>

<div data-ui-component="ai-chat-tool-call-detail" data-ui-part="root">
  {#if inputPayload}
    <CodeBlock
      code={inputPayload.code}
      language={inputPayload.language}
      title="Input"
      size="sm"
      width="full"
      isWrapped
      maxHeight="16rem"
    />
  {/if}
  {#if outputPayload}
    <CodeBlock
      code={outputPayload.code}
      language={outputPayload.language}
      title="Output"
      size="sm"
      width="full"
      isWrapped
      maxHeight="16rem"
    />
  {/if}
  {#if errorPayload && !isOneLineToolAlert(errorPayload)}
    <CodeBlock
      code={errorPayload.code}
      language={errorPayload.language}
      title="Error"
      size="sm"
      width="full"
      isWrapped
      maxHeight="16rem"
    />
  {/if}
</div>

<style>
  [data-ui-component="ai-chat-tool-call-detail"] {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
  }
</style>
