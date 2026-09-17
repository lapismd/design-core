export type ScrollBehavior = "instant" | "spring";

export type StreamScrollOptions = {
  enabled?: boolean;
  /** Opt in to preserving a visible row during content resizing. */
  anchorOnResize?: boolean | (() => boolean);
  lockThreshold?: number;
  buttonThreshold?: number;
  damping?: number;
  stiffness?: number;
  mass?: number;
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame;
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame;
  prefersReducedMotion?: () => boolean;
};

export type ScrollToBottomOptions = {
  behavior?: ScrollBehavior;
};

export type StreamScrollController = {
  /** Optional positioning extensions keep existing custom controllers assignable. */
  readonly positionRevision?: number;
  scrollToOffset?: (offset: number, preserveIntent?: boolean) => void;
  captureAnchor?: () => () => void;
  contentResized?: (options?: { restoreAnchor?: boolean }) => void;
  readonly isScrolledUp: boolean;
  readonly isLocked: boolean;
  attach: (element: HTMLElement | null) => void;
  cleanup: () => void;
  update: () => void;
  scrollToBottom: (options?: ScrollToBottomOptions) => void;
  scrollToMessage: (element: HTMLElement) => void;
  scrollToLastMessage: () => void;
  scrollIfLocked: () => void;
  lock: () => void;
  unlock: () => void;
};

export type PositionedStreamScrollController = StreamScrollController &
  Required<
    Pick<
      StreamScrollController,
      "positionRevision" | "scrollToOffset" | "captureAnchor" | "contentResized"
    >
  >;

function reducedMotionDefault(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function defaultRaf(callback: FrameRequestCallback): number {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback);
  }
  return setTimeout(() => callback(Date.now()), 16) as unknown as number;
}

function defaultCaf(id: number): void {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(id);
  } else {
    clearTimeout(id);
  }
}

export function createStreamScroll(
  options: StreamScrollOptions = {},
): PositionedStreamScrollController {
  const {
    enabled = true,
    anchorOnResize = false,
    lockThreshold = 24,
    buttonThreshold = 80,
    damping = 26,
    stiffness = 220,
    mass = 1,
    requestAnimationFrame: raf = defaultRaf,
    cancelAnimationFrame: caf = defaultCaf,
    prefersReducedMotion = reducedMotionDefault,
  } = options;

  let element: HTMLElement | null = null;
  let frame = 0;
  let lastTime = 0;
  let velocity = 0;
  let positionRevision = 0;
  let restoreAnchor: (() => void) | undefined;
  let pendingUserScroll = false;
  let adjustedScrollTop: number | undefined;
  const anchorsEnabled = () =>
    typeof anchorOnResize === "function" ? anchorOnResize() : anchorOnResize;
  let isLocked = $state(true);
  let isScrolledUp = $state(false);

  function distanceFromBottom(): number {
    if (!element) return 0;
    return Math.max(
      0,
      element.scrollHeight - element.clientHeight - element.scrollTop,
    );
  }

  function update(): void {
    if (!element || !enabled) {
      isScrolledUp = false;
      return;
    }
    const distance = distanceFromBottom();
    isScrolledUp = distance > buttonThreshold;
    isLocked = !pendingUserScroll && distance <= lockThreshold;
  }

  function stopAnimation(): void {
    if (frame) {
      caf(frame);
      frame = 0;
    }
    velocity = 0;
    lastTime = 0;
  }

  function jumpToBottom(): void {
    if (!element) return;
    stopAnimation();
    element.scrollTop = Math.max(
      0,
      element.scrollHeight - element.clientHeight,
    );
    pendingUserScroll = false;
    isLocked = true;
    isScrolledUp = false;
  }

  function springToBottom(): void {
    if (!element) return;
    stopAnimation();

    const tick = (time: number) => {
      if (!element) return;
      const dt = Math.min(
        0.064,
        Math.max(0.001, (time - lastTime) / 1000 || 0.016),
      );
      lastTime = time;
      const target = Math.max(0, element.scrollHeight - element.clientHeight);
      const displacement = target - element.scrollTop;
      const acceleration =
        (stiffness * displacement - damping * velocity) / mass;
      velocity += acceleration * dt;
      element.scrollTop += velocity * dt;

      if (Math.abs(displacement) < 0.5 && Math.abs(velocity) < 0.5) {
        element.scrollTop = target;
        frame = 0;
        velocity = 0;
        isLocked = true;
        isScrolledUp = false;
        return;
      }
      frame = raf(tick);
    };

    frame = raf(tick);
  }

  function scrollToBottom({
    behavior = "spring",
  }: ScrollToBottomOptions = {}): void {
    if (!element || !enabled) return;
    positionRevision++;
    restoreAnchor = undefined;
    if (behavior === "instant" || prefersReducedMotion()) {
      jumpToBottom();
      return;
    }
    springToBottom();
  }

  function captureAnchor(): () => void {
    const viewport = element;
    const revision = positionRevision;
    const top = viewport?.getBoundingClientRect().top ?? 0;
    const anchor = [
      ...(viewport?.querySelectorAll<HTMLElement>(
        "[data-message-id], [data-ui-component='ai-chat-message']",
      ) ?? []),
    ].find((row) => row.getBoundingClientRect().bottom > top);
    const offset = anchor ? anchor.getBoundingClientRect().top - top : 0;
    const height = viewport?.scrollHeight ?? 0;
    const scrollTop = viewport?.scrollTop ?? 0;
    return () => {
      if (
        !viewport ||
        viewport !== element ||
        revision !== positionRevision ||
        isLocked
      )
        return;
      if (anchor?.isConnected)
        viewport.scrollTop +=
          anchor.getBoundingClientRect().top -
          viewport.getBoundingClientRect().top -
          offset;
      else viewport.scrollTop = scrollTop + viewport.scrollHeight - height;
      update();
    };
  }

  function handleScroll(): void {
    if (
      adjustedScrollTop !== undefined &&
      element?.scrollTop === adjustedScrollTop
    ) {
      adjustedScrollTop = undefined;
      isScrolledUp = distanceFromBottom() > buttonThreshold;
      return;
    }
    adjustedScrollTop = undefined;
    pendingUserScroll = false;
    update();
    restoreAnchor = !isLocked && anchorsEnabled() ? captureAnchor() : undefined;
  }

  function handleUserScrollIntent(): void {
    adjustedScrollTop = undefined;
    positionRevision++;
    if (anchorsEnabled()) {
      pendingUserScroll = true;
      isLocked = false;
    }
    restoreAnchor = undefined;
    if (frame) stopAnimation();
  }

  function handlePointerIntent(): void {
    positionRevision++;
    restoreAnchor = undefined;
    if (frame) stopAnimation();
  }

  function handleKeydown(event: KeyboardEvent): void {
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ].includes(event.key)
    )
      handleUserScrollIntent();
  }

  function attach(next: HTMLElement | null): void {
    if (element === next) return;
    cleanup();
    element = next;
    element?.addEventListener("scroll", handleScroll, { passive: true });
    element?.addEventListener("wheel", handleUserScrollIntent, {
      passive: true,
    });
    element?.addEventListener("touchstart", handleUserScrollIntent, {
      passive: true,
    });
    element?.addEventListener("pointerdown", handlePointerIntent, {
      passive: true,
    });
    element?.addEventListener("keydown", handleKeydown);
    if (element && enabled) {
      const revision = positionRevision;
      raf(() => {
        if (element === next && revision === positionRevision) jumpToBottom();
      });
    }
  }

  function cleanup(): void {
    element?.removeEventListener("scroll", handleScroll);
    element?.removeEventListener("keydown", handleKeydown);
    element?.removeEventListener("wheel", handleUserScrollIntent);
    element?.removeEventListener("touchstart", handleUserScrollIntent);
    element?.removeEventListener("pointerdown", handlePointerIntent);
    stopAnimation();
    positionRevision++;
    pendingUserScroll = false;
    adjustedScrollTop = undefined;
    restoreAnchor = undefined;
    element = null;
  }

  return {
    get positionRevision() {
      return positionRevision;
    },
    captureAnchor,
    contentResized({ restoreAnchor: shouldRestore = true } = {}) {
      if (isLocked) {
        jumpToBottom();
        update();
      } else {
        if (shouldRestore && anchorsEnabled()) restoreAnchor?.();
        // Geometry changes cannot acknowledge that the reader returned to latest.
        isLocked = false;
        isScrolledUp = distanceFromBottom() > buttonThreshold;
      }
    },
    scrollToOffset(offset, preserveIntent = false) {
      if (!element) return;
      if (!preserveIntent) positionRevision++;
      stopAnimation();
      element.scrollTop = Math.max(0, offset);
      if (preserveIntent) {
        // A measurement correction can clamp against the previous DOM height.
        // It must not relock following before the resized rows have rendered.
        adjustedScrollTop = element.scrollTop;
        isScrolledUp = distanceFromBottom() > buttonThreshold;
      } else update();
    },
    get isScrolledUp() {
      return isScrolledUp;
    },
    get isLocked() {
      return isLocked;
    },
    attach,
    cleanup,
    update,
    scrollToBottom,
    scrollToMessage(message) {
      if (!element) return;
      stopAnimation();
      positionRevision++;
      const offset =
        message.getBoundingClientRect().top -
        element.getBoundingClientRect().top +
        element.scrollTop;
      element.scrollTop = Math.max(0, offset);
      update();
    },
    scrollToLastMessage() {
      const message = element?.querySelector<HTMLElement>(
        '[data-ui-component="ai-chat-message"]',
      );
      const all = element?.querySelectorAll<HTMLElement>(
        '[data-ui-component="ai-chat-message"]',
      );
      const last = all?.item((all?.length ?? 1) - 1) ?? message;
      if (last) this.scrollToMessage(last);
    },
    scrollIfLocked() {
      if (isLocked) jumpToBottom();
    },
    lock() {
      isLocked = true;
    },
    unlock() {
      isLocked = false;
    },
  };
}
