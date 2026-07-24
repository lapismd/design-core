<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";

  let {
    width = $bindable(256),
    minWidth = 220,
    maxWidth = 520,
    ariaLabel = "Resize sidebar",
    children,
    onWidthChange = () => {},
  }: {
    /** Controlled width so applications can persist it in their own storage. */
    width?: number;
    minWidth?: number;
    maxWidth?: number;
    ariaLabel?: string;
    children?: Snippet;
    onWidthChange?: (width: number) => void;
  } = $props();

  let resizing = $state(false);
  let hovering = $state(false);
  let startX = 0;
  let startWidth = 0;

  function clamp(next: number) {
    return Math.min(maxWidth, Math.max(minWidth, Math.round(next)));
  }

  function setWidth(next: number) {
    width = clamp(next);
    onWidthChange(width);
  }

  function stopResize() {
    if (!resizing) return;
    resizing = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    window.removeEventListener("pointermove", moveResize);
    window.removeEventListener("pointerup", stopResize);
  }

  function moveResize(event: PointerEvent) {
    if (!resizing) return;
    event.preventDefault();
    setWidth(startWidth + event.clientX - startX);
  }

  function startResize(event: PointerEvent) {
    event.preventDefault();
    resizing = true;
    startX = event.clientX;
    startWidth = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", moveResize);
    window.addEventListener("pointerup", stopResize, { once: true });
  }

  function handleKeydown(event: KeyboardEvent) {
    const step = event.shiftKey ? 32 : 16;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWidth(width - step);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setWidth(width + step);
    } else if (event.key === "Home") {
      event.preventDefault();
      setWidth(minWidth);
    } else if (event.key === "End") {
      event.preventDefault();
      setWidth(maxWidth);
    }
  }

  onDestroy(stopResize);
</script>

<aside
  class="bc-resizable-sidebar"
  style={`width: ${width}px`}
  data-resizable-sidebar
>
  {@render children?.()}
  <div
    role="slider"
    tabindex="0"
    class="bc-resizable-sidebar__handle"
    aria-label={ariaLabel}
    aria-orientation="horizontal"
    aria-valuemin={minWidth}
    aria-valuemax={maxWidth}
    aria-valuenow={width}
    onpointerdown={startResize}
    onkeydown={handleKeydown}
    onpointerenter={() => (hovering = true)}
    onpointerleave={() => (hovering = false)}
    onfocus={() => (hovering = true)}
    onblur={() => (hovering = false)}
  >
    <span
      class={resizing || hovering
        ? "bc-resizable-sidebar__indicator bc-resizable-sidebar__indicator--active"
        : "bc-resizable-sidebar__indicator"}
      aria-hidden="true"
    ></span>
  </div>
</aside>

<style>
  .bc-resizable-sidebar {
    position: relative;
    display: flex;
    min-height: 0;
    height: 100%;
    flex: none;
    flex-direction: column;
    border-inline-end: 1px solid var(--ui-beancount-border);
    background: var(--ui-beancount-sidebar);
    color: var(--ui-beancount-sidebar-foreground);
  }

  .bc-resizable-sidebar__handle {
    position: absolute;
    inset-block: var(--ui-beancount-space-4);
    inset-inline-end: calc(var(--ui-beancount-space-2) * -0.75);
    z-index: 20;
    display: none;
    width: var(--ui-beancount-space-3);
    align-items: stretch;
    justify-content: center;
    border-radius: 999px;
    outline: none;
    cursor: col-resize;
  }

  .bc-resizable-sidebar__handle:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  .bc-resizable-sidebar__indicator {
    width: 1px;
    margin-block: calc(var(--ui-beancount-space-2) * 1.25);
    background: transparent;
    transition: background-color 150ms ease;
  }

  .bc-resizable-sidebar__indicator--active {
    background: var(--ui-beancount-accent);
    opacity: 0.6;
  }

  @media (min-width: 48rem) {
    .bc-resizable-sidebar__handle {
      display: flex;
    }
  }
</style>
