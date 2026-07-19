<script lang="ts" module>
	
	  export const INPUT_GROUP_BUTTON_SIZES = [
    "xs",
    "sm",
    "icon-xs",
    "icon-sm",
  ] as const;
  export type InputGroupButtonSize = (typeof INPUT_GROUP_BUTTON_SIZES)[number];

  /** @deprecated Prefer typed props; retained for API compatibility. */
  export function inputGroupButtonVariants(_opts?: {
    size?: InputGroupButtonSize;
    class?: string;
  }): string {
    return "";
  }
</script>

<script lang="ts">
		import type { ComponentProps } from "svelte";
	import { Button } from "../button/index.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		type = "button",
		variant = "ghost",
		size = "xs",
		...restProps
	}: Omit<ComponentProps<typeof Button>, "href" | "size"> & {
		size?: InputGroupButtonSize;
	} = $props();
</script>

<Button
	bind:ref
	{type}
	data-size={size}
	{variant}
	data-ui-part="input-group-button"
	class={className}
	{...restProps}
>
	{@render children?.()}
</Button>
