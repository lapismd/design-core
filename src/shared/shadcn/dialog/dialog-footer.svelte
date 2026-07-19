<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { Button } from "../button/index.js";
  import { type WithElementRef } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    showCloseButton = false,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    showCloseButton?: boolean;
  } = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="dialog"
  data-ui-part="dialog-footer"
    data-slot="dialog-footer"
  class={className}
  {...restProps}
>
  {@render children?.()}
  {#if showCloseButton}
    <DialogPrimitive.Close>
      {#snippet child({ props })}
        <Button variant="outline" {...props}>Close</Button>
      {/snippet}
    </DialogPrimitive.Close>
  {/if}
</div>
