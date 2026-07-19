<script lang="ts" module>
  import { getContext, setContext } from "svelte";
    import { toggleVariants, type ToggleVariants } from "../toggle/index.js";

  
  interface ToggleGroupContext extends ToggleVariants {
    spacing?: number;
    orientation?: "horizontal" | "vertical";
  }

  export function setToggleGroupCtx(props: ToggleGroupContext) {
    setContext("toggleGroup", props);
  }

  export function getToggleGroupCtx() {
    return getContext<Required<ToggleGroupContext>>("toggleGroup");
  }
</script>

<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
  
  let {
    ref = $bindable(null),
    value = $bindable(),
    class: className,
    size = "default",
    spacing = 0,
    orientation = "horizontal",
    variant = "default",
    ...restProps
  }: ToggleGroupPrimitive.RootProps &
    ToggleVariants & {
      spacing?: number;
      orientation?: "horizontal" | "vertical";
    } = $props();

  setToggleGroupCtx({
    get variant() {
      return variant;
    },
    get size() {
      return size;
    },
    get spacing() {
      return spacing;
    },
    get orientation() {
      return orientation;
    },
  });
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<ToggleGroupPrimitive.Root
  bind:value={value as never}
  bind:ref
  {orientation}
  data-ui-component="toggle-group"
  data-ui-part="toggle-group"
  data-slot="toggle-group"
  data-variant={variant}
  data-size={size}
  data-spacing={spacing}
  style={`--gap: ${spacing}`}
  class={className}
  {...restProps}
/>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{display:flex}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{width:fit-content}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]{flex-shrink:0}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{flex-direction:row}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{align-items:center}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{gap:calc(var(--spacing) * var(--gap))}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]{border-radius:calc(var(--radius) * .8)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group)[data-spacing="0"] *),.group-data-\[spacing\=0\]\/toggle-group\:rounded-none:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"])[data-spacing="0"] *){border-radius:0}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group)[data-spacing="0"] *),.group-data-\[spacing\=0\]\/toggle-group\:px-2:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"])[data-spacing="0"] *){padding-inline:calc(var(--spacing) * 2)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group)[data-spacing="0"] *),.group-data-\[spacing\=0\]\/toggle-group\:shadow-none:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"])[data-spacing="0"] *){--tw-shadow:0 0 #0000;box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:focus,[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:focus-visible{z-index:10}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group)[data-spacing="0"] *):has([data-icon=inline-end]),.group-data-\[spacing\=0\]\/toggle-group\:has-data-\[icon\=inline-end\]\:pr-1\.5:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"])[data-spacing="0"] *):has([data-icon=inline-end]){padding-right:calc(var(--spacing) * 1.5)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group)[data-spacing="0"] *):has([data-icon=inline-start]),.group-data-\[spacing\=0\]\/toggle-group\:has-data-\[icon\=inline-start\]\:pl-1\.5:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"])[data-spacing="0"] *):has([data-icon=inline-start]){padding-left:calc(var(--spacing) * 1.5)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=horizontal]) *)[data-spacing="0"]:first-child,.group-data-horizontal\/toggle-group\:data-\[spacing\=0\]\:first\:rounded-l-md:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=horizontal]) *)[data-spacing="0"]:first-child{border-top-left-radius:calc(var(--radius) * .8);border-bottom-left-radius:calc(var(--radius) * .8)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=vertical]) *)[data-spacing="0"]:first-child,.group-data-vertical\/toggle-group\:data-\[spacing\=0\]\:first\:rounded-t-md:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=vertical]) *)[data-spacing="0"]:first-child{border-top-left-radius:calc(var(--radius) * .8);border-top-right-radius:calc(var(--radius) * .8)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=horizontal]) *)[data-spacing="0"]:last-child,.group-data-horizontal\/toggle-group\:data-\[spacing\=0\]\:last\:rounded-r-md:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=horizontal]) *)[data-spacing="0"]:last-child{border-top-right-radius:calc(var(--radius) * .8);border-bottom-right-radius:calc(var(--radius) * .8)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=vertical]) *)[data-spacing="0"]:last-child,.group-data-vertical\/toggle-group\:data-\[spacing\=0\]\:last\:rounded-b-md:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=vertical]) *)[data-spacing="0"]:last-child{border-bottom-right-radius:calc(var(--radius) * .8);border-bottom-left-radius:calc(var(--radius) * .8)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"][data-state=on]{background-color:var(--muted)}[data-ui-component="toggle-group"][data-ui-part="toggle-group"][data-spacing="0"][data-variant=outline]{--tw-shadow:0 1px 2px 0 var(--tw-shadow-color,#0000000d);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=horizontal]) *)[data-spacing="0"][data-variant=outline],.group-data-horizontal\/toggle-group\:data-\[spacing\=0\]\:data-\[variant\=outline\]\:border-l-0:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=horizontal]) *)[data-spacing="0"][data-variant=outline]{border-left-style:var(--tw-border-style);border-left-width:0}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=vertical]) *)[data-spacing="0"][data-variant=outline],.group-data-vertical\/toggle-group\:data-\[spacing\=0\]\:data-\[variant\=outline\]\:border-t-0:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=vertical]) *)[data-spacing="0"][data-variant=outline]{border-top-style:var(--tw-border-style);border-top-width:0}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=horizontal]) *)[data-spacing="0"][data-variant=outline]:first-child,.group-data-horizontal\/toggle-group\:data-\[spacing\=0\]\:data-\[variant\=outline\]\:first\:border-l:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=horizontal]) *)[data-spacing="0"][data-variant=outline]:first-child{border-left-style:var(--tw-border-style);border-left-width:1px}[data-ui-component="toggle-group"][data-ui-part="toggle-group-item"]:is(:where(.group\/toggle-group):where([data-orientation=vertical]) *)[data-spacing="0"][data-variant=outline]:first-child,.group-data-vertical\/toggle-group\:data-\[spacing\=0\]\:data-\[variant\=outline\]\:first\:border-t:is(:where([data-ui-component="toggle-group"][data-ui-part="toggle-group"]):where([data-orientation=vertical]) *)[data-spacing="0"][data-variant=outline]:first-child{border-top-style:var(--tw-border-style);border-top-width:1px}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]:where([data-orientation=vertical]){flex-direction:column}[data-ui-component="toggle-group"][data-ui-part="toggle-group"]:where([data-orientation=vertical]){align-items:stretch}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}
  }
</style>
