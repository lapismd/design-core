export const Virtualized = `<script lang="ts">
  import { Layout, MessageList, type MessageListPosition } from "@lapismd/design-core/ai/chat";
  let messages = $state([{ id: "message-1", text: "Hello" }]);
  let savedPosition = $state<MessageListPosition>();
  let unread = $state(false);
</script>
<Layout scrollMode="history" conversationKey="channel-a" hasNewMessages={unread}
  onViewportChange={({ atLatest, active }) => { if (atLatest && active) unread = false; }}>
  {#snippet composer()}<p>Your composer</p>{/snippet}
  <MessageList items={messages} virtualize conversationKey="channel-a"
    initialPosition={savedPosition} onPositionChange={(position) => savedPosition = position}
    hasOlder={false}>
    {#snippet row(message)}<p>{message.text}</p>{/snippet}
  </MessageList>
</Layout>`;

export const Legacy = `<script lang="ts">
  import { Layout, MessageList, Message, MessageBubble } from "@lapismd/design-core/ai/chat";
  let messages = $state([{ id: "one", text: "Existing message" }]);
  async function loadOlder() {
    messages = [{ id: "earlier", text: "Earlier context" }, ...messages];
  }
</script>
<Layout>
  {#snippet composer()}<p>Your existing composer</p>{/snippet}
  <MessageList density="compact" gap="8px" latestMessageId={messages.at(-1)?.id} scrollToTopAction={loadOlder}>
    {#each messages as message (message.id)}
      <Message sender="user"><MessageBubble>{message.text}</MessageBubble></Message>
    {/each}
  </MessageList>
</Layout>`;
