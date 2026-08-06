<script lang="ts">
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import SquareIcon from "@lucide/svelte/icons/square";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { Snippet } from "svelte";
  import "../chat.css";

  let {
    ref = $bindable(null),
    isStopShown = false,
    isDisabled = false,
    size = "md",
    sendIcon,
    stopIcon,
    onSend = () => {},
    onStop = () => {},
  }: {
    ref?: HTMLButtonElement | null;
    isStopShown?: boolean;
    isDisabled?: boolean;
    size?: "sm" | "md";
    sendIcon?: Snippet;
    stopIcon?: Snippet;
    onSend?: () => void;
    onStop?: () => void;
  } = $props();
</script>

<Button
  bind:ref
  type="button"
  data-ui-part="send-button"
  size={size === "sm" ? "icon-sm" : "icon"}
  variant={isStopShown ? "secondary" : "default"}
  disabled={isDisabled && !isStopShown}
  aria-label={isStopShown ? "Stop response" : "Send message"}
  onclick={isStopShown ? onStop : onSend}
>
  {#if isStopShown}
    {#if stopIcon}
      {@render stopIcon()}
    {:else}
      <SquareIcon aria-hidden="true" />
    {/if}
  {:else if sendIcon}
    {@render sendIcon()}
  {:else}
    <ArrowUpIcon aria-hidden="true" />
  {/if}
</Button>
