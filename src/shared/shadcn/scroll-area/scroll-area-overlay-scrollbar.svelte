<script lang="ts">
  import { onDestroy } from "svelte";
  import {
    calculateOverlayScrollbarMetrics,
    scrollOffsetForThumbDrag,
    scrollOffsetForTrackPress,
    shouldShowOverlayScrollbar,
    type OverlayScrollbarMetrics,
    type ScrollAreaType,
  } from "./scroll-area-model.js";

  let {
    root,
    viewport,
    orientation,
    type,
    scrollHideDelay,
    class: className = "",
  }: {
    root: HTMLElement | null;
    viewport: HTMLElement | null;
    orientation: "vertical" | "horizontal";
    type: ScrollAreaType;
    scrollHideDelay: number;
    class?: string;
  } = $props();

  const emptyMetrics: OverlayScrollbarMetrics = {
    overflowing: false,
    maxScroll: 0,
    maxThumbTravel: 0,
    thumbOffset: 0,
    thumbSize: 0,
  };
  let track = $state<HTMLDivElement | null>(null);
  let metrics = $state(emptyMetrics);
  let hovered = $state(false);
  let scrolling = $state(false);
  let interacting = $state(false);
  let dragPointerId = $state<number | null>(null);
  let dragPointerStart = 0;
  let dragScrollStart = 0;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let measurementFrame: number | undefined;

  const visible = $derived(
    shouldShowOverlayScrollbar({
      overflowing: metrics.overflowing,
      type,
      hovered,
      scrolling,
      interacting,
    }),
  );
  const thumbStyle = $derived(
    orientation === "vertical"
      ? `height: ${metrics.thumbSize}px; transform: translateY(${metrics.thumbOffset}px)`
      : `width: ${metrics.thumbSize}px; transform: translateX(${metrics.thumbOffset}px)`,
  );

  function measure(): void {
    measurementFrame = undefined;
    if (!viewport || !track) {
      metrics = emptyMetrics;
      return;
    }
    const vertical = orientation === "vertical";
    metrics = calculateOverlayScrollbarMetrics({
      viewportSize: vertical ? viewport.clientHeight : viewport.clientWidth,
      contentSize: vertical ? viewport.scrollHeight : viewport.scrollWidth,
      scrollOffset: vertical ? viewport.scrollTop : viewport.scrollLeft,
      trackSize: Math.max(0, vertical ? track.clientHeight : track.clientWidth),
    });
  }

  function scheduleMeasurement(): void {
    if (
      measurementFrame !== undefined ||
      typeof requestAnimationFrame === "undefined"
    ) {
      return;
    }
    measurementFrame = requestAnimationFrame(measure);
  }

  function scheduleScrollHide(): void {
    if (hideTimer !== undefined) clearTimeout(hideTimer);
    scrolling = true;
    hideTimer = setTimeout(
      () => {
        scrolling = false;
        hideTimer = undefined;
      },
      Math.max(0, scrollHideDelay),
    );
  }

  function handleTrackPointerDown(event: PointerEvent): void {
    if (!viewport || !track || event.button !== 0) return;
    event.preventDefault();
    interacting = true;
    const bounds = track.getBoundingClientRect();
    const pointerOffset =
      orientation === "vertical"
        ? event.clientY - bounds.top - 1
        : event.clientX - bounds.left - 1;
    const viewportSize =
      orientation === "vertical" ? viewport.clientHeight : viewport.clientWidth;
    const currentScrollOffset =
      orientation === "vertical" ? viewport.scrollTop : viewport.scrollLeft;
    const next = scrollOffsetForTrackPress({
      pointerOffset,
      metrics,
      viewportSize,
      currentScrollOffset,
    });
    if (orientation === "vertical") viewport.scrollTop = next;
    else viewport.scrollLeft = next;
    interacting = false;
    scheduleMeasurement();
    scheduleScrollHide();
  }

  function handleThumbPointerDown(event: PointerEvent): void {
    if (!viewport || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const thumb = event.currentTarget as HTMLElement;
    thumb.setPointerCapture(event.pointerId);
    dragPointerId = event.pointerId;
    dragPointerStart =
      orientation === "vertical" ? event.clientY : event.clientX;
    dragScrollStart =
      orientation === "vertical" ? viewport.scrollTop : viewport.scrollLeft;
    interacting = true;
  }

  function handleThumbPointerMove(event: PointerEvent): void {
    if (!viewport || dragPointerId !== event.pointerId) return;
    event.preventDefault();
    const pointer = orientation === "vertical" ? event.clientY : event.clientX;
    const next = scrollOffsetForThumbDrag({
      pointerDelta: pointer - dragPointerStart,
      startScrollOffset: dragScrollStart,
      metrics,
    });
    if (orientation === "vertical") viewport.scrollTop = next;
    else viewport.scrollLeft = next;
    scheduleMeasurement();
  }

  function endThumbDrag(event: PointerEvent): void {
    if (dragPointerId !== event.pointerId) return;
    const thumb = event.currentTarget as HTMLElement;
    if (thumb.hasPointerCapture(event.pointerId)) {
      thumb.releasePointerCapture(event.pointerId);
    }
    dragPointerId = null;
    interacting = false;
    scheduleScrollHide();
  }

  $effect(() => {
    if (!root) return;
    const handlePointerEnter = () => {
      hovered = true;
    };
    const handlePointerLeave = () => {
      hovered = false;
    };
    root.addEventListener("pointerenter", handlePointerEnter);
    root.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      root.removeEventListener("pointerenter", handlePointerEnter);
      root.removeEventListener("pointerleave", handlePointerLeave);
    };
  });

  $effect(() => {
    if (!viewport || !track) return;
    const handleScroll = () => {
      scheduleMeasurement();
      scheduleScrollHide();
    };
    const observeContent = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(viewport);
      for (const child of viewport.children) resizeObserver.observe(child);
      scheduleMeasurement();
    };
    const resizeObserver = new ResizeObserver(scheduleMeasurement);
    const mutationObserver = new MutationObserver(observeContent);
    viewport.addEventListener("scroll", handleScroll, { passive: true });
    observeContent();
    mutationObserver.observe(viewport, { childList: true, subtree: true });
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  });

  $effect(() => {
    type;
    scrollHideDelay;
    scheduleMeasurement();
  });

  onDestroy(() => {
    if (hideTimer !== undefined) clearTimeout(hideTimer);
    if (measurementFrame !== undefined) cancelAnimationFrame(measurementFrame);
  });
</script>

<!-- The native viewport remains the focusable accessible scroll region. -->
<div
  bind:this={track}
  aria-hidden="true"
  class={`ui-scroll-area__overlay-scrollbar ${className}`}
  data-ui-component="scroll-area"
  data-ui-part="scroll-area-scrollbar"
  data-slot="scroll-area-scrollbar"
  data-orientation={orientation}
  data-scrollbar-overlay
  data-state={visible ? "visible" : "hidden"}
  onpointerdown={handleTrackPointerDown}
>
  <!-- svelte-ignore a11y_no_static_element_interactions (presentation-only thumb delegates to the native accessible viewport) -->
  <div
    class="ui-scroll-area__overlay-thumb"
    data-ui-component="scroll-area"
    data-ui-part="scroll-area-thumb"
    data-slot="scroll-area-thumb"
    data-orientation={orientation}
    data-state={interacting ? "active" : "idle"}
    style={thumbStyle}
    onpointerdown={handleThumbPointerDown}
    onpointermove={handleThumbPointerMove}
    onpointerup={endThumbDrag}
    onpointercancel={endThumbDrag}
  ></div>
</div>

<style>
  [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-scrollbar-overlay].ui-scroll-area__overlay-scrollbar {
    position: absolute;
    display: block;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    opacity: 0;
    pointer-events: none;
    touch-action: none;
    transition: opacity 120ms ease;
    user-select: none;
  }

  [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-scrollbar-overlay].ui-scroll-area__overlay-scrollbar[data-state="visible"] {
    opacity: 1;
    pointer-events: auto;
  }

  [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-scrollbar-overlay].ui-scroll-area__overlay-scrollbar[data-orientation="vertical"] {
    inset-block: 0;
    inset-inline-end: 0;
    width: 0.5rem;
  }

  [data-ui-component="scroll-area"][data-ui-part="scroll-area-scrollbar"][data-scrollbar-overlay].ui-scroll-area__overlay-scrollbar[data-orientation="horizontal"] {
    inset-inline: 0;
    inset-block-end: 0;
    height: 0.5rem;
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb {
    position: absolute;
    flex: none;
    border-radius: var(--ui-scroll-area-radius, 9999px);
    background: var(--ui-scroll-area-foreground, var(--border));
    transition:
      width 140ms ease,
      height 140ms ease,
      background-color 140ms ease;
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb:hover {
    background: color-mix(
      in srgb,
      var(--ui-scroll-area-foreground, var(--border)) 65%,
      currentColor
    );
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb[data-state="active"] {
    background: color-mix(
      in srgb,
      var(--ui-scroll-area-foreground, var(--border)) 50%,
      currentColor
    );
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb[data-orientation="vertical"] {
    inset-inline-end: 0;
    inset-block-start: 0;
    width: 0.25rem;
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb[data-orientation="vertical"]:is(
      :hover,
      [data-state="active"]
    ) {
    width: 0.375rem;
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb[data-orientation="horizontal"] {
    inset-block-end: 0;
    inset-inline-start: 0;
    height: 0.25rem;
  }

  [data-scrollbar-overlay]
    > [data-ui-component="scroll-area"][data-ui-part="scroll-area-thumb"].ui-scroll-area__overlay-thumb[data-orientation="horizontal"]:is(
      :hover,
      [data-state="active"]
    ) {
    height: 0.375rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-scroll-area__overlay-scrollbar,
    .ui-scroll-area__overlay-thumb {
      transition: none !important;
    }
  }
</style>
