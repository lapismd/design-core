<script module lang="ts">
  import CircleCheckIcon from "@lucide/svelte/icons/circle-check";
  import LockIcon from "@lucide/svelte/icons/lock";
  import ShieldCheckIcon from "@lucide/svelte/icons/shield-check";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import UserMinusIcon from "@lucide/svelte/icons/user-minus";
  import UserPlusIcon from "@lucide/svelte/icons/user-plus";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MessageList from "../message-list/MessageList.svelte";
  import SystemMessage from "./SystemMessage.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/System Message",
    component: SystemMessage,
    parameters: {
      docs: {
        description: {
          component:
            "Centered system message for non-sender content like date separators, membership changes, and status notices. It is not a chat bubble; it has no avatar, no alignment, and no sender context. Use the divider variant for temporal breaks and default for inline status updates."}}}});
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/system-message/astryx-showcase-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
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

<Story
  name="Status updates"
  exportName="StatusUpdates"
  parameters={{
    docs: {
      description: {
        story:
          "Realistic status messages in a conversation flow showing membership changes, timestamps, and resolution notices."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/system-message/status-updates-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
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

<Story
  name="Variants"
  exportName="Variants"
  parameters={{
    docs: {
      description: {
        story:
          "Default and divider variants side by side. Use default for inline status updates and divider for date separators or section breaks."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/system-message/variants-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
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

<Story
  name="With icon"
  exportName="WithIcon"
  parameters={{
    docs: {
      description: {
        story:
          "System messages with a leading icon that reinforces the message type. Use icons to help users scan and identify message categories at a glance."}},
    visualDelta: {
      images: [
        "/visual-baselines/ai/system-message/with-icon-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right"
    }}}
  tags={["visual-approved"]}
>
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
