<script lang="ts">
  import { AlertDialog as AlertDialogPrimitive } from "bits-ui";
  import {
    buttonVariants,
    type ButtonSize,
    type ButtonVariant,
  } from "../button/index.js";
  import { cn } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    variant = "default",
    size = "default",
    ...restProps
  }: AlertDialogPrimitive.ActionProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
  } = $props();
</script>

<AlertDialogPrimitive.Action
  bind:ref
  data-ui-component="alert-dialog"
  data-ui-part="alert-dialog-action"
  data-slot="alert-dialog-action"
  class={cn(buttonVariants({ variant, size }), className)}
  {...restProps}
/>
