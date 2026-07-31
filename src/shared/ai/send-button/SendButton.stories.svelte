<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import CheckIcon from "@lucide/svelte/icons/check";
  import SendIcon from "@lucide/svelte/icons/send";
  import SparklesIcon from "@lucide/svelte/icons/sparkles";
  import Composer from "../composer/Composer.svelte";
  import SendButton from "./SendButton.svelte";

  const { Story } = defineMeta({
    title: "AI/Chat/Send Button",
    component: SendButton,
    parameters: {
      docs: {
        description: {
          component:
            "Circular send/stop toggle button for the chat composer. Place it inside ChatComposer where it reads context automatically: no wiring needed. When streaming starts, the button switches from a primary send icon to a secondary stop icon. Override any context value via props for standalone or custom usage.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let action = $state("Waiting");
  let composerValue = $state("");
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/astryx-showcase-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
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

<Story
  name="States"
  exportName="States"
  parameters={{
    docs: {
      description: {
        story:
          "Disabled, ready, and streaming states at both sizes. The button automatically toggles between send (primary) and stop (secondary) based on streaming state.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/states-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
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

<Story
  name="Custom icons"
  exportName="CustomIcons"
  parameters={{
    docs: {
      description: {
        story:
          "Send buttons with custom icons via sendIcon and stopIcon props. Use to match the personality of the chat experience: a paper airplane for messaging, sparkles for AI generation, or a check mark for confirmation flows.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/custom-icons-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
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

<Story
  name="In composer"
  exportName="InComposer"
  parameters={{
    docs: {
      description: {
        story:
          "Send button inside ChatComposer, where it reads state from context automatically. No wiring needed; the button enables when the input has content.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/in-composer-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
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
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/sends-a-message-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <div data-story="send-frame">
      <SendButton onSend={() => (action = "Sent")} />
      <output>{action}</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Stops a response"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/send-button/stops-a-response-chromium-darwin.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    },
  }}
  tags={["visual-approved"]}
>
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
