<script lang="ts">
  import { onDestroy } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import {
    APP_SHELL_DEFAULT_SIDEBAR_WIDTH,
    type AppShellSide,
    type AppShellSidebarController,
  } from "./app-shell-controller.svelte.js";
  import { setAppShellSidebarContext } from "./app-shell-sidebar-context.svelte.js";

  let {
    ref = $bindable(null),
    side,
    sidebarController,
    label,
    resizable = true,
    closeable = false,
    variant = "default",
    revealOnEdgeHover = false,
    edgeRevealLabel,
    resizeLabel,
    style,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** The independently controlled side rendered by this bounded panel. */
    side: AppShellSide;
    /** Optional independent controller for repeated same-side sidebar layouts. */
    sidebarController?: AppShellSidebarController;
    /** Accessible landmark name. Defaults to "Left sidebar" or "Right sidebar". */
    label?: string;
    /** Whether to render the built-in pointer and keyboard resize handle. */
    resizable?: boolean;
    /** Whether nested `AppShell.Sidebar.Close` actions may close this sidebar. */
    closeable?: boolean;
    /** Full-height outer chrome or the default transparent shell sidebar. */
    variant?: "default" | "outer";
    /** Preview a collapsed or closed sidebar from the corresponding page edge. */
    revealOnEdgeHover?: boolean;
    /** Accessible name for the collapsed/closed edge-preview control. */
    edgeRevealLabel?: string;
    /** Accessible resize-handle name. Defaults from `side`. */
    resizeLabel?: string;
  } = $props();

  const controller = useAppShell();
  let sidebar = $derived(sidebarController ?? controller.getSidebar(side));
  setAppShellSidebarContext({
    get side() {
      return side;
    },
    get closeable() {
      return closeable;
    },
    get controller() {
      return sidebar;
    },
    dismissOverlay,
  });
  let renderedWidth = $state(APP_SHELL_DEFAULT_SIDEBAR_WIDTH);
  let resizing = $state(false);
  let resizeStartX = 0;
  let resizeStartWidth = APP_SHELL_DEFAULT_SIDEBAR_WIDTH;
  let previousBodyCursor = "";
  let previousBodyUserSelect = "";
  let accessibleLabel = $derived(
    label ?? (side === "left" ? "Left sidebar" : "Right sidebar"),
  );
  let accessibleResizeLabel = $derived(
    resizeLabel ??
      (side === "left" ? "Resize left sidebar" : "Resize right sidebar"),
  );
  let accessibleEdgeRevealLabel = $derived(
    edgeRevealLabel ??
      (side === "left" ? "Preview left sidebar" : "Preview right sidebar"),
  );
  let presentation = $derived(sidebar.previewed ? "overlay" : "inline");
  let renderSidebar = $derived(!sidebar.closed || sidebar.previewed);
  let preserveCollapsedRail = $derived(
    !sidebar.closed && sidebar.collapsed && sidebar.previewed,
  );
  let sidebarStyle = $derived(
    [
      style,
      sidebar.width === undefined
        ? undefined
        : `--ui-shell-sidebar-size: ${sidebar.width}px`,
    ]
      .filter(Boolean)
      .join("; "),
  );

  $effect(() => {
    if (!ref) return;

    const updateRenderedWidth = () => {
      if (ref) renderedWidth = Math.round(ref.getBoundingClientRect().width);
    };
    updateRenderedWidth();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateRenderedWidth);
    observer.observe(ref);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (
      !renderSidebar ||
      (sidebar.collapsed && presentation !== "overlay") ||
      !resizable
    ) {
      stopResize();
    }
  });

  $effect(() => {
    if (typeof document === "undefined" || !sidebar.previewed) return;

    const handleDocumentPointerOver = (event: PointerEvent) => {
      if (isSidebarInteractionTarget(event.target)) {
        keepOverlay();
        return;
      }
      scheduleOverlayDismiss();
    };
    const handleDocumentFocusIn = (event: FocusEvent) => {
      if (isSidebarInteractionTarget(event.target)) {
        keepOverlay();
        return;
      }
      scheduleOverlayDismiss();
    };

    document.addEventListener("pointerover", handleDocumentPointerOver, true);
    document.addEventListener("focusin", handleDocumentFocusIn, true);
    return () => {
      document.removeEventListener(
        "pointerover",
        handleDocumentPointerOver,
        true,
      );
      document.removeEventListener("focusin", handleDocumentFocusIn, true);
    };
  });

  onDestroy(() => {
    stopResize();
    sidebar.dismissPreview();
  });

  function revealFromEdge(): void {
    if (!revealOnEdgeHover || (!sidebar.collapsed && !sidebar.closed)) return;
    sidebar.preview();
  }

  function dismissOverlay(): void {
    sidebar.dismissPreview();
  }

  function keepOverlay(): void {
    sidebar.keepPreview();
  }

  function scheduleOverlayDismiss(): void {
    if (resizing) return;
    sidebar.schedulePreviewDismiss();
  }

  function isSidebarInteractionTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Node) || !ref) return false;
    if (ref.contains(target)) return true;

    const controlIds = new Set<string>();
    for (const owner of ref.querySelectorAll<HTMLElement>(
      "[aria-controls], [aria-owns]",
    )) {
      for (const attribute of ["aria-controls", "aria-owns"] as const) {
        for (const id of owner.getAttribute(attribute)?.split(/\s+/) ?? []) {
          if (id) controlIds.add(id);
        }
      }
    }

    for (const id of controlIds) {
      const controlledElement = document.getElementById(id);
      if (controlledElement?.contains(target)) return true;
    }

    if (!(target instanceof Element)) return false;
    const hasOpenPopupOwner = ref.querySelector(
      '[aria-haspopup][aria-expanded="true"], [role="combobox"][aria-expanded="true"]',
    );
    if (!hasOpenPopupOwner) return false;

    return Boolean(
      target.closest(
        '[role="dialog"], [role="grid"], [role="listbox"], [role="menu"], [role="tooltip"], [role="tree"]',
      ),
    );
  }

  function handleOverlayBlur(event: FocusEvent): void {
    if (isSidebarInteractionTarget(event.relatedTarget)) {
      keepOverlay();
      return;
    }
    scheduleOverlayDismiss();
  }

  function handleOverlayPointerLeave(event: MouseEvent): void {
    if (isSidebarInteractionTarget(event.relatedTarget)) {
      keepOverlay();
      return;
    }
    scheduleOverlayDismiss();
  }

  function startResize(event: PointerEvent): void {
    if (
      (sidebar.collapsed && presentation !== "overlay") ||
      !resizable ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    resizing = true;
    resizeStartX = event.clientX;
    resizeStartWidth =
      ref?.getBoundingClientRect().width ??
      sidebar.width ??
      APP_SHELL_DEFAULT_SIDEBAR_WIDTH;
    previousBodyCursor = document.body.style.cursor;
    previousBodyUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handleResizeMove);
    window.addEventListener("pointerup", stopResize, { once: true });
    window.addEventListener("pointercancel", stopResize, { once: true });
  }

  function handleResizeMove(event: PointerEvent): void {
    if (!resizing) return;
    event.preventDefault();
    const direction = side === "left" ? 1 : -1;
    sidebar.setWidth(
      resizeStartWidth + direction * (event.clientX - resizeStartX),
    );
  }

  function stopResize(): void {
    if (resizing && typeof document !== "undefined") {
      document.body.style.cursor = previousBodyCursor;
      document.body.style.userSelect = previousBodyUserSelect;
    }
    resizing = false;
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    }
  }

  function handleResizeKeydown(event: KeyboardEvent): void {
    if ((sidebar.collapsed && presentation !== "overlay") || !resizable) {
      return;
    }
    const step = event.shiftKey ? 32 : 16;
    const currentWidth =
      ref?.getBoundingClientRect().width ??
      sidebar.width ??
      APP_SHELL_DEFAULT_SIDEBAR_WIDTH;

    if (event.key === "Home") {
      event.preventDefault();
      sidebar.setWidth(sidebar.minWidth);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      sidebar.setWidth(sidebar.maxWidth);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const physicalDelta = event.key === "ArrowRight" ? step : -step;
    sidebar.setWidth(
      currentWidth + (side === "left" ? physicalDelta : -physicalDelta),
    );
  }
</script>

{#if (sidebar.closed || sidebar.collapsed) && revealOnEdgeHover}
  <button
    type="button"
    class="ui-minimal-app-shell__sidebar-edge-trigger"
    data-ui-component="app-shell"
    data-ui-part="sidebar-edge-trigger"
    data-side={side}
    aria-label={accessibleEdgeRevealLabel}
    aria-expanded={sidebar.previewed}
    title={accessibleEdgeRevealLabel}
    onmouseenter={revealFromEdge}
    onfocus={revealFromEdge}
    onblur={handleOverlayBlur}
    onclick={() => sidebar.toggle()}
  ></button>
{/if}

{#if preserveCollapsedRail}
  <div
    class="ui-minimal-app-shell__sidebar-placeholder"
    data-ui-component="app-shell"
    data-ui-part="sidebar-placeholder"
    data-side={side}
    aria-hidden="true"
  ></div>
{/if}

{#if renderSidebar}
  <aside
    bind:this={ref}
    {...restProps}
    style={sidebarStyle || undefined}
    class={["ui-minimal-app-shell__sidebar", className]
      .filter(Boolean)
      .join(" ")}
    data-ui-component="app-shell"
    data-ui-part="sidebar"
    data-side={side}
    data-state={sidebar.state}
    data-variant={variant}
    data-presentation={presentation}
    data-collapsed={sidebar.collapsed || undefined}
    data-closeable={closeable || undefined}
    data-previewed={sidebar.previewed || undefined}
    data-resizing={resizing || undefined}
    aria-label={accessibleLabel}
    onmouseenter={keepOverlay}
    onmouseleave={presentation === "overlay"
      ? handleOverlayPointerLeave
      : undefined}
    onfocusin={keepOverlay}
    onfocusout={presentation === "overlay" ? handleOverlayBlur : undefined}
  >
    {@render children?.()}
    {#if resizable && (!sidebar.collapsed || presentation === "overlay")}
      <div
        role="slider"
        tabindex="0"
        class="ui-minimal-app-shell__sidebar-resize-handle"
        data-ui-component="app-shell"
        data-ui-part="sidebar-resize-handle"
        data-side={side}
        aria-label={accessibleResizeLabel}
        aria-orientation="vertical"
        aria-valuemin={sidebar.minWidth}
        aria-valuemax={sidebar.maxWidth}
        aria-valuenow={sidebar.width ?? renderedWidth}
        title={accessibleResizeLabel}
        onpointerdown={startResize}
        onkeydown={handleResizeKeydown}
      >
        <span
          data-ui-component="app-shell"
          data-ui-part="sidebar-resize-indicator"
          aria-hidden="true"
        ></span>
      </div>
    {/if}
  </aside>
{/if}
