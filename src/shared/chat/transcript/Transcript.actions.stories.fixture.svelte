<script lang="ts">
  import Transcript from "./Transcript.svelte";
  import { Button } from "../../shadcn/button/index.js";
  import type { TranscriptItem } from "./model.js";
  let {
    disabled = false,
    tooltips = true,
  }: { disabled?: boolean; tooltips?: boolean } = $props();
  let raw = $state(false),
    action = $state("");
  const items: TranscriptItem[] = [
    {
      id: "tool",
      kind: "message",
      role: "assistant",
      label: "Tool result",
      blocks: [
        {
          id: "tool/body",
          revision: "1",
          kind: "custom",
          surface: "plain",
          label: "Tool result",
          text: "Captured tool output",
        },
      ],
    },
  ];
</script>

<div style="height:320px;padding:3rem">
  <Transcript
    {items}
    canComment={!disabled}
    reactionsDisabled={disabled}
    actionTooltips={tooltips}
    onReact={() => {
      action = "reaction";
    }}
    getMessageActions={() => [
      {
        id: "copy",
        label: "Copy captured message",
        disabled,
        onSelect: () => {
          action = "copy";
        },
      },
    ]}
  >
    {#snippet customBlock()}<section aria-label="Tool preview">
        <header>
          <span>Captured tool output</span><Button
            aria-label="Toggle tool source"
            variant="ghost"
            size="icon-sm"
            onclick={() => {
              raw = !raw;
            }}>{raw ? "F" : "S"}</Button
          >
        </header>
        <p>{raw ? "Raw captured output" : "Formatted output"}</p>
      </section>{/snippet}
  </Transcript>
  <output data-testid="hover-action">{action}</output>
</div>

<style>
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
</style>
