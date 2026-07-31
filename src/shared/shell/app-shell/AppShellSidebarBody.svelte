<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../../lib/utils.js";
  import { ScrollArea } from "../../shadcn/scroll-area/index.js";
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
  class={["ui-minimal-app-shell__sidebar-body", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-component="app-shell"
  data-ui-part="sidebar-body"
>
  <ScrollArea type="auto" class="ui-minimal-app-shell__sidebar-scroll-area">
    {@render children?.()}
  </ScrollArea>
</div>
