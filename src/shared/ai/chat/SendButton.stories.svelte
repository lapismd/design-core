<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SendButton from "./SendButton.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Send Button",
    component: SendButton,
    parameters: {
      docs: {
        description: {
          component: "shadcn Button adapter for send and stop response states.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("Waiting");
</script>

<Story
  name="Sends a message"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Send message" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Sent");
  }}
>
  {#snippet template()}
    <div data-story="send-frame">
      <SendButton onSend={() => (action = "Sent")} />
      <output>{action}</output>
    </div>
  {/snippet}
</Story>

<Story name="Stops a response">
  {#snippet template()}
    <div data-story="send-frame">
      <SendButton isStopShown onStop={() => (action = "Stopped")} />
    </div>
  {/snippet}
</Story>

<style>
  :global([data-story="send-frame"]) {
    display: flex;
    min-width: 12rem;
    align-items: center;
    gap: 0.75rem;
  }
</style>
