<script module lang="ts">
  import CalendarIcon from "@lucide/svelte/icons/calendar";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SystemMessage from "./SystemMessage.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/System Message",
    component: SystemMessage,
    parameters: {
      docs: {
        description: {
          component:
            "Centered system note with an optional icon or shadcn Separator divider.",
        },
      },
    },
  });
</script>

<Story name="Default note">
  {#snippet template()}
    <div data-story="system-frame">
      <SystemMessage>
        {#snippet icon()}
          <CalendarIcon aria-hidden="true" />
        {/snippet}
        Conversation started today
      </SystemMessage>
    </div>
  {/snippet}
</Story>

<Story name="Divider">
  {#snippet template()}
    <div data-story="system-frame">
      <SystemMessage variant="divider">Unread messages</SystemMessage>
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="system-frame"]) {
    width: min(30rem, 90vw);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
  }
</style>
