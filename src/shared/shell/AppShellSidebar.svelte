<script lang="ts">
  import { onDestroy } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import type { WithElementRef } from "../../lib/utils.js";
  import { useAppShell } from "./app-shell-context.svelte.js";
  import {
    APP_SHELL_DEFAULT_SIDEBAR_WIDTH,
    type AppShellSide,
  } from "./app-shell-controller.svelte.js";
  import { setAppShellSidebarContext } from "./app-shell-sidebar-context.svelte.js";

  let {
    ref = $bindable(null),
    side,
    label,
    resizable = true,
    closeable = false,
    resizeLabel,
    style,
    class: className,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLElement>> & {
    /** The independently controlled side rendered by this bounded panel. */
    side: AppShellSide;
    /** Accessible landmark name. Defaults to "Left sidebar" or "Right sidebar". */
    label?: string;
    /** Whether to render the built-in pointer and keyboard resize handle. */
    resizable?: boolean;
    /** Whether nested `AppShell.Sidebar.Close` actions may close this sidebar. */
    closeable?: boolean;
    /** Accessible resize-handle name. Defaults from `side`. */
    resizeLabel?: string;
  } = $props();

  const controller = useAppShell();
  setAppShellSidebarContext({
    get side() {
      return side;
    },
    get closeable() {
      return closeable;
    },
  });
  let sidebar = $derived(controller.getSidebar(side));
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
    if (sidebar.closed || sidebar.collapsed || !resizable) stopResize();
  });

  onDestroy(stopResize);

  function startResize(event: PointerEvent): void {
    if (sidebar.collapsed || !resizable || event.button !== 0) return;
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
    if (sidebar.collapsed || !resizable) return;
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

{#if !sidebar.closed}
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
    data-collapsed={sidebar.collapsed || undefined}
    data-closeable={closeable || undefined}
    data-resizing={resizing || undefined}
    aria-label={accessibleLabel}
  >
    {@render children?.()}
    {#if resizable && !sidebar.collapsed}
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
