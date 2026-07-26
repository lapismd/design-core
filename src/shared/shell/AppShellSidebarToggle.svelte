<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../shadcn/button/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type { AppShellSide } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    side,
    label,
    class: className,
    onclick,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Sidebar controlled by this toolbar action. */
    side: AppShellSide;
    /** Accessible action name. Defaults from the current sidebar state. */
    label?: string;
  } = $props();

  const controller = useAppShell();
  let sidebar = $derived(controller.getSidebar(side));
  let accessibleLabel = $derived(
    label ??
      (sidebar.closed
        ? `Open ${side} sidebar`
        : sidebar.collapsed
          ? `Expand ${side} sidebar`
          : `Collapse ${side} sidebar`),
  );
</script>

<Button
  bind:ref
  {...restProps}
  variant="ghost"
  size="icon-sm"
  class={["ui-minimal-app-shell__sidebar-toggle", className]
    .filter(Boolean)
    .join(" ")}
  data-ui-part="sidebar-toggle"
  data-side={side}
  data-state={sidebar.state}
  aria-label={accessibleLabel}
  aria-expanded={!sidebar.closed && !sidebar.collapsed}
  title={accessibleLabel}
  onclick={(event) => {
    sidebar.toggle();
    onclick?.(event);
  }}
>
  <svg
    data-ui-part="sidebar-toggle-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect x="1" y="2" width="22" height="20" rx="4"></rect>
    <rect
      x={side === "left" ? "4" : "18"}
      y="5"
      width="2"
      height="14"
      rx="2"
      fill="currentColor"
      data-ui-part="sidebar-toggle-indicator"
    ></rect>
  </svg>
</Button>
