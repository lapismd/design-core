<script lang="ts">
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import ChatDisclosureIcon from "./ChatDisclosureIcon.svelte";
  import ChatCollapsedComments from "./ChatCollapsedComments.svelte";
  import ChatContent from "./ChatContent.svelte";
  import FileDiffIcon from "@lucide/svelte/icons/file-diff";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import { FileTypeIcon } from "../../shadcn/file-type-icon/index.js";
  import type { TranscriptBlock, TranscriptProps } from "./model.js";
  import type { TranscriptController } from "./comments.svelte.js";
  let {
    blocks,
    state,
    customBlock,
  }: {
    blocks: readonly TranscriptBlock[];
    state: TranscriptController;
    customBlock?: TranscriptProps["customBlock"];
  } = $props();
  const key = (block: TranscriptBlock) => `file:${block.id}`;
  const open = (block: TranscriptBlock, index: number) =>
    state.disclosures[key(block)] ?? index === 0;
</script>

{#if blocks.length > 1}
  <div class="ui-transcript-tool-files">
    {#each blocks as block, index (block.id)}
      {@const Icon = block.kind === "patch" ? FileDiffIcon : FileTextIcon}
      <Collapsible.Root
        open={open(block, index)}
        onOpenChange={(value) => (state.disclosures[key(block)] = value)}
      >
        <div class="ui-transcript-tool-file">
          <Collapsible.Trigger
            class="ui-transcript-file-trigger"
            aria-label={`${open(block, index) ? "Hide" : "Show"} captured file ${block.path ?? block.label}`}
          >
            {#if block.path}<FileTypeIcon
                path={block.path}
                size="s"
              />{:else}<Icon aria-hidden="true" />{/if}
            <span>{block.path ?? block.label}</span>
            <ChatDisclosureIcon />
          </Collapsible.Trigger>
          <Collapsible.Content>
            {#if open(block, index)}<div
                class="ui-transcript-tool-file-content"
              >
                <ChatContent
                  blocks={[block]}
                  {state}
                  {customBlock}
                  showHeaders={false}
                />
              </div>{/if}
          </Collapsible.Content>
          {#if !open(block, index)}<ChatCollapsedComments
              {state}
              blocks={[block]}
            />{/if}
        </div>
      </Collapsible.Root>
    {/each}
  </div>
{:else}<ChatContent {blocks} {state} {customBlock} />{/if}

<style>
  .ui-transcript-tool-files {
    display: grid;
    gap: var(--ui-transcript-tool-row-gap, 0.25rem);
    padding: 0;
  }
  .ui-transcript-tool-file {
    border-radius: var(--radius);
  }
  :global(.ui-transcript-file-trigger) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: fit-content;
    max-width: 100%;
    padding: 0;
    min-height: var(--ui-transcript-tool-row-height, 1.5rem);
    border: 0;
    border-radius: var(--radius);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    font-family: var(--font-sans, system-ui);
    font-size: var(--ui-transcript-tool-font-size, 0.8125rem);
    font-weight: 400;
    line-height: 1.5;
    text-align: left;
  }
  :global(.ui-transcript-file-trigger span) {
    overflow-wrap: anywhere;
    min-width: 0;
  }
  :global(.ui-transcript-file-trigger:hover) {
    background: transparent;
    color: var(--foreground);
  }
  :global(.ui-transcript-file-trigger svg) {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
  :global(.ui-transcript-file-trigger:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .ui-transcript-tool-file-content {
    padding-block-start: var(--ui-transcript-tool-row-gap, 0.25rem);
  }
</style>
