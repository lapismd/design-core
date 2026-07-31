<script lang="ts" module>
  export type CodeColor = "primary" | "secondary" | "inherit";
  export type CodeSize = "inherit";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";
  import { type WithElementRef } from "../../../lib/utils.js";
  import { omitDataUiComponent } from "../../../lib/data-ui-host.js";
  import "./code.css";

  let {
    ref = $bindable(null),
    color = "primary",
    size,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>, HTMLElement> & {
    /** Text color. Mirrors primary/secondary/inherit. @default 'primary' */
    color?: CodeColor;
    /** Set to `'inherit'` to match surrounding font-size and line-height. */
    size?: CodeSize;
    children?: Snippet;
  } = $props();
</script>

<code
  bind:this={ref}
  {...omitDataUiComponent(restProps)}
  data-ui-component="code"
  data-slot="code"
  data-color={color}
  data-size={size}
  class={className}
>
  {@render children?.()}
</code>
