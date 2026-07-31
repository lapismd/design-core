<script lang="ts">
  import { onDestroy, untrack } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import { Button } from "../../shadcn/button/index.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import type {
    AppShellSide,
    AppShellSidebarController,
  } from "./app-shell-controller.svelte.js";

  let {
    ref = $bindable(null),
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

  const controller = useAppShell();
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
  let desktopDomPreview = $state(false);
  let desktopOverlayKnown = $state(false);
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
    getDesktopOverlayTarget(ref)?.removeAttribute(
      "data-desktop-overlay-preview",
    );
  });

  $effect(() => {
    const button = ref;
    const panelId = mobilePanelId;
    const shellRoot = button?.closest<HTMLElement>("[data-shell-root]");
    if (!shellRoot || !panelId) {
      desktopOverlayKnown = false;
      return;
    }

    const update = () => {
      desktopOverlayKnown =
        shellRoot
          .getAttribute("data-desktop-overlay-panels")
          ?.split(/\s+/)
          .includes(panelId) ?? false;
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(shellRoot, {
      attributes: true,
      attributeFilter: ["data-desktop-overlay-panels"],
    });
    return () => observer.disconnect();
  });

  function isDesktopOverlayOnly(element?: Element | null): boolean {
    if (!mobilePanelId) return false;
    return (
      (element ?? ref)
        ?.closest("[data-shell-root]")
        ?.getAttribute("data-desktop-overlay-panels")
        ?.split(/\s+/)
        .includes(mobilePanelId) ?? false
    );
  }

  function getDesktopOverlayTarget(
    element?: Element | null,
  ): HTMLElement | null {
    if (!mobilePanelId) return null;
    const shellRoot = (element ?? ref)?.closest("[data-shell-root]");
    if (
      !shellRoot
        ?.getAttribute("data-desktop-overlay-panels")
        ?.split(/\s+/)
        .includes(mobilePanelId)
    ) {
      return null;
    }
    return shellRoot.querySelector<HTMLElement>(
      `[data-ui-part="sidebar"][data-mobile-panel-id="${CSS.escape(mobilePanelId)}"]`,
    );
  }

  function toggleDesktopDomPreview(element: Element): boolean {
    const target = getDesktopOverlayTarget(element);
    if (!target) return false;
    desktopDomPreview = !target.hasAttribute("data-desktop-overlay-preview");
    target.toggleAttribute("data-desktop-overlay-preview", desktopDomPreview);
    if (desktopDomPreview) {
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
