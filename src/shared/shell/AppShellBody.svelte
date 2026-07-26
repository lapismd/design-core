<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { ScrollArea } from "../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** Optional accessible name when a page contains multiple main landmarks. */
    label?: string;
  } = $props();

  useAppShell();
</script>

<main
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__body", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="body"
  aria-label={label}
>
  <ScrollArea class="ui-minimal-app-shell__body-scroll-area">
    {@render children?.()}
  </ScrollArea>
</main>
