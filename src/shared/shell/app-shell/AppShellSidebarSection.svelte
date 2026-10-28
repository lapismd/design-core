<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import "./AppShell.extensions.css";

  let {
    ref = $bindable(null),
    heading,
    actions,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Host-owned heading markup; no heading level or navigation state is inferred. */
    heading?: Snippet;
    /** Optional section actions beside the heading. */
    actions?: Snippet;
  } = $props();
</script>

<div
  bind:this={ref}
  {...restProps}
  data-ui-component="app-shell"
  data-ui-part="sidebar-section"
>
  {#if heading || actions}
    <div data-ui-part="sidebar-section-header">
      {#if heading}<div data-ui-part="sidebar-section-heading">
          {@render heading()}
        </div>{/if}
      {#if actions}<div data-ui-part="sidebar-section-actions">
          {@render actions()}
        </div>{/if}
    </div>
  {/if}
  {@render children?.()}
</div>
