<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import type { WithElementRef } from "../../../lib/utils.js";

  /**
   * Low-level collapsed rail escape hatch. Prefer `Column` with a collapsible
   * controller config so collapse/expand stays controller-owned.
   */
  let {
    ref = $bindable(null),
    label,
    count,
    onExpand,
    class: className,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement> & {
    label: string;
    count?: number;
    onExpand: () => void;
  } = $props();
</script>

<section
  bind:this={ref}
  {...restProps}
  class={className}
  data-ui-component="column-canvas"
  data-ui-part="collapsed-column"
>
  <button
    type="button"
    data-ui-component="column-canvas"
    data-ui-part="collapsed-trigger"
    aria-label={`Expand ${label} column`}
    title={count === undefined ? label : `${label} (${count})`}
    onclick={onExpand}
  >
    <span data-ui-component="column-canvas" data-ui-part="collapsed-label">
      <span>{label}</span>
      {#if count !== undefined}
        <span data-ui-component="column-canvas" data-ui-part="collapsed-count">
          {count}
        </span>
      {/if}
    </span>
    <ChevronRight />
  </button>
</section>
