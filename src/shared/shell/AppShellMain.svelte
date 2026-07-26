<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

  useAppShell();
</script>

<div
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__main", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="main"
>
  {@render children?.()}
</div>
