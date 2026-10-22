<script lang="ts">
  import "./markdown-context.css";
  import { getContext } from "svelte";
  import {
    presentationContext,
    type TranscriptPresentationContext,
  } from "./presentation-context.js";
  import ComposerStatusBanner from "../../ai/composer/ComposerStatusBanner.svelte";
  import { Button } from "../../shadcn/button/index.js";
  import CornerUpLeftIcon from "@lucide/svelte/icons/corner-up-left";
  import PencilIcon from "@lucide/svelte/icons/pencil";
  import XIcon from "@lucide/svelte/icons/x";
  import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";
  import CornerDownRightIcon from "@lucide/svelte/icons/corner-down-right";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import ChatCommentDelivery from "./ChatCommentDelivery.svelte";
  import ChatCommentEditor from "./ChatCommentEditor.svelte";
  import TableRowQuote from "./TableRowQuote.svelte";
  import type { TranscriptController } from "./comments.svelte.js";
  import "./comment-card.css";
  let {
    state,
    threadId,
    placement = "inline",
    commentIds,
  }: {
    state: TranscriptController;
    threadId: string;
    placement?: "inline" | "queue" | "summary" | "history" | "reply";
    commentIds?: readonly string[];
  } = $props();
  const thread = $derived(state.threads.find((t) => t.id === threadId));
  const comments = $derived.by(() => {
    const entries =
      thread?.comments.filter(
        (c) =>
          !c.replyTo &&
          (!commentIds
            ? !c.historical
            : commentIds.includes(c.id) ||
              (!!c.messageId &&
                !!c.version &&
                commentIds.includes(`${c.messageId}:${c.version}`))),
      ) ?? [];
    return placement === "summary"
      ? entries.filter((c) => c.text.trim()).slice(-1)
      : entries;
  });
  const source = $derived(
    placement === "queue" || placement === "history" || placement === "reply",
  );
  const editable = $derived(placement === "inline" || placement === "queue");
  const available = $derived(thread ? state.isAvailable(thread) : false);
  const presentation = getContext<TranscriptPresentationContext | undefined>(
    presentationContext,
  );
  const status = $derived(
    presentation?.unavailableStatus ??
      state.props().unavailableStatus ?? {
        type: "warning" as const,
        message: "Original content unavailable or changed.",
      },
  );
  const statusPosition = $derived(
    presentation?.unavailableStatusPosition ??
      state.props().unavailableStatusPosition ??
      "top",
  );
  const hasDraft = $derived(
    thread?.comments.some(
      (c) => c.status === "draft" && c.author.id === state.author.id,
    ),
  );
  async function reply(opener: HTMLElement) {
    if (!thread) return;
    if (placement === "summary") await state.goToSource(thread, opener);
    state.begin(thread, "inline", "", hasDraft);
  }
</script>

{#each thread ? [thread] : [] as current (current.id)}
  <div
    class:ui-transcript-comment-context={source}
    class="ui-transcript-comment-area"
    data-chat-comment-area
    data-thread-id={threadId}
    data-placement={placement}
    onpointerenter={() => (state.highlightedThread = threadId)}
    onpointerleave={() => {
      if (state.highlightedThread === threadId)
        state.highlightedThread = undefined;
    }}
    role="group"
    aria-label={`${placement === "queue" ? "Pending" : placement === "history" ? "Retained" : placement === "reply" ? "Reply context" : "Inline"} comments on ${current.label}`}
  >
    {#if !available && statusPosition === "top"}<ComposerStatusBanner
        {status}
        position="top"
      />{/if}
    <div class="ui-transcript-comment-surface">
      {#if source}<blockquote
          class="ui-transcript-comment-quote"
          data-chat-quote={current.anchor.quote}
        >
          {#if current.anchor.tableContext}<TableRowQuote
              context={current.anchor.tableContext}
            />
          {:else if current.sourceKind === "markdown" || current.sourceKind === "context"}
            <MarkdownContent
              {...presentation?.markdown ?? state.props().markdown}
              content={current.anchor.quote}
              fullWidth
            />
          {:else}<code>{current.anchor.quote}</code>{/if}
        </blockquote>{/if}
      <div class="ui-transcript-comment-list">
        {#each comments as comment (comment.id)}
          <article
            class="ui-transcript-comment-card"
            aria-label={`Comment by ${comment.author.name}`}
            data-status={comment.status}
            data-comment-id={comment.id}
            tabindex="-1"
          >
            <TranscriptAvatar
              member={comment.author}
              size="xsmall"
              decorative
            />
            <div class="ui-transcript-comment-content">
              {#if editable && (comment.status === "draft" || comment.status === "sending")}
                <ChatCommentEditor
                  {state}
                  thread={current}
                  {comment}
                  location={placement === "queue" ? "queue" : "inline"}
                />
              {:else}<MarkdownContent
                  {...presentation?.markdown ?? state.props().markdown}
                  content={comment.text}
                  fullWidth
                />{/if}
            </div>
            <div class="ui-transcript-comment-links">
              {#if (placement === "inline" || placement === "summary") && !comment.replyTo && (comment.status === "draft" || comment.status === "sending" || comment.batchId)}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={comment.batchId
                    ? "View message"
                    : "Go to queued comment"}
                  title={comment.batchId
                    ? "View message"
                    : "Go to queued comment"}
                  onclick={() => state.goToMessage(current, comment)}
                  ><CornerDownRightIcon /></Button
                >
              {/if}
              {#if source || placement === "summary"}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={!available && !state.props().onNavigateSource}
                  aria-label={`Go to source: ${current.label}`}
                  title="Go to source"
                  onclick={(event) =>
                    state.goToSource(current, event.currentTarget)}
                  ><CornerUpLeftIcon /></Button
                >
              {/if}
              {#if placement === "inline" && state.canEditSent(current, comment)}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Edit comment"
                  title="Edit comment"
                  onclick={() => state.editSent(current, comment)}
                  ><PencilIcon /></Button
                >
              {/if}
              {#if comment.status === "draft"}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Remove pending comment"
                  title="Remove pending comment"
                  onclick={() => state.remove(comment.id)}><XIcon /></Button
                >
              {/if}
              {#if (placement === "inline" || placement === "summary") && comment.id === comments.at(-1)?.id}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={state.sending ||
                    !available ||
                    state.props().canComment === false}
                  aria-label={hasDraft ? "Add another comment" : "Reply"}
                  title={hasDraft ? "Add another comment" : "Reply"}
                  onclick={(event) => reply(event.currentTarget)}
                  ><MessageSquarePlusIcon /></Button
                >
              {/if}
            </div>
            <ChatCommentDelivery {state} {comment} />
          </article>
        {/each}
      </div>
    </div>
    {#if !available && statusPosition === "bottom"}<ComposerStatusBanner
        {status}
        position="bottom"
      />{/if}
  </div>
{/each}
