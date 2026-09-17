<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> = $props();

  useAppShell();
</script>

<header
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__surface-layer-header", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="surface-layer-header"
>
  {@render children?.()}
</header>
