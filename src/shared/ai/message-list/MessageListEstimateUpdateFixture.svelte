<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import Layout from "../layout/Layout.svelte";
  import MessageList from "./MessageList.svelte";

  const items = Array.from({ length: 200 }, (_, index) => ({
    id: `estimate-${index}`,
    label: `Estimated row ${index}`,
  }));
  let firstDetail = $state(false);
  const estimate = $derived.by(() => {
    const detail = firstDetail;
    return (_item: (typeof items)[number], index: number) =>
      detail && index === 0 ? 864 : 64;
  });
</script>

<Button onclick={() => (firstDetail = true)}>Load first message detail</Button>
<div
  style="height: 420px; max-width: 40rem; display: flex; flex-direction: column;"
>
  <Layout scrollMode="history" conversationKey="estimate-updates">
    {#snippet composer()}<span>Conversation composer</span>{/snippet}
    <MessageList
      {items}
      estimateSize={estimate}
      retainRowIds={[]}
      virtualize
      conversationKey="estimate-updates"
    >
      {#snippet row(item, index)}<div
          data-story="estimated-row"
          style:height={firstDetail && index === 0 ? "864px" : "64px"}
        >
          {item.label}
          {#if firstDetail && index === 0}<span
              >Loaded first message detail</span
            >{/if}
        </div>{/snippet}
    </MessageList>
  </Layout>
</div>
