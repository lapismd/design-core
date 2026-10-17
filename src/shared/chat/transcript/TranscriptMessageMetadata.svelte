<script lang="ts">
  import type { TranscriptItem, TranscriptProps } from "./model.js";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  let {
    item,
    onOpenThread,
    supplement,
  }: {
    item: TranscriptItem;
    onOpenThread?: TranscriptProps["onOpenThread"];
    supplement?: TranscriptProps["metadataSupplement"];
  } = $props();
  const date = $derived(
    item.createdAt && Number.isFinite(Date.parse(item.createdAt))
      ? item.createdAt
      : undefined,
  );
  const timestamp = $derived(
    item.timestamp ??
      (date
        ? new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : ""),
  );
  const hasReplies = $derived((item.replyCount ?? 0) > 0 && !!onOpenThread);
</script>

{#if timestamp || item.edited || hasReplies || supplement}
  <div class="ui-transcript-message-metadata">
    {#if timestamp}{#if date}<time
          datetime={date}
          title={new Date(date).toLocaleString(undefined, {
            timeZoneName: "short",
          })}>{timestamp}</time
        >{:else}<span>{timestamp}</span>{/if}{/if}
    {#if item.edited}<span>Edited</span>{/if}
    {#if hasReplies}<button
        type="button"
        class="ui-transcript-message-replies"
        onclick={() => onOpenThread?.(item)}
      >
        {#if item.replyParticipants?.length}<span
            class="ui-transcript-reply-participants"
            aria-hidden="true"
            >{#each item.replyParticipants as author (author.id)}<TranscriptAvatar
                member={author}
                size="inline"
                interactive={false}
              />{/each}</span
          >{/if}
        <span
          >{item.replyLabel ??
            `${item.replyCount} ${item.replyCount === 1 ? "reply" : "replies"}`}</span
        >
      </button>{/if}
    {@render supplement?.(item)}
  </div>
{/if}
