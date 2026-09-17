<script lang="ts" module>
  import type { ComponentProps, Snippet } from "svelte";
  import type * as AlertDialogTypes from "../../shadcn/alert-dialog/index.js";
  export interface ConfirmDialogProps {
    open?: boolean;
    title: string | Snippet;
    description: string | Snippet;
    confirmLabel?: string | Snippet;
    children?: Snippet;
    confirmDisabled?: boolean;
    cancelLabel?: string;
    destructive?: boolean;
    pending?: boolean;
    error?: string;
    /** Resolve false to retain an externally reported validation error. Reject to show a retryable error. */
    onConfirm: () => void | boolean | Promise<void | boolean>;
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    onCloseAutoFocus?: ComponentProps<
      typeof AlertDialogTypes.Content
    >["onCloseAutoFocus"];
    portalProps?: ComponentProps<
      typeof AlertDialogTypes.Content
    >["portalProps"];
  }
</script>

<script lang="ts">
  import * as AlertDialog from "../../shadcn/alert-dialog/index.js";
  import { Button } from "../../shadcn/button/index.js";
  import "./ConfirmDialog.css";
  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    children,
    confirmDisabled = false,
    destructive = false,
    pending = false,
    error = "",
    onConfirm,
    onCancel,
    onOpenChange,
    onCloseAutoFocus,
    portalProps,
  }: ConfirmDialogProps = $props();
  let submitting = $state(false);
  let failure = $state("");
  const busy = $derived(pending || submitting);
  $effect(() => {
    if (!open) failure = "";
  });
  function changeOpen(next: boolean) {
    if (busy) return;
    open = next;
    onOpenChange?.(next);
    if (!next) onCancel?.();
  }
  async function confirm() {
    if (busy) return;
    submitting = true;
    failure = "";
    try {
      if ((await onConfirm()) !== false) {
        open = false;
        onOpenChange?.(false);
      }
    } catch (cause) {
      failure =
        cause instanceof Error
          ? cause.message
          : "The action failed. Please try again.";
    } finally {
      submitting = false;
    }
  }
</script>

<AlertDialog.Root {open} onOpenChange={changeOpen}>
  <AlertDialog.Content
    data-ui-confirm-dialog=""
    {...portalProps === undefined ? {} : { portalProps }}
    {...onCloseAutoFocus === undefined ? {} : { onCloseAutoFocus }}
    onEscapeKeydown={(event) => {
      if (busy) event.preventDefault();
    }}
  >
    <AlertDialog.Header>
      <AlertDialog.Title
        >{#if typeof title === "string"}{title}{:else}{@render title()}{/if}</AlertDialog.Title
      >
      <AlertDialog.Description
        >{#if typeof description === "string"}{description}{:else}{@render description()}{/if}</AlertDialog.Description
      >
    </AlertDialog.Header>
    {@render children?.()}
    {#if failure || error}<p role="alert">{failure || error}</p>{/if}
    <AlertDialog.Footer>
      <Button
        variant="outline"
        disabled={busy}
        onclick={() => changeOpen(false)}
        autofocus>{cancelLabel}</Button
      >
      <Button
        variant={destructive ? "destructive" : "default"}
        disabled={busy || confirmDisabled}
        aria-busy={busy}
        onclick={confirm}
        >{#if busy}Working…{:else if typeof confirmLabel === "string"}{confirmLabel}{:else}{@render confirmLabel()}{/if}</Button
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
