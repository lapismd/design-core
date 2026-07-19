<script lang="ts">
	import { ScrollArea as ScrollAreaPrimitive } from "bits-ui";
	import { Scrollbar } from "./index.js";
	import { type WithoutChild } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		viewportRef = $bindable(null),
		class: className,
		orientation = "vertical",
		scrollbarXClasses = "",
		scrollbarYClasses = "",
		children,
		...restProps
	}: WithoutChild<ScrollAreaPrimitive.RootProps> & {
		orientation?: "vertical" | "horizontal" | "both" | undefined;
		scrollbarXClasses?: string | undefined;
		scrollbarYClasses?: string | undefined;
		viewportRef?: HTMLElement | null;
	} = $props();
</script>

<ScrollAreaPrimitive.Root
	bind:ref
		data-ui-component="scroll-area"
	data-ui-part="scroll-area"
	data-slot="scroll-area"
	class={className}
	{...restProps}
>
	<ScrollAreaPrimitive.Viewport
		bind:ref={viewportRef}
				data-ui-component="scroll-area"
		data-ui-part="scroll-area-viewport"
		data-slot="scroll-area-viewport"
		
	>
		{@render children?.()}
	</ScrollAreaPrimitive.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		<Scrollbar orientation="vertical" class={scrollbarYClasses} />
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		<Scrollbar orientation="horizontal" class={scrollbarXClasses} />
	{/if}
	<ScrollAreaPrimitive.Corner />
</ScrollAreaPrimitive.Root>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}@layer utilities{[data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"],[data-ui-component="scroll-area"][data-ui-part="scroll-area"]{position:relative}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]{display:flex}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]{width:100%;height:100%}[data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]{flex:1}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]{touch-action:none}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]{border-radius:inherit}[data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]{border-radius:3.40282e38px}[data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"]{background-color:var(--border)}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]{padding:1px}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]{transition-property:color,box-shadow;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]{--tw-outline-style:none;outline-style:none}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]{-webkit-user-select:none;user-select:none}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible{--tw-ring-shadow:var(--tw-ring-inset,) 0 0 0 calc(3px + var(--tw-ring-offset-width)) var(--tw-ring-color,currentcolor);box-shadow:var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow)}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible{--tw-ring-color:var(--ring)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible{--tw-ring-color:color-mix(in oklab, var(--ring) 50%, transparent)}}[data-ui-component="scroll-area"][data-ui-part="scroll-area-viewport"]:focus-visible{outline-style:var(--tw-outline-style);outline-width:1px}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=horizontal]){height:calc(var(--spacing) * 2.5)}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=horizontal]){flex-direction:column}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=horizontal]){border-top-style:var(--tw-border-style);border-top-width:1px}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=horizontal]){border-top-color:#0000}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=vertical]){height:100%}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=vertical]){width:calc(var(--spacing) * 2.5)}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=vertical]){border-left-style:var(--tw-border-style);border-left-width:1px}[data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"]:where([data-orientation=vertical]){border-left-color:#0000}}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow-alpha{syntax:"<percentage>";inherits:false;initial-value:100%}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-outline-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}
  }
</style>
