<script lang="ts">
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import XIcon from "@lucide/svelte/icons/x";
  import RefreshIcon from "@lucide/svelte/icons/refresh-cw";
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import ChatDisclosureIcon from "./ChatDisclosureIcon.svelte";
  import { queuedPreview } from "./queued-preview.js";
  import type { MessageQueueProps } from "./model.js";
  import "./comment-card.css";
  import "./message-queue.css";
  let {
    entries,
    open = $bindable(true),
    disabled = false,
    onCancel,
    onReview,
    class: className,
    ...rest
  }: MessageQueueProps = $props();
  let expanded = $state<Record<string, boolean>>({});
  const id = $props.id();
  $effect(() => {
    const ids = new Set(entries.map((e) => e.id));
    for (const key of Object.keys(expanded))
      if (!ids.has(key)) delete expanded[key];
  });
</script>

{#if entries.length}
  <section
    {...rest}
    class={["ui-transcript-message-queue", className].filter(Boolean).join(" ")}
    data-ui-component="message-queue"
    aria-label="Queued messages"
  >
    <Collapsible.Root bind:open>
      <Collapsible.Trigger
        class="ui-transcript-message-queue__heading"
        aria-label={`${open ? "Collapse" : "Expand"} ${entries.length} queued ${entries.length === 1 ? "message" : "messages"}`}
      >
        <span
          >{entries.length} queued {entries.length === 1
            ? "message"
            : "messages"}</span
        ><ChatDisclosureIcon />
      </Collapsible.Trigger>
      <Collapsible.Content
        ><ol>
          {#each entries as entry, index (entry.id)}
            {@const author = entry.submission.author ??
              entry.submission.comments[0]?.author ?? {
                id: "local-user",
                name: "You",
                initials: "YO",
              }}
            {@const preview = queuedPreview(entry.submission.text)}
            <li>
              <div class="ui-transcript-comment-list">
                <article
                  class="ui-transcript-comment-card"
                  aria-label={`Pending message from ${author.name}`}
                >
                  <TranscriptAvatar member={author} />
                  <div class="ui-transcript-message-queue__content">
                    {#if entry.submission.text}<p id={`${id}-${index}`}>
                        {expanded[entry.id] || !preview.truncated
                          ? entry.submission.text
                          : `${preview.text.trimEnd()}…`}
                      </p>{/if}
                    {#if preview.truncated}<Button
                        size="xs"
                        variant="ghost"
                        aria-controls={`${id}-${index}`}
                        aria-expanded={expanded[entry.id] ?? false}
                        onclick={() =>
                          (expanded[entry.id] = !expanded[entry.id])}
                        >{#if expanded[entry.id]}<ChevronDownIcon
                          />{:else}<ChevronRightIcon />{/if}{expanded[entry.id]
                          ? "See Less"
                          : "See More"}</Button
                      >{/if}
                    {#each entry.submission.comments as comment (comment.commentId)}<blockquote
                      >
                        <span>{comment.author.name}: </span>{comment.text}
                      </blockquote>{/each}
                  </div>
                  <div class="ui-transcript-comment-links">
                    {#each entry.recipients as recipient (recipient.id)}
                      {#if recipient.state === "queued" && onCancel}<Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={disabled ||
                            recipient.disabled ||
                            recipient.cancelling}
                          aria-label={`Cancel queued message for ${recipient.label}`}
                          title={recipient.cancelling
                            ? "Cancelling…"
                            : `Cancel queued message for ${recipient.label}`}
                          onclick={() => {
                            if (
                              !disabled &&
                              !recipient.disabled &&
                              !recipient.cancelling
                            )
                              void onCancel?.(entry, recipient);
                          }}><XIcon /></Button
                        >{/if}
                      {#if (recipient.state !== "queued" || recipient.error) && onReview}<Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={disabled || recipient.disabled}
                          aria-label={`Check message status for ${recipient.label}`}
                          onclick={() => {
                            if (!disabled && !recipient.disabled)
                              void onReview?.(entry, recipient);
                          }}><RefreshIcon /></Button
                        >{/if}
                    {/each}
                  </div>
                </article>
              </div>
              <div class="ui-transcript-message-queue__metadata">
                {#each entry.recipients as recipient (recipient.id)}<div>
                    {recipient.label} · {recipient.cancelling
                      ? "Cancelling…"
                      : recipient.state === "queued"
                        ? "Queued"
                        : "Delivery needs attention"}
                  </div>
                  {#if recipient.error}<p role="alert">
                      {recipient.error}
                    </p>{/if}{/each}
              </div>
            </li>
          {/each}
        </ol></Collapsible.Content
      >
    </Collapsible.Root>
  </section>
{/if}
