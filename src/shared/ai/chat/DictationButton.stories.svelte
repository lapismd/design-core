<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import DictationButton from "./DictationButton.svelte";
  import type { SpeechRecognitionController } from "./types.js";

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
            "Progressively enhanced microphone control with unsupported and live volume-band states.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let toggles = $state(0);
  const interactive: SpeechRecognitionController = {
    ...listening,
    isListening: false,
    isSpeaking: false,
    toggle: async () => {
      toggles += 1;
    },
  };
</script>

<Story
  name="Invokes injected dictation"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Dictate message" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("1 toggle");
  }}
>
  {#snippet template()}
    <div data-story="dictation-row">
      <DictationButton dictation={interactive} />
      <output>{toggles} toggle</output>
    </div>
  {/snippet}
</Story>

<Story name="Listening bands">
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
</style>
