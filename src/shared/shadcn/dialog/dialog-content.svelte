<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import type { ComponentProps, Snippet } from "svelte";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { Button } from "../button/index.js";
  import { type WithoutChildrenOrChild } from "../../../lib/utils.js";
  import * as Dialog from "./index.js";
  import DialogPortal from "./dialog-portal.svelte";

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    children,
    showCloseButton = true,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DialogPortal>>;
    children: Snippet;
    showCloseButton?: boolean;
  } = $props();
</script>

<DialogPortal {...portalProps}>
  <Dialog.Overlay />
  <DialogPrimitive.Content
    bind:ref
    data-ui-component="dialog"
    data-ui-part="dialog-content"
        data-slot="dialog-content"
    class={className}
    {...restProps}
  >
    {@render children?.()}
    {#if showCloseButton}
      <DialogPrimitive.Close data-slot="dialog-close">
        {#snippet child({ props })}
          <Button
            variant="ghost"
            class="absolute top-4 right-4"
            size="icon-sm"
            {...props}
          >
            <XIcon />
            <span class="sr-only">Close</span>
          </Button>
        {/snippet}
      </DialogPrimitive.Close>
    {/if}
  </DialogPrimitive.Content>
</DialogPortal>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="dialog"][data-ui-part="dialog-content"],[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{position:fixed}[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{inset:0}[data-ui-component="dialog"][data-ui-part="dialog-content"]{top:50%}[data-ui-component="dialog"][data-ui-part="dialog-content"]{left:50%}[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{isolation:isolate}[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{z-index:80}[data-ui-component="dialog"][data-ui-part="dialog-content"]{z-index:90}[data-ui-component="dialog"][data-ui-part="dialog-footer"],[data-ui-component="dialog"][data-ui-part="dialog-header"]{display:flex}[data-ui-component="dialog"][data-ui-part="dialog-content"]{display:grid}[data-ui-component="dialog"][data-ui-part="dialog-content"]{width:100%}[data-ui-component="dialog"][data-ui-part="dialog-content"]{max-width:calc(100% - 2rem)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-translate-x:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-translate-y:calc(calc(1 / 2 * 100%) * -1);translate:var(--tw-translate-x) var(--tw-translate-y)}[data-ui-component="dialog"][data-ui-part="dialog-header"]{flex-direction:column}[data-ui-component="dialog"][data-ui-part="dialog-footer"]{flex-direction:column-reverse}[data-ui-component="dialog"][data-ui-part="dialog-footer"],[data-ui-component="dialog"][data-ui-part="dialog-header"]{gap:calc(var(--spacing) * 2)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{gap:calc(var(--spacing) * 6)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{border-radius:calc(var(--radius) * 1.4)}[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{background-color:#0000001a}@supports (color:color-mix(in lab, red, red)){[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{background-color:color-mix(in oklab, var(--color-black) 10%, transparent)}}[data-ui-component="dialog"][data-ui-part="dialog-content"]{background-color:var(--popover)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{padding:calc(var(--spacing) * 6)}[data-ui-component="dialog"][data-ui-part="dialog-content"],[data-ui-component="dialog"][data-ui-part="dialog-description"]{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}[data-ui-component="dialog"][data-ui-part="dialog-title"]{--tw-leading:1;line-height:1}[data-ui-component="dialog"][data-ui-part="dialog-title"]{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}[data-ui-component="dialog"][data-ui-part="dialog-description"]{color:var(--muted-foreground)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{color:var(--popover-foreground)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-ring-color:var(--foreground)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-ring-color:color-mix(in oklab, var(--foreground) 10%, transparent)}}[data-ui-component="dialog"][data-ui-part="dialog-content"],[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{--tw-duration:.1s;transition-duration:.1s}[data-ui-component="dialog"][data-ui-part="dialog-content"]{--tw-outline-style:none;outline-style:none}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=closed],[data-ui-component="dialog"][data-ui-part="dialog-overlay"][data-state=closed]{animation:exit var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=closed],[data-ui-component="dialog"][data-ui-part="dialog-overlay"][data-state=closed]{--tw-exit-opacity:0}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=closed]{--tw-exit-scale:.95}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=open],[data-ui-component="dialog"][data-ui-part="dialog-overlay"][data-state=open]{animation:enter var(--tw-animation-duration,var(--tw-duration,.15s))var(--tw-ease,ease)var(--tw-animation-delay,0s)var(--tw-animation-iteration-count,1)var(--tw-animation-direction,normal)var(--tw-animation-fill-mode,none)}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=open],[data-ui-component="dialog"][data-ui-part="dialog-overlay"][data-state=open]{--tw-enter-opacity:0}[data-ui-component="dialog"][data-ui-part="dialog-content"][data-state=open]{--tw-enter-scale:.95}@supports ((-webkit-backdrop-filter:var(--tw)) or (backdrop-filter:var(--tw))){[data-ui-component="dialog"][data-ui-part="dialog-overlay"]{--tw-backdrop-blur:blur(var(--blur-xs));-webkit-backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,)}}@media (min-width:40rem){[data-ui-component="dialog"][data-ui-part="dialog-content"]{max-width:var(--container-md)}[data-ui-component="dialog"][data-ui-part="dialog-footer"]{flex-direction:row}[data-ui-component="dialog"][data-ui-part="dialog-footer"]{justify-content:flex-end}}:is([data-ui-component="dialog"][data-ui-part="dialog-description"]>*):is(a){text-decoration-line:underline}:is([data-ui-component="dialog"][data-ui-part="dialog-description"]>*):is(a){text-underline-offset:3px}@media (hover:hover){:is([data-ui-component="dialog"][data-ui-part="dialog-description"]>*):is(a):hover{color:var(--foreground)}}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-z{syntax:"*";inherits:false;initial-value:0}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-duration{syntax:"*";inherits:false}@property --tw-backdrop-blur{syntax:"*";inherits:false}@property --tw-backdrop-brightness{syntax:"*";inherits:false}@property --tw-backdrop-contrast{syntax:"*";inherits:false}@property --tw-backdrop-grayscale{syntax:"*";inherits:false}@property --tw-backdrop-hue-rotate{syntax:"*";inherits:false}@property --tw-backdrop-invert{syntax:"*";inherits:false}@property --tw-backdrop-opacity{syntax:"*";inherits:false}@property --tw-backdrop-saturate{syntax:"*";inherits:false}@property --tw-backdrop-sepia{syntax:"*";inherits:false}
  }
</style>
