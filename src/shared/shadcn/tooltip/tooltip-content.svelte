<script lang="ts">
  import { Tooltip as TooltipPrimitive } from "bits-ui";
    import TooltipPortal from "./tooltip-portal.svelte";
  import type { ComponentProps } from "svelte";
  import type { WithoutChildrenOrChild } from "../../../lib/utils.js";

  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 0,
    side = "top",
    children,
    arrowClasses,
    portalProps,
    ...restProps
  }: TooltipPrimitive.ContentProps & {
    arrowClasses?: string;
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof TooltipPortal>>;
  } = $props();
</script>

<TooltipPortal {...portalProps}>
  <TooltipPrimitive.Content
    bind:ref
    data-ui-component="tooltip"
    data-ui-part="tooltip-content"
        data-slot="tooltip-content"
    {sideOffset}
    {side}
    class={className}
    {...restProps}
  >
    {@render children?.()}
    <TooltipPrimitive.Arrow>
      {#snippet child({ props })}
        <div
          class={arrowClasses}
          {...props}
        ></div>
      {/snippet}
    </TooltipPrimitive.Arrow>
  </TooltipPrimitive.Content>
</TooltipPortal>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{z-index:50}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{display:inline-flex}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{width:calc(var(--spacing) * 2.5);height:calc(var(--spacing) * 2.5)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{width:fit-content}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{max-width:var(--container-xs)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{transform-origin:var(--bits-tooltip-content-transform-origin)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{--tw-translate-y:calc(-50% - 2px);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{rotate:45deg}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{align-items:center}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{gap:calc(var(--spacing) * 1.5)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{border-radius:2px}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{border-radius:calc(var(--radius) * .8)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{background-color:var(--foreground)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{fill:var(--foreground)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{padding-inline:calc(var(--spacing) * 3)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{padding-block:calc(var(--spacing) * 1.5)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{font-size:var(--text-xs);line-height:var(--tw-leading,var(--text-xs--line-height))}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]{color:var(--background)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"]:has([data-slot=kbd]){padding-right:calc(var(--spacing) * 1.5)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=bottom]{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=bottom]{--tw-translate-y:calc(calc(-50% + 1px) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=bottom]{--tw-enter-translate-y:calc(2*var(--spacing)*-1)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=left]{--tw-translate-y:calc(calc(50% - 3px) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=left]{--tw-enter-translate-x:calc(2*var(--spacing))}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=right]{--tw-translate-x:calc(50% + 2px);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=right]{--tw-translate-y:calc(1 / 2 * 100%);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=right]{--tw-enter-translate-x:calc(2*var(--spacing)*-1)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=top]{--tw-translate-x:calc(1 / 2 * 100%);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=top]{--tw-translate-y:calc(-50% + 2px);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-side=top]{--tw-enter-translate-y:calc(2*var(--spacing))}:is([data-ui-component="tooltip"][data-ui-part="tooltip-content"] *)[data-slot=kbd]{position:relative}:is([data-ui-component="tooltip"][data-ui-part="tooltip-content"] *)[data-slot=kbd]{isolation:isolate}:is([data-ui-component="tooltip"][data-ui-part="tooltip-content"] *)[data-slot=kbd]{z-index:50}:is([data-ui-component="tooltip"][data-ui-part="tooltip-content"] *)[data-slot=kbd]{border-radius:calc(var(--radius) * .6)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=closed]{animation:exit var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=closed]{--tw-exit-opacity:0}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=closed]{--tw-exit-scale:.95}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=delayed-open]{animation:enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=delayed-open]{--tw-enter-opacity:0}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=delayed-open]{--tw-enter-scale:.95}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=instant-open]{animation:enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=instant-open]{--tw-enter-opacity:0}[data-ui-component="tooltip"][data-ui-part="tooltip-content"][data-state=instant-open]{--tw-enter-scale:.95}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-z{syntax:"*";inherits:false;initial-value:0}
  }
</style>
