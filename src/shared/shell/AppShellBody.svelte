<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { ScrollArea } from "../shadcn/scroll-area/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import {
    setAppShellBodyContext,
    type AppShellBodyLayout,
  } from "./app-shell-body-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    layout = "scroll",
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** Optional accessible name when a page contains multiple main landmarks. */
    label?: string;
    /**
     * `scroll` gives the whole body one Scroll Area. `regions` lets nested
     * `Body.Sidebar` and `Body.Content` parts scroll independently.
     */
    layout?: AppShellBodyLayout;
  } = $props();

  useAppShell();
  setAppShellBodyContext({
    get layout() {
      return layout;
    },
  });
</script>

<main
  bind:this={ref}
  {...restProps}
  class={["ui-minimal-app-shell__body", className].filter(Boolean).join(" ")}
  data-ui-component="app-shell"
  data-ui-part="body"
  data-layout={layout}
  aria-label={label}
>
  {#if layout === "regions"}
    {@render children?.()}
  {:else}
    <ScrollArea class="ui-minimal-app-shell__body-scroll-area">
      {@render children?.()}
    </ScrollArea>
  {/if}
</main>
