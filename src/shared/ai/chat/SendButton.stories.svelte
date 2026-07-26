<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CheckIcon from "@lucide/svelte/icons/check";
  import SendIcon from "@lucide/svelte/icons/send";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import Composer from "./Composer.svelte";
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
  let composerValue = $state("");
</script>

<Story name="ASTRYX showcase">
  {#snippet template()}
    <div data-story="send-frame">
      <SendButton isDisabled={false} onSend={() => {}} />
      <SendButton isDisabled={false} onSend={() => {}}>
        {#snippet sendIcon()}<SparklesIcon aria-hidden="true" />{/snippet}
      </SendButton>
      <SendButton isStopShown onStop={() => {}} />
    </div>
  {/snippet}
</Story>

<Story name="States">
  {#snippet template()}
    <div data-story="send-stack">
      <span>Send disabled</span>
      <SendButton isDisabled onSend={() => {}} />
      <span>Send enabled</span>
      <SendButton isDisabled={false} onSend={() => {}} />
      <span>Stop response</span>
      <SendButton isStopShown onStop={() => {}} />
    </div>
  {/snippet}
</Story>

<Story name="Custom icons">
  {#snippet template()}
    <div data-story="send-stack" data-direction="row">
      <SendButton isDisabled={false} onSend={() => {}}>
        {#snippet sendIcon()}<SendIcon aria-hidden="true" />{/snippet}
      </SendButton>
      <SendButton isDisabled={false} onSend={() => {}}>
        {#snippet sendIcon()}<CheckIcon aria-hidden="true" />{/snippet}
      </SendButton>
      <SendButton isDisabled={false} onSend={() => {}}>
        {#snippet sendIcon()}<SparklesIcon aria-hidden="true" />{/snippet}
      </SendButton>
      <SendButton isStopShown onStop={() => {}}>
        {#snippet stopIcon()}<CheckIcon aria-hidden="true" />{/snippet}
      </SendButton>
    </div>
  {/snippet}
</Story>

<Story name="In composer">
  {#snippet template()}
    <div data-story="send-composer">
      <Composer
        bind:value={composerValue}
        placeholder="Type a message..."
        onSubmit={() => {
          composerValue = "";
        }}
      />
    </div>
  {/snippet}
</Story>

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

  :global([data-story="send-stack"]) {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.75rem 1.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  :global([data-story="send-stack"][data-direction="row"]) {
    display: flex;
  }

  :global([data-story="send-composer"]) {
    width: min(28.125rem, 90vw);
  }
</style>
