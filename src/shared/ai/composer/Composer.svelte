<script lang="ts">
  import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import ComposerInput from "../composer-input/ComposerInput.svelte";
  import SendButton from "../send-button/SendButton.svelte";
  import { setComposerContext } from "../context.svelte.js";
  import type {
    ComposerInputHandle,
    ComposerStatus,
    ComposerTrigger,
    Density,
  } from "../types.js";
  import "../chat.css";

  let {
    ref = $bindable(null),
    value = $bindable(""),
    placeholder = "Ask the assistant…",
    disabled = false,
    interactiveDrawerWhenDisabled = false,
    density = "balanced",
    elevation = "low",
    isStopShown = false,
    status,
    statusPosition = "bottom",
    triggers = [],
    drawer,
    headerContext,
    headerActions,
    input,
    footerActions,
    sendActions,
    sendButton,
    onSubmit,
    onStop = () => {},
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & {
    ref?: HTMLDivElement | null;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    interactiveDrawerWhenDisabled?: boolean;
    density?: Density;
    elevation?: "none" | "low";
    isStopShown?: boolean;
    status?: ComposerStatus;
    statusPosition?: "top" | "bottom";
    triggers?: ComposerTrigger[];
    drawer?: Snippet;
    headerContext?: Snippet;
    headerActions?: Snippet;
    input?: Snippet;
    footerActions?: Snippet;
    sendActions?: Snippet;
    sendButton?: Snippet<
      [{ canSend: boolean; submit: () => void; stop: () => void }]
    >;
    onSubmit: (value: string) => void;
    onStop?: () => void;
  } = $props();

  let inputHandle = $state<ComposerInputHandle | null>(null);
  const canSend = $derived(!disabled && value.trim().length > 0);

  function submit(): void {
    if (!canSend) return;
    const submitted = value.trim();
    onSubmit(submitted);
    value = "";
  }

  function stop(): void {
    onStop();
  }

  setComposerContext({
    getValue: () => value,
    setValue(next) {
      value = next;
    },
    submit,
    stop,
    getDisabled: () => disabled,
    getStopShown: () => isStopShown,
    getCanSend: () => canSend,
    getPlaceholder: () => placeholder,
    setInputHandle(handle) {
      inputHandle = handle;
    },
    getInputHandle: () => inputHandle,
  });

  function handleShellClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "button, a, input, textarea, [contenteditable='true'], [role='option']",
      )
    ) {
      return;
    }
    inputHandle?.focus();
  }
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="ai-chat-composer"
  data-ui-part="root"
  data-density={density}
  data-elevation={elevation}
  data-disabled={disabled}
  data-stop-shown={isStopShown}
  data-interactive-drawer-when-disabled={interactiveDrawerWhenDisabled}
  onclick={handleShellClick}
>
  {#if status && statusPosition === "top"}
    <div
      data-ui-part="status"
      data-position="top"
      data-status={status.type}
      role={status.type === "error" ? "alert" : "status"}
    >
      <TriangleAlertIcon aria-hidden="true" />
      <span>{status.message ?? status.type}</span>
    </div>
  {/if}

  {#if drawer}
    <div data-ui-part="drawer">
      {@render drawer()}
    </div>
  {/if}

  <div data-ui-part="body">
    {#if headerContext || headerActions}
      <div data-ui-part="header">
        <div data-ui-part="header-actions">
          {@render headerActions?.()}
        </div>
        <div data-ui-part="header-context">
          {@render headerContext?.()}
        </div>
      </div>
    {/if}

    <div data-ui-part="input-area">
      {#if input}
        {@render input()}
      {:else}
        <ComposerInput
          bind:value
          bind:handle={inputHandle}
          {placeholder}
          {disabled}
          {triggers}
          onSubmit={submit}
        />
      {/if}
    </div>

    <div data-ui-part="footer">
      <div data-ui-part="footer-actions">
        {@render footerActions?.()}
      </div>
      <div data-ui-part="send-actions">
        {@render sendActions?.()}
        {#if sendButton}
          {@render sendButton({ canSend, submit, stop })}
        {:else}
          <SendButton
            isDisabled={!canSend}
            {isStopShown}
            onSend={submit}
            onStop={stop}
          />
        {/if}
      </div>
    </div>
  </div>

  {#if status && statusPosition === "bottom"}
    <div
      data-ui-part="status"
      data-position="bottom"
      data-status={status.type}
      role={status.type === "error" ? "alert" : "status"}
    >
      <TriangleAlertIcon aria-hidden="true" />
      <span>{status.message ?? status.type}</span>
    </div>
  {/if}
</div>
