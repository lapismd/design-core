<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import Layout from "../layout/Layout.svelte";
  import MessageList from "./MessageList.svelte";
  import Message from "../message/Message.svelte";
  import MessageBubble from "../message-bubble/MessageBubble.svelte";
  let items = $state(
    Array.from({ length: 100 }, (_, index) => ({
      id: `legacy-${index}`,
      text: `Existing message ${index}`,
    })),
  );
  let loads = $state(0);
  let expanded = $state(false);
</script>

<Button
  onclick={() =>
    (items = [...items, { id: "incoming", text: "New incoming message" }])}
  >Receive explicit arrival</Button
>
<Button onclick={() => (expanded = !expanded)}>Reflow existing content</Button>
<output aria-label="Legacy history requests">{loads}</output>
<div
  data-story="legacy-history-frame"
  style="height: 420px; width: 540px; display: flex; flex-direction: column;"
>
  <Layout>
    {#snippet composer()}<span>Existing composer snippet</span>{/snippet}
    <MessageList
      density="compact"
      gap="8px"
      latestMessageId={items.at(-1)?.id}
      scrollToTopAction={async () => {
        loads++;
        items = [
          { id: `earlier-${loads}`, text: `Earlier context ${loads}` },
          ...items,
        ];
      }}
    >
      {#each items as item (item.id)}
        <Message sender="user"
          ><MessageBubble>
            {item.text}
            {#if expanded}<p>Reflow without a new message</p>{/if}
          </MessageBubble></Message
        >
      {/each}
    </MessageList>
  </Layout>
</div>
