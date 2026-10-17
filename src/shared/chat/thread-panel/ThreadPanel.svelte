<script lang="ts">
  import { tick } from "svelte";
  import {
    Layout,
    MessageList,
    Message,
    MessageBubble,
  } from "../../ai/chat.js";
  import { AuthorCard } from "../../shadcn/author-card/index.js";
  import { AvatarGroup } from "../../shadcn/avatar/index.js";
  import { RelativeTime } from "../../shadcn/relative-time/index.js";
  import MarkdownContent from "../markdown-content/MarkdownContent.svelte";
  import MarkdownComposer from "../markdown-composer/MarkdownComposer.svelte";
  import MessageActions from "../message-actions/MessageActions.svelte";
  import ReactionBar from "../../ai/experimental/reaction-bar/ReactionBar.svelte";
  import HistoryEdge from "../history-edge/HistoryEdge.svelte";
  import type { MarkdownComposerHandle } from "../markdown-composer/markdown-composer.types.js";
  import type {
    ThreadPanelProps,
    ThreadMessage,
  } from "./thread-panel.types.js";
  import { projectThreadTree } from "./thread-tree.js";
  import "./thread-panel.css";
  let {
    rootId,
    messages,
    value = $bindable(""),
    replyToId = $bindable(),
    label = "Message thread",
    disabled = false,
    busy = false,
    readOnly = false,
    history,
    onLoadOlder,
    onSubmit,
    onReply,
    onNavigate,
    focusMessageId,
    authorActions,
    messageActions,
    onReact,
    customEmojis = [],
    triggers = [],
    markdown,
    status,
    composerAvatar,
    footer,
    supplement,
    class: className,
  }: ThreadPanelProps = $props();
  const rows = $derived(projectThreadTree(messages, rootId));
  const target = $derived(messages.find((m) => m.id === (replyToId ?? rootId)));
  let input = $state<MarkdownComposerHandle | null>(null);
  let root = $state<HTMLDivElement | null>(null);
  let sending = $state(false),
    error = $state("");
  const blocked = $derived(disabled || busy || sending || readOnly);
  function reply(message: ThreadMessage) {
    if (blocked) return;
    replyToId = message.id;
    onReply?.(message);
    void tick().then(() => input?.focus());
  }
  async function submit(text: string) {
    if (blocked || !text.trim()) return;
    sending = true;
    error = "";
    const snapshot = Object.freeze({
      id: crypto.randomUUID(),
      text,
      parentId: replyToId ?? rootId,
    });
    try {
      await onSubmit(snapshot);
    } catch (cause) {
      error =
        cause instanceof Error ? cause.message : "Could not submit reply.";
    } finally {
      sending = false;
    }
  }
  $effect(() => {
    const id = focusMessageId;
    const available = rows.some((row) => row.message.id === id);
    const container = root;
    if (!id || !available || !container) return;
    let disposed = false;
    void tick().then(() => {
      if (disposed) return;
      const node = container.querySelector<HTMLElement>(
        `[data-thread-message="${CSS.escape(id)}"]`,
      );
      node?.scrollIntoView({ block: "nearest" });
      node?.focus({ preventScroll: true });
    });
    return () => {
      disposed = true;
    };
  });
</script>

<div
  bind:this={root}
  class={["ui-thread-panel", className]}
  data-ui-component="thread-panel"
>
  <Layout scrollMode="history" conversationKey={rootId} aria-label={label}>
    {#snippet composer()}
      {#if !readOnly}<MarkdownComposer
          bind:value
          bind:handle={input}
          label="Thread reply composer"
          inputLabel="Reply"
          presentation="framed"
          submitOnEnter={false}
          disabled={blocked}
          {customEmojis}
          {triggers}
          onSubmit={(text) => {
            void submit(text);
          }}
          {...status
            ? { status }
            : error
              ? { status: { type: "error" as const, message: error } }
              : {}}
          {...target
            ? {
                reply: {
                  authorName: target.author.name,
                  content: target.content,
                },
                onCancelReply: () => {
                  replyToId = rootId;
                  input?.focus();
                },
              }
            : {}}
        >
          {#snippet avatar()}{@render composerAvatar?.()}{/snippet}
        </MarkdownComposer>{/if}
      {@render footer?.()}
    {/snippet}
    <MessageList
      density="compact"
      conversationKey={rootId}
      latestMessageId={rows.at(-1)?.message.id ?? ""}
      hasOlder={false}
      loading={history === "loading"}
      aria-label="Thread messages"
    >
      {#if history}<HistoryEdge
          state={history}
          {...onLoadOlder ? { onLoad: onLoadOlder } : {}}
        />{/if}
      {#if !rows.length && !history}<HistoryEdge
          state="empty"
          label="No replies yet."
        />{/if}
      {#each rows as row (row.message.id)}
        {@const message = row.message}
        {@const replies = messages.filter((m) => m.parentId === message.id)}
        <div
          class="ui-thread-row"
          data-thread-message={message.id}
          data-thread-depth={row.depth}
          tabindex="-1"
          style={`--ui-thread-indent:${row.indentRem}rem;--ui-thread-connector-indent:${row.connectorIndentRem ?? 0}rem;`}
        >
          {#each row.guideIndentRems as guide}<span
              class="ui-thread-row__guide"
              style={`--ui-thread-guide-indent:${guide}rem`}
              aria-hidden="true"
            ></span>{/each}
          {#if row.connectorIndentRem !== undefined}<span
              class="ui-thread-row__connector"
              aria-hidden="true"
            ></span>{/if}
          {#if row.connectsToChildren}<span
              class="ui-thread-row__descendant-guide"
              aria-hidden="true"
            ></span>{/if}
          <div class="ui-thread-row__content">
            <Message
              sender="assistant"
              density="compact"
              aria-label={`Message from ${message.author.name}`}
            >
              {#snippet avatar()}<AuthorCard
                  author={message.author}
                  interaction="popover"
                  size="md"
                  actions={authorActions?.(message.author) ?? []}
                />{/snippet}
              {#snippet name()}<strong>{message.author.name}</strong>{/snippet}
              <MessageBubble variant="ghost" density="compact">
                <MessageActions
                  label={`Actions for message from ${message.author.name}`}
                  disabled={blocked}
                  actions={[
                    ...(messageActions?.(message) ?? []),
                    ...(readOnly
                      ? []
                      : [
                          {
                            id: "thread-reply",
                            label: `Reply to ${message.author.name}`,
                            primary: true,
                            disabled: blocked,
                            onSelect: () => reply(message),
                          },
                        ]),
                  ]}
                  {customEmojis}
                  {...onReact
                    ? {
                        onAddReaction: (emoji, custom) =>
                          onReact?.(message, emoji, custom),
                      }
                    : {}}
                >
                  <MarkdownContent
                    {...markdown}
                    content={message.content}
                    compact
                    fullWidth
                  />
                </MessageActions>
              </MessageBubble>
              {#snippet metadata()}<div class="ui-thread-metadata">
                  {#if message.createdAt}<RelativeTime
                      timestamp={message.createdAt}
                    />{:else if message.timestamp}<span
                      >{message.timestamp}</span
                    >{/if}
                  {#if message.edited}<span>Edited</span>{/if}
                  {#if replies.length}<AvatarGroup
                      items={replies
                        .map((m) => m.author)
                        .filter(
                          (author, index, values) =>
                            values.findIndex((v) => v.id === author.id) ===
                            index,
                        )}
                      size="sm"
                      max={3}
                      label="Reply participants"
                    />
                    <button
                      type="button"
                      onclick={() => {
                        const id = replies[0]!.id;
                        onNavigate?.(id);
                        const node = root?.querySelector<HTMLElement>(
                          `[data-thread-message="${CSS.escape(id)}"]`,
                        );
                        node?.scrollIntoView({ block: "nearest" });
                        node?.focus();
                      }}
                      >{replies.length}
                      {replies.length === 1 ? "reply" : "replies"}</button
                    >{/if}
                </div>
                {#if message.reactions?.length}<ReactionBar
                    reactions={message.reactions}
                    {customEmojis}
                    disabled={disabled || readOnly}
                    {...onReact
                      ? {
                          onToggle: (emoji, custom) =>
                            onReact?.(message, emoji, custom),
                        }
                      : {}}
                  />{/if}
                {@render supplement?.(message)}
              {/snippet}
            </Message>
          </div>
        </div>
      {/each}
    </MessageList>
  </Layout>
</div>
