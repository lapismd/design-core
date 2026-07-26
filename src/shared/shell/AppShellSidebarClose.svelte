<script lang="ts">
  import XIcon from "@lucide/svelte/icons/x";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../shadcn/button/index.js";
  import { useAppShellSidebar } from "./app-shell-sidebar-context.svelte.js";

  let {
    ref = $bindable(null),
    label,
    class: className,
    onclick,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Accessible close action name. Defaults from the containing sidebar. */
    label?: string;
  } = $props();

  const context = useAppShellSidebar();
  let sidebar = $derived(context.controller);
  let accessibleLabel = $derived(label ?? `Close ${context.side} sidebar`);
</script>

{#if context.closeable}
  <Button
    bind:ref
    {...restProps}
    variant="ghost"
    size="icon-sm"
    class={["ui-minimal-app-shell__sidebar-close", className]
      .filter(Boolean)
      .join(" ")}
    data-ui-part="sidebar-close"
    data-side={context.side}
    aria-label={accessibleLabel}
    title={accessibleLabel}
    onclick={(event) => {
      sidebar.close();
      context.dismissOverlay();
      onclick?.(event);
    }}
  >
    <XIcon aria-hidden="true" />
  </Button>
{/if}
