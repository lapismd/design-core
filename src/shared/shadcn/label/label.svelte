<script lang="ts">
  import { Label as LabelPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: LabelPrimitive.RootProps = $props();
</script>

<LabelPrimitive.Root
  bind:ref
  data-ui-component="label"
  data-slot="label"
  class={className}
  {...restProps}
/>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="label"]{display:flex}[data-ui-component="label"]{align-items:center}[data-ui-component="label"]{gap:calc(var(--spacing) * 2)}[data-ui-component="label"]{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}[data-ui-component="label"]{--tw-leading:1;line-height:1}[data-ui-component="label"]{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}[data-ui-component="label"]{-webkit-user-select:none;user-select:none}[data-ui-component="label"]:is(:where(.group)[data-disabled=true] *){pointer-events:none}[data-ui-component="label"]:is(:where(.group)[data-disabled=true] *){opacity:.5}[data-ui-component="label"]:is(:where(.peer):disabled~*){cursor:not-allowed}[data-ui-component="label"]:is(:where(.peer):disabled~*){opacity:.5}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}
  }
</style>
