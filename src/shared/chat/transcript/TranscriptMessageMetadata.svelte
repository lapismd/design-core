<script lang="ts">
  import { getContext } from "svelte";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import MessageMetadata from "../../ai/message-metadata/MessageMetadata.svelte";
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

{#snippet footer()}
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
        ><span class="ui-transcript-message-reply-label"
          >{item.replyLabel ??
            `${item.replyCount} ${item.replyCount === 1 ? "reply" : "replies"}`}</span
        ></button
      >
    </span>{/if}
  {@render supplement?.(item)}
  {#if item.status && item.status.type !== "error"}<span
      >{item.status.label}</span
    >{/if}
{/snippet}
{#snippet timeLabel()}
  {#if date}<time
      datetime={date}
      title={new Date(date).toLocaleString(undefined, {
        timeZoneName: "short",
      })}>{timestamp}</time
    >{:else}{timestamp}{/if}
{/snippet}
{#if timestamp || item.edited || hasReplies || supplement || item.status}
  <MessageMetadata
    class="ui-transcript-message-metadata"
    role="group"
    aria-label={`${item.label} metadata`}
    sender="assistant"
    timestamp={timestamp ? timeLabel : undefined}
    footer={item.edited ||
    hasReplies ||
    supplement ||
    (item.status && item.status.type !== "error")
      ? footer
      : undefined}
    status={item.status?.type === "error" ? "error" : undefined}
    statusLabel={item.status?.label}
  />
{/if}
{#if item.status?.message}<p
    class="message-status-detail"
    data-tone={item.status.type}
    role={item.status.type === "error" ? "alert" : "status"}
    aria-label={`${item.status.label} details`}
  >
    {item.status.message}
  </p>{/if}

<style>
  .message-status-detail {
    margin: 0.125rem 0 0;
    font-size: var(--ui-transcript-metadata-font-size, 0.75rem);
    line-height: 1.5;
  }
  [data-tone="error"] {
    color: var(
      --ui-ai-chat-metadata-error-foreground,
      color-mix(in srgb, var(--destructive) 80%, var(--foreground))
    );
  }
  :global(.dark) [data-tone="error"] {
    color: var(
      --ui-ai-chat-metadata-error-foreground,
      color-mix(in srgb, var(--destructive) 60%, var(--foreground))
    );
  }
  [data-tone="warning"] {
    color: var(--foreground);
  }
</style>
