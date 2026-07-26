<script module lang="ts">
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import LockIcon from "@lucide/svelte/icons/lock";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import UserMinusIcon from "@lucide/svelte/icons/user-minus";
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MessageList from "./MessageList.svelte";
  import SystemMessage from "./SystemMessage.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/System Message",
    component: SystemMessage,
    parameters: {
      docs: {
        description: {
          component:
            "Centered, non-sender status content with optional icon or shadcn Separator divider. These fixtures reproduce ASTRYX’s showcase and documented variants.",
        },
      },
    },
  });
</script>

<Story name="ASTRYX showcase">
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <SystemMessage variant="divider">March 15, 2026</SystemMessage>
      <SystemMessage>Alex joined the conversation</SystemMessage>
      <SystemMessage>Agent is thinking…</SystemMessage>
      <SystemMessage variant="divider">Today</SystemMessage>
      <SystemMessage>Conversation marked as resolved</SystemMessage>
    </MessageList>
  {/snippet}
</Story>

<Story name="Status updates">
  {#snippet template()}
    <MessageList style="max-width: 31.25rem">
      <SystemMessage variant="divider">March 14, 2026</SystemMessage>
      <SystemMessage>
        {#snippet icon()}<UserPlusIcon aria-hidden="true" />{/snippet}
        Sarah Chen joined the conversation
      </SystemMessage>
      <SystemMessage>Topic changed to "Q2 Launch Planning"</SystemMessage>
      <SystemMessage variant="divider">March 15, 2026</SystemMessage>
      <SystemMessage>
        {#snippet icon()}<UserMinusIcon aria-hidden="true" />{/snippet}
        Alex Rivera left the conversation
      </SystemMessage>
      <SystemMessage variant="divider">Today</SystemMessage>
      <SystemMessage>
        {#snippet icon()}<CircleCheckIcon aria-hidden="true" />{/snippet}
        Conversation marked as resolved
      </SystemMessage>
    </MessageList>
  {/snippet}
</Story>

<Story name="Variants">
  {#snippet template()}
    <div data-story="reference-sections" style="max-width: 31.25rem">
      <section>
        <p>Default</p>
        <MessageList>
          <SystemMessage>Alex joined the conversation</SystemMessage>
          <SystemMessage>Conversation marked as resolved</SystemMessage>
        </MessageList>
      </section>
      <section>
        <p>Divider</p>
        <MessageList>
          <SystemMessage variant="divider">March 15, 2026</SystemMessage>
          <SystemMessage variant="divider">Today</SystemMessage>
        </MessageList>
      </section>
    </div>
  {/snippet}
</Story>

<Story name="With icon">
  {#snippet template()}
    <div data-story="reference-sections" style="max-width: 31.25rem">
      <p>Icons reinforce the message type</p>
      <MessageList>
        <SystemMessage>
          {#snippet icon()}<UserPlusIcon aria-hidden="true" />{/snippet}
          Jordan was added to the conversation
        </SystemMessage>
        <SystemMessage>
          {#snippet icon()}<LockIcon aria-hidden="true" />{/snippet}
          Messages are end-to-end encrypted
        </SystemMessage>
        <SystemMessage>
          {#snippet icon()}<SparklesIcon aria-hidden="true" />{/snippet}
          Agent is generating a response…
        </SystemMessage>
        <SystemMessage>
          {#snippet icon()}<ShieldCheckIcon aria-hidden="true" />{/snippet}
          Conversation verified by admin
        </SystemMessage>
      </MessageList>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="reference-sections"]) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 1.25rem;
  }

  :global([data-story="reference-sections"] section) {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  :global([data-story="reference-sections"] p) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
