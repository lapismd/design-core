<script lang="ts">
  import { cn, type WithElementRef } from "../../../lib/utils.js";
  import { omitDataUiIdentity } from "../../../lib/data-ui-host.js";
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    ref = $bindable(null),
    class: className,
    showOnHover = false,
    children,
    child,
    ...restProps
  }: WithElementRef<HTMLButtonAttributes> & {
    child?: Snippet<[{ props: Record<string, unknown> }]>;
    showOnHover?: boolean;
  } = $props();

  const mergedProps = $derived({
    ...omitDataUiIdentity(restProps),
    class: cn(
      showOnHover &&
        "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-open:opacity-100 md:opacity-0",
      className,
    ),
    "data-ui-component": "sidebar",
    "data-ui-part": "sidebar-menu-action",
    "data-slot": "sidebar-menu-action",
    "data-sidebar": "menu-action",
  });
</script>

{#if child}
  {@render child({ props: mergedProps })}
{:else}
  <button
    bind:this={ref}
    {...mergedProps}
    data-ui-component="sidebar"
    data-ui-part="sidebar-menu-action"
  >
    {@render children?.()}
  </button>
{/if}
