<script lang="ts">
  import { type WithElementRef } from "../../../lib/utils.js";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
  bind:this={ref}
  data-ui-component="sidebar"
  data-ui-part="sidebar-content"
    data-slot="sidebar-content"
  class={className}
  {...restProps}
>
  {@render children?.()}
</div>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="sidebar"][data-ui-part="sidebar-footer"],[data-ui-component="sidebar"][data-ui-part="sidebar-header"],[data-ui-component="sidebar"][data-ui-part="sidebar-provider"]{display:flex}[data-ui-component="sidebar"][data-ui-part="sidebar-provider"]{height:100%}[data-ui-component="sidebar"][data-ui-part="sidebar-content"],[data-ui-component="sidebar"][data-ui-part="sidebar-provider"]{min-height:0}[data-ui-component="sidebar"][data-ui-part="sidebar-root"]{width:calc(var(--spacing) * 72)}[data-ui-component="sidebar"][data-ui-part="sidebar-provider"]{width:100%}[data-ui-component="sidebar"][data-ui-part="sidebar-content"]{flex:1}[data-ui-component="sidebar"][data-ui-part="sidebar-footer"],[data-ui-component="sidebar"][data-ui-part="sidebar-header"],[data-ui-component="sidebar"][data-ui-part="sidebar-root"]{flex-shrink:0}[data-ui-component="sidebar"][data-ui-part="sidebar-footer"],[data-ui-component="sidebar"][data-ui-part="sidebar-header"]{flex-direction:column}[data-ui-component="sidebar"][data-ui-part="sidebar-footer"],[data-ui-component="sidebar"][data-ui-part="sidebar-header"]{gap:calc(var(--spacing) * 2)}[data-ui-component="sidebar"][data-ui-part="sidebar-content"]{overflow-y:auto}[data-ui-component="sidebar"][data-ui-part="sidebar-root"]{background-color:var(--sidebar)}[data-ui-component="sidebar"][data-ui-part="sidebar-footer"],[data-ui-component="sidebar"][data-ui-part="sidebar-header"]{padding:calc(var(--spacing) * 4)}[data-ui-component="sidebar"][data-ui-part="sidebar-content"]{padding-inline:calc(var(--spacing) * 4)}[data-ui-component="sidebar"][data-ui-part="sidebar-root"]{color:var(--sidebar-foreground)}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}
  }
</style>
