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
  class="border-sidebar-border bg-sidebar text-sidebar-foreground relative flex h-full min-h-0 shrink-0 flex-col border-r"
  style={`width: ${width}px`}
  data-resizable-sidebar
>
  {@render children?.()}
  <div
    role="slider"
    tabindex="0"
    class="absolute top-4 -right-1.5 bottom-4 z-20 hidden w-3 cursor-col-resize items-stretch justify-center rounded-full bg-transparent outline-none md:flex"
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
      class:bg-primary={resizing || hovering}
      class:opacity-60={resizing || hovering}
      class="my-2.5 w-px bg-transparent transition-colors"
      aria-hidden="true"
    ></span>
  </div>
</aside>
