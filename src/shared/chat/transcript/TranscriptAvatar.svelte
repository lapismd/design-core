<script lang="ts">
  import { Avatar } from "../../shadcn/avatar/index.js";
  import { getContext } from "svelte";
  import * as Popover from "../../shadcn/popover/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import {
    authorContext,
    type TranscriptAuthorContext,
  } from "./author-context.js";
  import type { TranscriptAuthor } from "./model.js";
  let {
    member,
    size = "xsmall",
    decorative = true,
  }: {
    member: TranscriptAuthor;
    size?: string;
    decorative?: boolean;
  } = $props();
  const context = getContext<TranscriptAuthorContext | undefined>(
    authorContext,
  );
  let open = $state(false);
</script>

{#snippet avatar()}
  <Avatar
    name={member.name}
    {...member.initials === undefined ? {} : { initials: member.initials }}
    {...member.image === undefined ? {} : { src: member.image }}
    {...member.emoji === undefined ? {} : { emoji: member.emoji }}
    shape={member.shape ?? "circle"}
    {...member.background === undefined
      ? {}
      : { background: member.background }}
    {decorative}
    style={`--ui-avatar-size: ${size === "inline" ? "1rem" : "1.5rem"}`}
  />
{/snippet}
{#if context?.popover}
  <Popover.Root bind:open>
    <Popover.Trigger
      class="ui-transcript-author-trigger"
      aria-label={`About ${member.name}`}>{@render avatar()}</Popover.Trigger
    >
    <Popover.Content
      class="ui-transcript-author-popover"
      align="start"
      role="dialog"
      aria-label={`About ${member.name}`}
    >
      <ScrollArea
        scrollStrategy="styled"
        style="max-height:min(18rem, var(--bits-popover-content-available-height))"
      >
        <strong>{member.name}</strong>
        {#if context.popover.description?.(member)}<p>
            {context.popover.description(member)}
          </p>{/if}
        {@render context.popover.details?.(member)}
        <div class="ui-transcript-author-actions">
          {#each context.popover.actions?.(member) ?? [] as action (action.id)}
            <Button
              variant="outline"
              size="sm"
              disabled={action.disabled}
              onclick={() => {
                if (!action.disabled) {
                  action.onSelect(member);
                  open = false;
                }
              }}>{action.label}</Button
            >
          {/each}
        </div>
      </ScrollArea>
    </Popover.Content>
  </Popover.Root>
{:else}{@render avatar()}{/if}

<style>
  :global(.ui-transcript-author-trigger) {
    display: inline-flex;
    flex: none;
    padding: 0;
    border: 0;
    border-radius: var(--radius);
    background: transparent;
    cursor: pointer;
  }
  :global(.ui-transcript-author-trigger:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  :global(.ui-transcript-author-popover) {
    --ui-popover-width: min(17rem, calc(100vw - 2rem));
  }
  :global(.ui-transcript-author-popover p) {
    margin-block: 0.375rem;
    color: var(--muted-foreground);
  }
  .ui-transcript-author-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-block-start: 0.5rem;
  }
</style>
