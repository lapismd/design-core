<script lang="ts" module>
  
    export const TOGGLE_VARIANTS = [
    "default",
    "outline",
  ] as const;
  export type ToggleVariant = (typeof TOGGLE_VARIANTS)[number];

  export const TOGGLE_SIZES = [
    "default",
    "sm",
    "lg",
  ] as const;
  export type ToggleSize = (typeof TOGGLE_SIZES)[number];

  export type ToggleVariants = {
    variant?: ToggleVariant;
    size?: ToggleSize;
  };

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function toggleVariants(_opts?: {
    variant?: ToggleVariant;
    size?: ToggleSize;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
  import { Toggle as TogglePrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    pressed = $bindable(false),
    class: className,
    size = "default",
    variant = "default",
    ...restProps
  }: TogglePrimitive.RootProps & {
    variant?: ToggleVariant;
    size?: ToggleSize;
  } = $props();
</script>

<TogglePrimitive.Root
  bind:ref
  bind:pressed
  data-ui-component="toggle"
  data-ui-part="toggle"
  data-variant={variant}
  data-size={size}
  data-slot="toggle"
  class={className}
  {...restProps}
/>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="toggle"][data-ui-part="toggle"]{display:inline-flex}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="sm"]{height:calc(var(--spacing) * 8)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="default"]{height:calc(var(--spacing) * 9)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="lg"]{height:calc(var(--spacing) * 10)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="sm"]{min-width:calc(var(--spacing) * 8)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="default"]{min-width:calc(var(--spacing) * 9)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="lg"]{min-width:calc(var(--spacing) * 10)}[data-ui-component="toggle"][data-ui-part="toggle"]{align-items:center}[data-ui-component="toggle"][data-ui-part="toggle"]{justify-content:center}[data-ui-component="toggle"][data-ui-part="toggle"]{gap:var(--spacing)}[data-ui-component="toggle"][data-ui-part="toggle"]{border-radius:calc(var(--radius) * .8)}[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="outline"]{border-style:var(--tw-border-style);border-width:1px}[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="outline"]{border-color:var(--input)}[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="default"],[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="outline"]{background-color:#0000}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="default"],[data-ui-component="toggle"][data-ui-part="toggle"][data-size="sm"],[data-ui-component="toggle"][data-ui-part="toggle"][data-size="lg"]{padding-inline:calc(var(--spacing) * 2.5)}[data-ui-component="toggle"][data-ui-part="toggle"]{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}[data-ui-component="toggle"][data-ui-part="toggle"]{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}[data-ui-component="toggle"][data-ui-part="toggle"]{white-space:nowrap}[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="outline"]{--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="toggle"][data-ui-part="toggle"]{transition-property:color,box-shadow;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}[data-ui-component="toggle"][data-ui-part="toggle"]{--tw-outline-style:none;outline-style:none}@media (hover:hover){[data-ui-component="toggle"][data-ui-part="toggle"]:hover,[data-ui-component="toggle"][data-ui-part="toggle"][data-variant="outline"]:hover{background-color:var(--muted)}[data-ui-component="toggle"][data-ui-part="toggle"]:hover{color:var(--foreground)}}[data-ui-component="toggle"][data-ui-part="toggle"]:focus-visible{border-color:var(--ring)}[data-ui-component="toggle"][data-ui-part="toggle"]:focus-visible{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="toggle"][data-ui-part="toggle"]:focus-visible{--tw-ring-color:var(--ring)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="toggle"][data-ui-part="toggle"]:focus-visible{--tw-ring-color:color-mix(in oklab, var(--ring) 50%, transparent)}}[data-ui-component="toggle"][data-ui-part="toggle"]:disabled{pointer-events:none}[data-ui-component="toggle"][data-ui-part="toggle"]:disabled{opacity:.5}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="sm"]:has([data-icon=inline-end]){padding-right:calc(var(--spacing) * 1.5)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="default"]:has([data-icon=inline-end]),[data-ui-component="toggle"][data-ui-part="toggle"][data-size="lg"]:has([data-icon=inline-end]){padding-right:calc(var(--spacing) * 2)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="sm"]:has([data-icon=inline-start]){padding-left:calc(var(--spacing) * 1.5)}[data-ui-component="toggle"][data-ui-part="toggle"][data-size="default"]:has([data-icon=inline-start]),[data-ui-component="toggle"][data-ui-part="toggle"][data-size="lg"]:has([data-icon=inline-start]){padding-left:calc(var(--spacing) * 2)}[data-ui-component="toggle"][data-ui-part="toggle"][aria-invalid=true]{border-color:var(--destructive)}[data-ui-component="toggle"][data-ui-part="toggle"][aria-invalid=true]{--tw-ring-color:var(--destructive)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="toggle"][data-ui-part="toggle"][aria-invalid=true]{--tw-ring-color:color-mix(in oklab, var(--destructive) 20%, transparent)}}[data-ui-component="toggle"][data-ui-part="toggle"][aria-pressed=true]{background-color:var(--muted)}[data-ui-component="toggle"][data-ui-part="toggle"]:is(:global(.dark) *)[aria-invalid=true]{--tw-ring-color:var(--destructive)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="toggle"][data-ui-part="toggle"]:is(:global(.dark) *)[aria-invalid=true]{--tw-ring-color:color-mix(in oklab, var(--destructive) 40%, transparent)}}[data-ui-component="toggle"][data-ui-part="toggle"] svg{pointer-events:none}[data-ui-component="toggle"][data-ui-part="toggle"] svg{flex-shrink:0}[data-ui-component="toggle"][data-ui-part="toggle"] svg:not([class*=size-]){width:calc(var(--spacing) * 4);height:calc(var(--spacing) * 4)}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}
  }
</style>
