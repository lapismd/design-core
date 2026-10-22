<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";

  let {
    ref = $bindable(null),
    scrollable = true,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    /** Disable the shell viewport when a bounded editor or chat owns scrolling. */
    scrollable?: boolean;
  } = $props();

  useAppShell();
</script>

<div
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__surface-layer-body", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="surface-layer-body"
>
  {#if scrollable}<ScrollArea
      type="auto"
      class="ui-minimal-app-shell__surface-layer-scroll-area"
    >
      {@render children?.()}
    </ScrollArea>{:else}{@render children?.()}{/if}
</div>
