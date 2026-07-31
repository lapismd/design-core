<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import Composer from "../composer/Composer.svelte";
  import DictationButton from "./DictationButton.svelte";
  import type { SpeechRecognitionController } from "../types.js";

  const unsupported: SpeechRecognitionController = {
    isSupported: false,
    isListening: false,
    isSpeaking: false,
    volume: 0,
    bands: [0, 0, 0, 0, 0],
    rawBands: [0, 0, 0, 0, 0],
    interimTranscript: "",
    start: async () => {},
    stop: () => {},
    abort: () => {},
    toggle: async () => {},
    cleanup: () => {},
  };

  const listening: SpeechRecognitionController = {
    isSupported: true,
    isListening: true,
    isSpeaking: true,
    volume: 0.52,
    bands: [0.25, 0.72, 0.95, 0.58, 0.32],
    rawBands: [0.2, 0.6, 0.8, 0.5, 0.25],
    interimTranscript: "Drafting",
    start: async () => {},
    stop: () => {},
    abort: () => {},
    toggle: async () => {},
    cleanup: () => {},
  };

  const { Story } = defineMeta({
    title: "AI/Chat/Dictation Button",
    component: DictationButton,
    parameters: {
      docs: {
        description: {
          component:
            "ChatDictationButton is a toggle button that starts and stops voice dictation inside a chat composer. It pairs with useChatDictation to show a microphone icon when idle and animated frequency bars when listening. Place it in the sendActions slot of ChatComposer.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let toggles = $state(0);
  let showcaseValue = $state("");
  let basicValue = $state("");
  const interactive: SpeechRecognitionController = {
    ...listening,
    isListening: false,
    isSpeaking: false,
    toggle: async () => {
      toggles += 1;
    },
  };

  const idle: SpeechRecognitionController = {
    ...listening,
    isListening: false,
    isSpeaking: false,
    volume: 0,
    bands: [0, 0, 0, 0, 0],
    rawBands: [0, 0, 0, 0, 0],
    interimTranscript: "",
  };
</script>

<Story
  name="ASTRYX showcase"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/dictation-button/astryx-showcase-chromium-darwin.png",
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
    <div data-story="dictation-showcase">
      <p>
        Click the microphone to start dictating. Speech is transcribed into the
        input.
      </p>
      <Composer
        bind:value={showcaseValue}
        placeholder="Type a message..."
        onSubmit={() => {
          showcaseValue = "";
        }}
      >
        {#snippet sendActions()}
          <DictationButton dictation={idle} />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Basic"
  exportName="Basic"
  parameters={{
    docs: {
      description: {
        story:
          "A dictation button wired to useChatDictation and placed in the sendActions slot of a ChatComposer. Click the microphone to transcribe speech into the input.",
      },
    },
    visualDelta: {
      images: [
        "/visual-baselines/ai/dictation-button/basic-chromium-darwin.png",
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
    <div data-story="dictation-composer">
      <Composer
        bind:value={basicValue}
        placeholder="Type a message..."
        onSubmit={() => {
          basicValue = "";
        }}
      >
        {#snippet sendActions()}
          <DictationButton dictation={idle} />
        {/snippet}
      </Composer>
    </div>
  {/snippet}
</Story>

<Story
  name="Invokes injected dictation"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Dictate message" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("1 toggle");
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/dictation-button/invokes-injected-dictation-chromium-darwin.png",
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
    <div data-story="dictation-row">
      <DictationButton dictation={interactive} />
      <output>{toggles} toggle</output>
    </div>
  {/snippet}
</Story>

<Story
  name="Listening bands"
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/dictation-button/listening-bands-chromium-darwin.png",
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
    <DictationButton dictation={listening} />
  {/snippet}
</Story>

<Story
  name="Unsupported browser"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", {
        name: "Dictation is not supported in this browser",
      }),
    ).toBeDisabled();
  }}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/ai/dictation-button/unsupported-browser-chromium-darwin.png",
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
    <DictationButton dictation={unsupported} />
  {/snippet}
</Story>

<style>
  :global([data-story="dictation-row"]) {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  :global([data-story="dictation-showcase"]) {
    display: flex;
    width: min(28.125rem, 90vw);
    flex-direction: column;
    gap: 1rem;
  }

  :global([data-story="dictation-showcase"] p) {
    margin: 0;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  :global([data-story="dictation-composer"]) {
    width: min(28.125rem, 90vw);
  }
</style>
