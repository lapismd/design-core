<script lang="ts">
  import { Button, type ButtonProps } from "../../shadcn/button/index.js";
  import ConfirmDialog, {
    type ConfirmDialogProps,
  } from "../confirm-dialog/ConfirmDialog.svelte";
  import type { Snippet } from "svelte";
  let {
    children,
    disabled = false,
    variant,
    size = "default",
    ...confirmation
  }: Omit<ConfirmDialogProps, "open"> & {
    children: Snippet;
    disabled?: boolean;
    variant?: ButtonProps["variant"];
    size?: ButtonProps["size"];
  } = $props();
  let open = $state(false);
  let trigger = $state<HTMLButtonElement | null>(null);
</script>

<Button
  bind:ref={trigger}
  {disabled}
  {size}
  variant={variant ?? (confirmation.destructive ? "destructive" : "outline")}
  onclick={() => (open = true)}>{@render children()}</Button
>
<ConfirmDialog
  {...confirmation}
  bind:open
  onCloseAutoFocus={(event) => {
    event.preventDefault();
    trigger?.focus();
    confirmation.onCloseAutoFocus?.(event);
  }}
/>
