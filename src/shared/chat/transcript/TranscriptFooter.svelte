<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import SendIcon from "@lucide/svelte/icons/send-horizontal";
  import QueueIcon from "@lucide/svelte/icons/arrow-up";
  import StopIcon from "@lucide/svelte/icons/square";
  import ComposerStatusBanner from "../../ai/composer/ComposerStatusBanner.svelte";
  import type { TranscriptFooterProps } from "./model.js";
  import "./transcript-footer.css";
  let {
    state,
    canSend,
    hasContent,
    busy = false,
    sendPending,
    stopping = false,
    disabled = false,
    onSend,
    onStop,
    status,
    statusPosition = "top",
    actions,
    workspace,
    controls,
    class: className,
    ...rest
  }: TranscriptFooterProps = $props();
  const active = $derived(busy);
  const content = $derived(
    hasContent ??
      (state ? !!state.message.trim() || state.pending.length > 0 : !!canSend),
  );
  const pending = $derived(
    sendPending ?? (!!state?.sending || !!state?.retainedSubmission),
  );
  const stopSelected = $derived(active && !!onStop && !content);
  const available = $derived(
    !disabled &&
      !pending &&
      (canSend ?? state?.canSend ?? false) &&
      !!(onSend || state),
  );
  const label = $derived(
    stopSelected
      ? stopping
        ? "Stopping agent"
        : "Stop agent"
      : active
        ? "Queue message"
        : "Send message",
  );
  const feedback = $derived(
    status ??
      (state?.error
        ? { type: "error" as const, message: state.error }
        : undefined),
  );
  function send() {
    if (!available) return;
    if (onSend) void onSend();
    else if (state) void state.send();
  }
  function stop() {
    if (!disabled && !stopping) void onStop?.();
  }
</script>

<div
  {...rest}
  class={["ui-transcript-footer", className].filter(Boolean).join(" ")}
  data-ui-component="transcript-footer"
>
  {#if feedback && statusPosition === "top"}<ComposerStatusBanner
      status={feedback}
      position="top"
    />{/if}
  <div
    class="ui-transcript-footer__body"
    role="group"
    aria-label="Message actions"
  >
    {#if actions}<div class="ui-transcript-footer__actions">
        {@render actions()}
      </div>{/if}
    {@render workspace?.()}{@render controls?.()}
    {#if active && onStop && content && pending}
      <Button
        size="icon-sm"
        variant="destructive"
        disabled={disabled || stopping}
        onclick={stop}
        aria-label={stopping ? "Stopping agent" : "Stop agent"}
        title="Stop active work"><StopIcon aria-hidden="true" /></Button
      >
    {/if}
    <Button
      size="icon-sm"
      variant={stopSelected ? "destructive" : "default"}
      class={stopSelected ? undefined : "ui-transcript-footer__send"}
      disabled={stopSelected ? disabled || stopping : !available}
      onclick={stopSelected ? stop : send}
      aria-label={label}
      aria-keyshortcuts={stopSelected ? undefined : "Control+Enter Meta+Enter"}
      title={stopSelected ? "Stop active work" : `${label} (⌘ / Ctrl + Enter)`}
      data-action={stopSelected ? "stop" : active ? "queue" : "send"}
      >{#if stopSelected}<StopIcon
          aria-hidden="true"
        />{:else if active}<QueueIcon aria-hidden="true" />{:else}<SendIcon
          aria-hidden="true"
        />{/if}</Button
    >
  </div>
  {#if feedback && statusPosition === "bottom"}<ComposerStatusBanner
      status={feedback}
      position="bottom"
    />{/if}
</div>
