<script lang="ts">
  import {
    presentationContext,
    type TranscriptPresentationContext,
  } from "./presentation-context.js";
  import HistoryEdge from "../history-edge/HistoryEdge.svelte";
  import SentContext from "../sent-context/SentContext.svelte";
  import { SystemMessage, Message } from "../../ai/chat.js";
  import { tick, untrack, setContext } from "svelte";
  import {
    reactionContext,
    type TranscriptReactionContext,
  } from "./reaction-context.js";
  import {
    authorContext,
    type TranscriptAuthorContext,
  } from "./author-context.js";
  import "./chat-body.css";
  import LightbulbIcon from "@lucide/svelte/icons/lightbulb";
  import BotIcon from "@lucide/svelte/icons/bot";
  import FileTextIcon from "@lucide/svelte/icons/file-text";
  import * as Collapsible from "../../shadcn/collapsible/index.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import ChatDisclosureIcon from "./ChatDisclosureIcon.svelte";
  import TranscriptMessageMetadata from "./TranscriptMessageMetadata.svelte";
  import TranscriptAvatar from "./TranscriptAvatar.svelte";
  import ChatCommentBatch from "./ChatCommentBatch.svelte";
  import ChatCollapsedComments from "./ChatCollapsedComments.svelte";
  import ReactionBar from "../../ai/experimental/reaction-bar/ReactionBar.svelte";
  import ChatNavigation from "./ChatNavigation.svelte";
  import ChatScrollRecovery from "./ChatScrollRecovery.svelte";
  import ChatScrollFade from "./ChatScrollFade.svelte";
  import ChatCommentArea from "./ChatCommentArea.svelte";
  import ChatReplyContext from "./ChatReplyContext.svelte";
  import ChatContent from "./ChatContent.svelte";
  import ChatTools from "./ChatTools.svelte";
  import ChatNotice from "./ChatNotice.svelte";
  import ChatSystemMessage from "./ChatSystemMessage.svelte";
  import { TranscriptController } from "./comments.svelte.js";
  import type { TranscriptProps } from "./model.js";
  import { rawToolBlock } from "./tool-blocks.js";
  import { validAnchor } from "./anchors.js";
  let {
    items,
    author,
    onSend,
    reactions = {},
    reactionOptions,
    authorPopover,
    onReact,
    composer,
    classicComposerPlacement = "inline",
    footer,
    label = "Agent chat body",
    customBlock,
    commentState,
    view = "document",
    loading = false,
    history,
    onLoadHistory,
    navigation = true,
    scrollButton = false,
    busy = false,
    emptyState,
    beforeItems,
    queuedMessages,
    afterItems,
    supplement: itemSupplement,
    metadataSupplement: itemMetadata,
    messageActions,
    onOpenThread,
    logLabel = "Conversation messages",
    ...hostOptions
  }: TranscriptProps = $props();
  const ownedComments = new TranscriptController(() => ({
    canComment: false,
    ...hostOptions,
    items,
    author,
    onSend,
    onReact,
    reactionOptions,
  }));
  const comments = $derived(commentState ?? ownedComments);
  const reactionSettings: TranscriptReactionContext = {
    get onReact() {
      return onReact ?? comments.props().onReact;
    },
    get reactionOptions() {
      return reactionOptions ?? comments.props().reactionOptions;
    },
    get reactionEmojis() {
      return hostOptions.reactionEmojis ?? comments.props().reactionEmojis;
    },
    get customEmojis() {
      return hostOptions.customEmojis ?? comments.props().customEmojis;
    },
    get reactionsDisabled() {
      return (
        hostOptions.reactionsDisabled ?? comments.props().reactionsDisabled
      );
    },
  };
  setContext(reactionContext, reactionSettings);
  setContext<TranscriptAuthorContext>(authorContext, {
    get popover() {
      return authorPopover;
    },
  });
  setContext<TranscriptPresentationContext>(presentationContext, {
    get commentComposer() {
      return hostOptions.commentComposer ?? comments.props().commentComposer;
    },
    get inlineReferences() {
      return hostOptions.inlineReferences ?? comments.props().inlineReferences;
    },
    get readerExtensions() {
      return hostOptions.readerExtensions ?? comments.props().readerExtensions;
    },
    get getMessageActions() {
      return (
        hostOptions.getMessageActions ?? comments.props().getMessageActions
      );
    },
    get actionTooltips() {
      return hostOptions.actionTooltips ?? comments.props().actionTooltips;
    },
    get markdown() {
      return hostOptions.markdown ?? comments.props().markdown;
    },
    get unavailableStatus() {
      return (
        hostOptions.unavailableStatus ?? comments.props().unavailableStatus
      );
    },
    get unavailableStatusPosition() {
      return (
        hostOptions.unavailableStatusPosition ??
        comments.props().unavailableStatusPosition
      );
    },
  });
  let root = $state<HTMLElement | null>(null);
  let composerRoot = $state<HTMLDivElement | null>(null);
  let previousSignature = "";
  let composing = $state(false);
  let renderedView = $state<"document" | "classic">("document");
  let viewportHeight = $state(0);
  const classicComposerFixed = $derived(
    !!composer &&
      renderedView === "classic" &&
      classicComposerPlacement === "fixed",
  );
  $effect(() => {
    const viewport = root;
    if (!viewport || !classicComposerFixed) return;
    const measure = () => {
      viewportHeight = viewport.clientHeight;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  });
  $effect(() => {
    if (!composing) renderedView = view;
  });
  const blocks = $derived(
    items.flatMap((item) => [
      ...item.blocks,
      ...(item.tools ?? []).flatMap((tool) => [
        ...tool.blocks,
        rawToolBlock(tool),
      ]),
    ]),
  );
  const stale = $derived(
    comments.visibleThreads.filter(
      (thread) => !blocks.some((block) => validAnchor(block, thread.anchor)),
    ),
  );
  $effect(() => {
    const node = root;
    comments.root = node;
    return () => {
      if (comments.root === node) comments.root = null;
    };
  });
  $effect.pre(() => {
    const signature = JSON.stringify(
      items.map((item) => [
        item.id,
        item.blocks.map((block) => [block.id, block.revision, block.text]),
        item.tools?.map((tool) => [
          tool.id,
          tool.revision,
          tool.blocks.map((block) => block.text),
        ]),
      ]),
    );
    const scrollport = root;
    if (previousSignature && previousSignature !== signature && scrollport) {
      const top = scrollport.scrollTop;
      const bottom =
        scrollport.scrollHeight - scrollport.clientHeight - top < 8;
      const bounds = scrollport.getBoundingClientRect();
      const anchor = [
        ...scrollport.querySelectorAll<HTMLElement>("[data-chat-item]"),
      ].find((node) => node.getBoundingClientRect().bottom > bounds.top);
      const offset = anchor
        ? anchor.getBoundingClientRect().top - bounds.top
        : 0;
      let disposed = false;
      void tick().then(() => {
        if (disposed || !scrollport.isConnected) return;
        scrollport.scrollTop =
          bottom && !untrack(() => comments.active)
            ? scrollport.scrollHeight
            : anchor?.isConnected
              ? scrollport.scrollTop +
                anchor.getBoundingClientRect().top -
                scrollport.getBoundingClientRect().top -
                offset
              : top;
      });
      previousSignature = signature;
      return () => {
        disposed = true;
      };
    }
    previousSignature = signature;
  });
</script>

{#snippet reactionBar(item: import("./model.js").TranscriptItem)}
  {#if reactions[item.id]?.length}<ReactionBar
      reactions={reactions[item.id] ?? []}
      label={`Reactions to ${item.label}`}
      disabled={reactionSettings.reactionsDisabled ?? false}
      customEmojis={reactionSettings.customEmojis ?? []}
      onToggle={(emoji, custom) =>
        reactionSettings.onReact?.(item.id, emoji, custom)}
    />{/if}
{/snippet}
<div
  class="ui-transcript-body-reading-surface"
  data-ui-component="transcript"
  data-conversation-view={renderedView}
  data-classic-composer-placement={classicComposerPlacement}
  oncompositionstartcapture={() => (composing = true)}
  oncompositionendcapture={() => (composing = false)}
>
  <div class="ui-transcript-body-scroll-region">
    <ScrollArea
      class="ui-transcript-viewport"
      bind:viewportRef={root}
      role="region"
      aria-label={label}
      data-comment-target={comments.active?.anchor.blockId}
      data-composing={!!composer}
    >
      <div
        class="ui-transcript-composer-flow"
        data-fixed={classicComposerFixed}
        style:min-height={classicComposerFixed
          ? `${viewportHeight}px`
          : undefined}
      >
        {#if loading}<HistoryEdge state="loading" />{/if}
        {#if !loading && history && history !== "empty"}<HistoryEdge
            state={history}
            onLoad={onLoadHistory}
          />{/if}
        {@render beforeItems?.()}
        <div
          role="log"
          aria-label={logLabel}
          aria-live="polite"
          aria-busy={loading || history === "loading"}
        >
          <ol class="ui-transcript-document">
            {#each items as item (item.id)}
              <li data-chat-item={item.id} data-kind={item.kind} tabindex="-1">
                {#if item.dayLabel}<SystemMessage variant="divider"
                    >{item.dayLabel}</SystemMessage
                  >{/if}
                {#if item.commentBatchId}<ChatCommentBatch
                    state={comments}
                    batchId={item.commentBatchId}
                  />{/if}
                {#if item.replyContext}<div
                    class="ui-transcript-document-inset ui-transcript-reply-context"
                  >
                    <ChatReplyContext state={comments} {item} />
                  </div>{/if}
                {#if item.kind === "message" && item.blocks.length}
                  {#if item.sentContext}<div
                      class="ui-transcript-document-inset"
                    >
                      <SentContext
                        {...item.sentContext}
                        markdown={hostOptions.markdown ??
                          comments.props().markdown}
                      />
                    </div>{/if}
                  <Message
                    sender="assistant"
                    density="balanced"
                    class="ui-transcript-message"
                    data-role={item.role}
                    data-message-id={item.id}
                    aria-label={item.author
                      ? `Message from ${item.author.name}`
                      : item.label}
                  >
                    {#snippet avatar()}<div
                        class="ui-transcript-message-avatar"
                      >
                        {#if item.author}<TranscriptAvatar
                            member={item.author}
                            size={renderedView === "classic"
                              ? "medium"
                              : "xsmall"}
                            decorative
                          />{/if}
                      </div>{/snippet}
                    {#snippet name()}{#if renderedView === "classic"}<span
                          class="ui-transcript-message-author"
                          >{item.author?.name ?? item.role ?? item.label}</span
                        >{#if item.author?.role}<span
                            class="ui-transcript-message-role"
                            >{item.author.role}</span
                          >{/if}{/if}{/snippet}
                    <div class="ui-transcript-message-content">
                      <span class="sr-only"
                        >{item.author?.name ?? item.role}</span
                      ><ChatContent
                        blocks={item.blocks}
                        state={comments}
                        reactionTarget={item.id}
                        {messageActions}
                        reply={item.role === "assistant" && !!item.replyContext}
                        {customBlock}
                      />
                      {@render itemSupplement?.(item)}
                      <TranscriptMessageMetadata
                        {item}
                        {onOpenThread}
                        supplement={itemMetadata}
                      />
                      {@render reactionBar(item)}
                    </div>
                  </Message>
                {:else if item.kind === "context" && item.notice !== "error" && !item.blocks.length}
                  <ChatSystemMessage {item} />
                {:else if item.notice}<div class="ui-transcript-document-inset">
                    <ChatNotice
                      {item}
                      state={comments}
                      {customBlock}
                      actions={itemMetadata}
                    />
                  </div>
                {:else if item.kind === "tools"}<div
                    class="ui-transcript-document-inset"
                  >
                    <ChatTools
                      {item}
                      state={comments}
                      {customBlock}
                      onInspectTool={hostOptions.onInspectTool}
                    />
                  </div>
                {:else if item.kind !== "message"}
                  {@const Icon =
                    item.icon ??
                    (item.kind === "reasoning"
                      ? LightbulbIcon
                      : item.kind === "handoff"
                        ? BotIcon
                        : FileTextIcon)}
                  <div class="ui-transcript-document-inset">
                    <Collapsible.Root
                      open={comments.disclosures[item.id] ??
                        item.defaultExpanded ??
                        false}
                      onOpenChange={(open) =>
                        (comments.disclosures[item.id] = open)}
                    >
                      <Collapsible.Trigger class="ui-transcript-context-trigger"
                        ><Icon aria-hidden="true" /><span>{item.label}</span
                        ><ChatDisclosureIcon /></Collapsible.Trigger
                      >
                      <Collapsible.Content
                        >{#if comments.disclosures[item.id] ?? item.defaultExpanded ?? false}<ChatContent
                            blocks={item.blocks}
                            state={comments}
                            reactionTarget={item.id}
                            {messageActions}
                            {customBlock}
                          />{/if}</Collapsible.Content
                      >
                    </Collapsible.Root>
                    {#if !(comments.disclosures[item.id] ?? item.defaultExpanded ?? false)}<ChatCollapsedComments
                        state={comments}
                        blocks={item.blocks}
                      />{/if}
                  </div>
                {/if}
                {#if item.kind !== "message"}{@render itemSupplement?.(
                    item,
                  )}{#if !item.notice}{@render itemMetadata?.(
                      item,
                    )}{/if}{@render reactionBar(item)}{/if}
              </li>
            {/each}
          </ol>
        </div>
        {#if afterItems}<div class="ui-transcript-transcript-activity">
            {@render afterItems()}
          </div>{/if}
        {#if !items.length && !loading && history !== "loading"}
          {#if emptyState}{@render emptyState()}{:else}
            <HistoryEdge state="empty" />
          {/if}
        {/if}
        {#if stale.length}<aside
            class="ui-transcript-stale"
            aria-label="Comments on unavailable content"
          >
            {#each stale as thread (thread.id)}<ChatCommentArea
                state={comments}
                threadId={thread.id}
                placement="history"
              />{/each}
          </aside>{/if}
        {#if composer}<div
            bind:this={composerRoot}
            class="ui-transcript-document-composer"
            data-transcript-composer
          >
            {@render queuedMessages?.()}
            <ChatCommentBatch state={comments} />
            {@render composer(renderedView)}
          </div>{/if}
      </div>
    </ScrollArea>
    {#if footer}<ChatScrollFade
        viewport={root}
        pinnedComposer={classicComposerFixed ? composerRoot : null}
      />{/if}
    {#if scrollButton}<ChatScrollRecovery
        viewport={root}
        pinnedComposer={classicComposerFixed ? composerRoot : null}
        running={busy}
        followingAllowed={!comments.active}
      />{/if}
    {#if navigation}<ChatNavigation
        {items}
        root={root ?? undefined}
        {comments}
      />{/if}
  </div>
  {#if footer}<div class="ui-transcript-body-footer">
      {@render footer()}
    </div>{/if}
</div>
