<script lang="ts">
  import AuthorCard from "./AuthorCard.svelte";
  import MessageCircle from "@lucide/svelte/icons/message-circle";
  let {
    interaction = "popover",
    mention = false,
  }: { interaction?: "hover" | "popover"; mention?: boolean } = $props();
  let result = $state("");
  const author = {
    id: "alex",
    name: "Alex Morgan",
    initials: "AM",
    presence: "online" as const,
  };
</script>

<div style="padding:1rem;max-width:24rem">
  <AuthorCard
    {author}
    {interaction}
    trigger={mention ? "mention" : "avatar"}
    handle="@alex"
    role="Designer"
    description="Building thoughtful tools for teams. Available for a conversation."
    actions={[
      {
        id: "message",
        label: "Message",
        icon: MessageCircle,
        onSelect: () => (result = "Message Alex Morgan"),
      },
      {
        id: "activity",
        label: "Activity",
        disabled: true,
        onSelect: () => (result = "unexpected"),
      },
    ]}
  />
  <p data-testid="author-action">{result}</p>
</div>
