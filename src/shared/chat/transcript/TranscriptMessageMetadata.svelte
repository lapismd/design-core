<script lang="ts">
  import { getContext } from "svelte";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import {
    authorContext,
    type TranscriptAuthorContext,
  } from "./author-context.js";
  import { transcriptAuthorIdentity } from "./author-identity.js";
  import type { TranscriptItem, TranscriptProps } from "./model.js";
  import {
    AvatarGroup,
    type AvatarIdentity,
  } from "../../shadcn/avatar/index.js";
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
  const participants = $derived(
    (item.replyParticipants ?? []).map(transcriptAuthorIdentity),
  );
  const authorPresentation = getContext<TranscriptAuthorContext | undefined>(
    authorContext,
  );
</script>

{#snippet participantAvatar(identity: AvatarIdentity)}
  {@const author = item.replyParticipants!.find(
    (person) => person.id === identity.id,
  )!}
  <TranscriptAvatar member={author} size="group" />
{/snippet}

{#if timestamp || item.edited || hasReplies || supplement}
  <div class="ui-transcript-message-metadata">
    {#if timestamp}{#if date}<time
          datetime={date}
          title={new Date(date).toLocaleString(undefined, {
            timeZoneName: "short",
          })}>{timestamp}</time
        >{:else}<span>{timestamp}</span>{/if}{/if}
    {#if item.edited}<span>Edited</span>{/if}
    {#if hasReplies}<span class="ui-transcript-message-reply-summary">
        <AvatarGroup
          items={participants}
          size="xs"
          label="Reply participants"
          avatar={authorPresentation?.popover ? participantAvatar : undefined}
        />
        <button
          type="button"
          class="ui-transcript-message-replies"
          onclick={() => onOpenThread?.(item)}
        >
          <span class="ui-transcript-message-reply-label"
            >{item.replyLabel ??
              `${item.replyCount} ${item.replyCount === 1 ? "reply" : "replies"}`}</span
          >
        </button></span
      >{/if}
    {@render supplement?.(item)}
  </div>
{/if}
