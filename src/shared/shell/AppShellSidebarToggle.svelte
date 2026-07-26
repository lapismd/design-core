<script lang="ts">
  import { onDestroy } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../shadcn/button/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type {
    AppShellSide,
    AppShellSidebarController,
  } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    side,
    sidebarController,
    label,
    previewOnHover = false,
    previewDelay = 600,
    previewDismissDelay = 120,
    class: className,
    onclick,
    onmouseenter,
    onmouseleave,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Sidebar controlled by this toolbar action. */
    side: AppShellSide;
    /** Optional independent sidebar controller for repeated same-side layouts. */
    sidebarController?: AppShellSidebarController;
    /** Accessible action name. Defaults from the current sidebar state. */
    label?: string;
    /** Preview a collapsed or closed sidebar as an overlay after pointer hover. */
    previewOnHover?: boolean;
    /** Delay before the optional sidebar preview opens, in milliseconds. */
    previewDelay?: number;
    /** Grace period before the optional collapsed preview closes. */
    previewDismissDelay?: number;
  } = $props();

  const controller = useAppShell();
  let sidebar = $derived(sidebarController ?? controller.getSidebar(side));
  let accessibleLabel = $derived(
    label ??
      (sidebar.closed
        ? `Open ${side} sidebar`
        : sidebar.collapsed
          ? `Expand ${side} sidebar`
          : `Collapse ${side} sidebar`),
  );

  onDestroy(() => sidebar.dismissPreview());
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
  aria-expanded={sidebar.previewed || (!sidebar.closed && !sidebar.collapsed)}
  title={accessibleLabel}
  onmouseenter={(event) => {
    if (previewOnHover) sidebar.schedulePreview(previewDelay);
    onmouseenter?.(event);
  }}
  onmouseleave={(event) => {
    if (previewOnHover) sidebar.schedulePreviewDismiss(previewDismissDelay);
    onmouseleave?.(event);
  }}
  onclick={(event) => {
    sidebar.dismissPreview();
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
    <g transform={side === "right" ? "translate(24 0) scale(-1 1)" : undefined}>
      <rect
        x="4"
        y="5"
        width="2"
        height="14"
        rx="2"
        fill="currentColor"
        data-ui-part="sidebar-toggle-indicator"
      ></rect>
    </g>
  </svg>
</Button>
