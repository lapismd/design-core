<script lang="ts">
  import type { Snippet } from "svelte";
  import {
    pointerDelta,
    shouldCancelSwipeForScroll,
    shouldPagerBack,
    shouldRevealRowSwipe,
  } from "../../lib/motion.js";
  import "../../lib/tasks-theme.css";

  type GestureKind = "row-swipe" | "pager-back";

  type Props = {
    /** Which gesture family this instance participates in. */
    kind: GestureKind;
    /** Disable pointer gesture recognition (e.g. an already-revealed row). */
    disabled?: boolean;
    /** Fired once dx crosses the horizontal-left reveal threshold. */
    onReveal?: () => void;
    /** Fired once the gesture is classified as vertical scroll intent. */
    onCancel?: () => void;
    /** Fired once dx crosses the horizontal-right pager-back threshold. */
    onPagerBack?: () => void;
    children: Snippet;
  };

  let {
    kind,
    disabled = false,
    onReveal,
    onCancel,
    onPagerBack,
    children,
  }: Props = $props();

  let start: { x: number; y: number } | null = $state(null);
  let cancelled = $state(false);

  function reset() {
    start = null;
    cancelled = false;
  }

  function onPointerDown(event: PointerEvent) {
    if (disabled) return;
    start = { x: event.clientX, y: event.clientY };
    cancelled = false;
  }

  function onPointerMove(event: PointerEvent) {
    if (!start || cancelled) return;
    const delta = pointerDelta(start, { x: event.clientX, y: event.clientY });
    if (shouldCancelSwipeForScroll(delta)) {
      cancelled = true;
      onCancel?.();
    }
  }

  function onPointerUp(event: PointerEvent) {
    if (!start || cancelled) {
      reset();
      return;
    }
    const delta = pointerDelta(start, { x: event.clientX, y: event.clientY });
    reset();
    if (kind === "row-swipe" && shouldRevealRowSwipe(delta)) {
      onReveal?.();
      return;
    }
    if (kind === "pager-back" && shouldPagerBack(delta)) {
      onPagerBack?.();
    }
  }
</script>

<div
  class="tasks-theme tasks-swipe-gesture"
  data-tasks-swipe-gesture
  data-gesture-kind={kind}
  role="presentation"
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={reset}
  onpointerleave={reset}
>
  {@render children()}
</div>

<style>
  .tasks-swipe-gesture {
    touch-action: pan-y;
  }
</style>
