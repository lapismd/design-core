<script lang="ts">
	import type { HTMLTableAttributes } from "svelte/elements";
	import { type WithElementRef } from "../../../lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLTableAttributes> = $props();
</script>

<div  data-ui-component="table"
 data-ui-part="table-container"
 data-slot="table-container" >
	<table bind:this={ref}  {...restProps}
  data-ui-component="table"
 data-ui-part="table"
 data-slot="table" class={className}>
		{@render children?.()}
	</table>
</div>

<style>
  /* Semantic selectors must be global: they target data attributes and descendants. */
  :global {
    /*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */
    @layer properties{}@layer base{@supports (not ((-webkit-appearance:-apple-pay-button))) or (contain-intrinsic-size:1px){}}[data-ui-component="table"][data-ui-part="table-container"]{position:relative}[data-ui-component="table"][data-ui-part="table-caption"]{margin-top:calc(var(--spacing) * 4)}[data-ui-component="table"][data-ui-part="table-head"]{height:calc(var(--spacing) * 10)}[data-ui-component="table"][data-ui-part="table-container"],[data-ui-component="table"][data-ui-part="table"]{width:100%}[data-ui-component="table"][data-ui-part="table"]{caption-side:bottom}[data-ui-component="table"][data-ui-part="table-container"]{overflow-x:auto}[data-ui-component="table"][data-ui-part="table-footer"]{border-top-style:var(--tw-border-style);border-top-width:1px}[data-ui-component="table"][data-ui-part="table-row"]{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}[data-ui-component="table"][data-ui-part="table-footer"]{background-color:var(--muted)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="table"][data-ui-part="table-footer"]{background-color:color-mix(in oklab, var(--muted) 50%, transparent)}}[data-ui-component="table"][data-ui-part="table-cell"]{padding:calc(var(--spacing) * 2)}[data-ui-component="table"][data-ui-part="table-head"]{padding-inline:calc(var(--spacing) * 2)}[data-ui-component="table"][data-ui-part="table-head"]{text-align:left}[data-ui-component="table"][data-ui-part="table-cell"],[data-ui-component="table"][data-ui-part="table-head"]{vertical-align:middle}[data-ui-component="table"][data-ui-part="table-caption"],[data-ui-component="table"][data-ui-part="table"]{font-size:var(--text-sm);line-height:var(--tw-leading,var(--text-sm--line-height))}[data-ui-component="table"][data-ui-part="table-footer"],[data-ui-component="table"][data-ui-part="table-head"]{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}[data-ui-component="table"][data-ui-part="table-cell"],[data-ui-component="table"][data-ui-part="table-head"]{white-space:nowrap}[data-ui-component="table"][data-ui-part="table-head"]{color:var(--foreground)}[data-ui-component="table"][data-ui-part="table-caption"]{color:var(--muted-foreground)}[data-ui-component="table"][data-ui-part="table-row"]{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}@media (hover:hover){[data-ui-component="table"][data-ui-part="table-row"]:hover{background-color:var(--muted)}@supports (color:color-mix(in lab, red, red)){[data-ui-component="table"][data-ui-part="table-row"]:hover{background-color:color-mix(in oklab, var(--muted) 50%, transparent)}}}[data-ui-component="table"][data-ui-part="table-row"][data-state=selected]{background-color:var(--muted)}[data-ui-component="table"][data-ui-part="table-header"] tr{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}[data-ui-component="table"][data-ui-part="table-body"] tr:last-child{border-style:var(--tw-border-style);border-width:0}[data-ui-component="table"][data-ui-part="table-cell"]:has([role=checkbox]),[data-ui-component="table"][data-ui-part="table-head"]:has([role=checkbox]){padding-right:0}[data-ui-component="table"][data-ui-part="table-footer"]>tr:last-child{border-bottom-style:var(--tw-border-style);border-bottom-width:0}@property --tw-animation-delay{syntax:"*";inherits:false;initial-value:0s}@property --tw-animation-direction{syntax:"*";inherits:false;initial-value:normal}@property --tw-animation-duration{syntax:"*";inherits:false}@property --tw-animation-fill-mode{syntax:"*";inherits:false;initial-value:none}@property --tw-animation-iteration-count{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-enter-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-enter-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-blur{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-opacity{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-rotate{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-scale{syntax:"*";inherits:false;initial-value:1}@property --tw-exit-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-exit-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-font-weight{syntax:"*";inherits:false}
  }
</style>
