<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";

  let {
    ref = $bindable(null),
    label = "Main toolbar",
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** Accessible label for the application toolbar region. */
    label?: string;
  } = $props();

  useAppShell();
</script>

<header
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__toolbar", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="toolbar"
  aria-label={label}
>
  {@render children?.()}
</header>
