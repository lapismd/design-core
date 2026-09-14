<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import Layout from "../layout/Layout.svelte";
  import MessageList from "./MessageList.svelte";
  import Message from "../message/Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  import type { MessageListPosition } from "./position.js";
  let items = $state(
    Array.from({ length: 1000 }, (_, index) => ({
      id: `message-${index}`,
      text: `Message ${index}: ${"Variable-height cached conversation content. ".repeat((index % 7) + 1)}`,
    })),
  );
  let unread = $state(false);
  let expanded = $state(false);
  let position = $state<MessageListPosition>();
  let presentation = $state<{ key: string; position?: MessageListPosition }>({
    key: "channel-a",
  });
  let loads = $state(0);
  let key = $state("channel-a");
  let delay = $state(false);
  function append(incoming: boolean) {
    items = [
      ...items,
      {
        id: `message-${items.length}`,
        text: incoming ? "Incoming message" : "My own message",
      },
    ];
    if (incoming) unread = true;
  }
</script>

<div data-story="history-controls">
  <Button onclick={() => append(true)}>Receive message</Button>
  <Button onclick={() => append(false)}>Send own message</Button>
  <Button onclick={() => (expanded = !expanded)}>Resize content</Button>
  <Button
    onclick={() => (key = key === "channel-a" ? "channel-b" : "channel-a")}
    >Switch conversation</Button
  >
  <Button onclick={() => (delay = !delay)}>Toggle delayed history</Button>
  <output aria-label="History loads">{loads}</output>
  <output aria-label="Reading anchor">{position?.messageId ?? "none"}</output>
</div>
<div
  data-story="virtual-history-frame"
  style:width={expanded ? "360px" : "640px"}
  style="height: 420px; max-width: 100%; display: flex; flex-direction: column;"
>
  <Layout
    scrollMode="history"
    conversationKey={presentation.key === key ? presentation.key : key}
    hasNewMessages={unread}
    onViewportChange={({ atLatest, active }) => {
      if (atLatest && active) unread = false;
    }}
  >
    {#snippet composer()}<span>Conversation composer</span>{/snippet}
    <MessageList
      {items}
      virtualize
      conversationKey={presentation.key === key ? presentation.key : key}
      onPositionChange={(next) => {
        position = next;
        if (
          JSON.stringify(presentation.position) !== JSON.stringify(next) ||
          presentation.key !== key
        )
          presentation = { key, position: next };
      }}
      scrollToTopAction={async () => {
        loads++;
        if (delay) await new Promise((resolve) => setTimeout(resolve, 250));
        const prefix = `older-${loads}`;
        items = [
          ...Array.from({ length: 50 }, (_, index) => ({
            id: `${prefix}-${index}`,
            text: `Earlier message ${index}`,
          })),
          ...items,
        ];
      }}
    >
      {#snippet row(item)}
        <Message sender="user"
          ><MessageBubble>
            <p>{item.text}</p>
            {#if expanded}<p>
                Additional image or expanded text changes this row's height
                without adding a message.
              </p>{/if}
            <Button size="xs" variant="ghost">Action for {item.id}</Button>
          </MessageBubble></Message
        >
      {/snippet}
    </MessageList>
  </Layout>
</div>
