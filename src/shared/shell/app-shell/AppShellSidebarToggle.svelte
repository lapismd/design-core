<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import { useOptionalAppShell } from "./app-shell-context.svelte.js";
  import type {
    AppShellController,
    AppShellSide,
    AppShellSidebarController,
  } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
    shellController,
    side,
    sidebarController,
    sidebarName,
    label,
    previewOnHover = false,
    previewDelay = 600,
    previewDismissDelay = 120,
    class: className,
    onclick,
    onmouseenter,
    onmouseleave,
    onpointerdown,
    ...restProps
  }: HTMLButtonAttributes & {
    ref?: HTMLButtonElement | null;
    /** Explicit root controller for persistent chrome rendered outside Root. */
    shellController?: AppShellController;
    /** Sidebar controlled by this toolbar action. */
    side: AppShellSide;
    /** Optional independent sidebar controller for repeated same-side layouts. */
    sidebarController?: AppShellSidebarController;
    /** Human-readable sidebar subject used by the default action label. */
    sidebarName?: string;
    /** Accessible action name. Defaults from the current sidebar state. */
    label?: string;
    /** Preview a collapsed or closed sidebar as an overlay after pointer hover. */
    previewOnHover?: boolean;
    /** Delay before the optional sidebar preview opens, in milliseconds. */
    previewDelay?: number;
    /** Grace period before the optional collapsed preview closes. */
    previewDismissDelay?: number;
  } = $props();

  const contextualController = useOptionalAppShell();
  const resolvedController = untrack(
    () => shellController ?? contextualController,
  );
  if (!resolvedController) {
    throw new Error(
      "AppShell.Sidebar.Toggle requires AppShell.Root context or shellController.",
    );
  }
  const controller: AppShellController = resolvedController;
  const sidebar = untrack(
    () => sidebarController ?? controller.getSidebar(side),
  );
  let sidebarCollapsed = $state(sidebar.collapsed);
  let sidebarClosed = $state(sidebar.closed);
  let sidebarState = $state(sidebar.state);
  function syncLayout(): void {
    sidebarCollapsed = sidebar.collapsed;
    sidebarClosed = sidebar.closed;
    sidebarState = sidebar.state;
  }
  const unsubscribeLayout = sidebar.onLayoutChange(syncLayout);
  let mobileMode = $derived(controller.mobile.resolvedMode === "mobile");
  let mobilePanelId = $derived(controller.getPanelId(sidebar));
  let desktopDomPreview = $derived(
    controller.isPanelDesktopPreviewed(mobilePanelId),
  );
  let desktopOverlayKnown = $derived(
    controller.isPanelConstrained(mobilePanelId) &&
      controller.getConstrainedPresentation(mobilePanelId) === "preview",
  );
  let suppressHoverPreview = false;
  let desktopOverlayOnly = $derived(!mobileMode && desktopOverlayKnown);
  let mobileExpanded = $derived(
    mobileMode &&
      controller.mobile.stage === side &&
      controller.mobile.activePanelId(side) === mobilePanelId,
  );
  function resolveAccessibleLabel(): string {
    if (label) return label;
    const subject = sidebarName ?? side;
    if (mobileMode) {
      return `${mobileExpanded ? "Close" : "Open"} ${subject} sidebar`;
    }
    if (desktopOverlayOnly) {
      return `${desktopDomPreview ? "Close" : "Open"} ${subject} sidebar`;
    }
    if (sidebarClosed) return `Open ${subject} sidebar`;
    if (sidebarCollapsed) return `Expand ${subject} sidebar`;
    return `Collapse ${subject} sidebar`;
  }

  onDestroy(() => {
    unsubscribeLayout();
    sidebar.dismissPreview();
    if (mobilePanelId)
      controller.setPanelDesktopPreviewed(mobilePanelId, false);
  });

  function isDesktopOverlayOnly(element?: Element | null): boolean {
    void element;
    return desktopOverlayOnly;
  }

  function getDesktopOverlayTarget(
    element?: Element | null,
  ): HTMLElement | null {
    void element;
    return mobilePanelId ? controller.getPanelElement(mobilePanelId) : null;
  }

  function toggleDesktopDomPreview(element: Element): boolean {
    const target = getDesktopOverlayTarget(element);
    if (!target || !mobilePanelId || !desktopOverlayOnly) return false;
    const nextPreviewed = !desktopDomPreview;
    controller.setPanelDesktopPreviewed(mobilePanelId, nextPreviewed);
    if (nextPreviewed) {
      queueMicrotask(() => target.focus({ preventScroll: true }));
    }
    return true;
  }
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
  data-target-panel-id={mobilePanelId}
  data-side={side}
  data-state={mobileMode
    ? mobileExpanded
      ? "expanded"
      : "collapsed"
    : desktopOverlayOnly
      ? desktopDomPreview
        ? "expanded"
        : "closed"
      : sidebarState}
  aria-label={resolveAccessibleLabel()}
  aria-expanded={mobileMode
    ? mobileExpanded
    : desktopOverlayOnly
      ? desktopDomPreview
      : sidebar.previewed || (!sidebar.closed && !sidebar.collapsed)}
  title={resolveAccessibleLabel()}
  onmouseenter={(event) => {
    if (!mobileMode && previewOnHover && !suppressHoverPreview) {
      sidebar.schedulePreview(previewDelay);
    }
    onmouseenter?.(event);
  }}
  onmouseleave={(event) => {
    suppressHoverPreview = false;
    if (!mobileMode && previewOnHover) {
      sidebar.schedulePreviewDismiss(previewDismissDelay);
    }
    onmouseleave?.(event);
  }}
  onpointerdown={(event) => {
    suppressHoverPreview = true;
    sidebar.dismissPreview();
    onpointerdown?.(event);
  }}
  onclick={(event) => {
    if (mobileMode) {
      if (!mobilePanelId) {
        throw new Error(
          "AppShell.Sidebar.Toggle requires a controller-registered sidebar in mobile mode.",
        );
      }
      if (mobileExpanded) controller.mobile.showMain();
      else controller.mobile.show(side, mobilePanelId, ref);
    } else if (toggleDesktopDomPreview(event.currentTarget)) {
      sidebar.dismissPreview();
    } else {
      sidebar.dismissPreview();
      sidebar.toggle();
      syncLayout();
      controller.syncPanelProjections();
    }
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
