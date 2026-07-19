<script lang="ts" module>
  
    export const EMPTY_MEDIA_VARIANTS = [
    "default",
    "icon",
  ] as const;
  export type EmptyMediaVariant = (typeof EMPTY_MEDIA_VARIANTS)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function emptyMediaVariants(_opts?: {
    variant?: EmptyMediaVariant;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    variant = "default",
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    variant?: EmptyMediaVariant;
  } = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="empty"
  data-ui-part="empty-media"
  data-slot="empty-icon"
  data-variant={variant}
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>
