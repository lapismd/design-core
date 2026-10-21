<script lang="ts">
  import "./markdown-context.css";
  import { getContext } from "svelte";
  import {
    presentationContext,
    type TranscriptPresentationContext,
  } from "./presentation-context.js";
  import ChatHoverActions from "./ChatHoverActions.svelte";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import ChatTextBlock from "./ChatTextBlock.svelte";
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  import type { TranscriptController } from "./comments.svelte.js";
  import { validAnchor } from "./anchors.js";
  import { customInteraction } from "./custom-interaction.js";
  let {
    blocks,
    state,
    customBlock,
    showHeaders = true,
    reactionTarget,
    messageActions,
    reply = false,
  }: {
    blocks: readonly TranscriptBlock[];
    state: TranscriptController;
    customBlock?: TranscriptProps["customBlock"];
    showHeaders?: boolean;
    reactionTarget?: string;
    messageActions?: TranscriptProps["messageActions"];
    reply?: boolean;
  } = $props();
  const presentation = getContext<TranscriptPresentationContext | undefined>(
    presentationContext,
  );
  const markdown = $derived(presentation?.markdown ?? state.props().markdown);
</script>

<div class="ui-transcript-content-flow">
  {#each blocks as block, index (block.id)}
    {#if block.kind === "custom" || block.kind === "context"}
      <section
        class="ui-transcript-custom"
        data-kind={block.kind}
        data-surface={block.surface ?? "framed"}
        role="group"
        aria-label={block.label}
        use:customInteraction={{ block, state }}
        data-highlighted={state.forBlocks([block]).length > 0}
      >
        {#if block.kind === "context"}<MarkdownContent
            {...markdown}
            content={block.text}
            fullWidth
          />
        {:else if customBlock}{@render customBlock(block)}
        {:else}<MarkdownContent
            {...markdown}
            content={block.text}
            fullWidth
          />{/if}
        <ChatHoverActions
          {block}
          {state}
          {reactionTarget}
          {messageActions}
          onComment={() => state.open(block, { from: 0, to: 0 })}
        />
        {#each state.visibleThreads.filter( (t) => validAnchor(block, t.anchor), ) as thread (thread.id)}
          <ChatCommentArea {state} threadId={thread.id} />
        {/each}
      </section>
    {:else}<ChatTextBlock
        {block}
        {state}
        {reactionTarget}
        {messageActions}
        reply={reply && index === 0}
        showHeader={showHeaders}
      />{/if}
  {/each}
</div>

<style>
  .ui-transcript-custom {
    position: relative;
    min-width: 0;
    padding: 0.75rem;
    border: 1px solid var(--border);
    border-radius: var(--radius);
  }
  .ui-transcript-custom[data-kind="context"],
  .ui-transcript-custom[data-surface="plain"] {
    padding: 0;
    border: 0;
  }
  .ui-transcript-custom[data-highlighted="true"] {
    border-color: var(--primary);
    border-inline-start-width: 3px;
    background: color-mix(in srgb, var(--primary) 10%, transparent);
  }
  .ui-transcript-content-flow {
    display: grid;
    gap: 0.5rem;
    min-width: 0;
  }
</style>
