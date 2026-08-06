<script lang="ts">
  import MicIcon from "@lucide/svelte/icons/mic";
  import MicOffIcon from "@lucide/svelte/icons/mic-off";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Tooltip from "@lapismd/design-core/shadcn/tooltip";
  import type { SpeechRecognitionController } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    dictation,
    size = "md",
    hiddenWhenUnsupported = false,
    label = "Dictate message",
  }: {
    ref?: HTMLSpanElement | null;
    dictation: SpeechRecognitionController;
    size?: "sm" | "md";
    hiddenWhenUnsupported?: boolean;
    label?: string;
  } = $props();

  const resolvedLabel = $derived(
    !dictation.isSupported
      ? "Dictation is not supported in this browser"
      : dictation.isListening
        ? "Stop dictation"
        : label,
  );
</script>

{#if dictation.isSupported || !hiddenWhenUnsupported}
  <span
    bind:this={ref}
    data-ui-component="ai-chat-dictation-button"
    data-ui-part="root"
    data-listening={dictation.isListening}
    data-speaking={dictation.isSpeaking}
    data-supported={dictation.isSupported}
    data-size={size}
  >
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              type="button"
              size={size === "sm" ? "icon-sm" : "icon"}
              variant={dictation.isListening ? "secondary" : "ghost"}
              aria-label={resolvedLabel}
              aria-pressed={dictation.isListening}
              disabled={!dictation.isSupported}
              onclick={() => void dictation.toggle()}
            >
              {#if dictation.isListening}
                <span data-ui-part="volume-bars" aria-hidden="true">
                  {#each dictation.bands as band, index (index)}
                    <span
                      data-ui-part="volume-bar"
                      style:height={`${Math.max(3, 3 + band * 13)}px`}
                    ></span>
                  {/each}
                </span>
              {:else if dictation.isSupported}
                <MicIcon aria-hidden="true" />
              {:else}
                <MicOffIcon aria-hidden="true" />
              {/if}
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content>{resolvedLabel}</Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  </span>
{/if}
