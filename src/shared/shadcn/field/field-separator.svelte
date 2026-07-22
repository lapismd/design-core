<script lang="ts">
  import { Separator } from "../separator/index.js";
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    children?: Snippet;
  } = $props();

  const hasContent = $derived(!!children);
</script>

<div
  bind:this={ref}
  data-ui-component="field"
  data-ui-part="field-separator"
  data-slot="field-separator"
  data-content={hasContent}
  class={className}
  {...restProps}
>
  <Separator
    dataUiComponent="field"
    data-ui-part="field-separator-anon-0"
    data-slot="field-separator-anon-0"
  />
  {#if children}
    <span
      data-ui-component="field"
      data-ui-part="field-separator-content"
      data-slot="field-separator-content"
    >
      {@render children()}
    </span>
  {/if}
</div>
