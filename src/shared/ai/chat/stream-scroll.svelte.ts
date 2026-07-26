export type ScrollBehavior = "instant" | "spring";

export type StreamScrollOptions = {
  enabled?: boolean;
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
): StreamScrollController {
  const {
    enabled = true,
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
    isLocked = distance <= lockThreshold;
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
    if (behavior === "instant" || prefersReducedMotion()) {
      jumpToBottom();
      return;
    }
    springToBottom();
  }

  function handleScroll(): void {
    if (frame) stopAnimation();
    update();
  }

  function attach(next: HTMLElement | null): void {
    if (element === next) return;
    cleanup();
    element = next;
    element?.addEventListener("scroll", handleScroll, { passive: true });
    if (element && enabled) {
      raf(() => {
        if (element === next) jumpToBottom();
      });
    }
  }

  function cleanup(): void {
    element?.removeEventListener("scroll", handleScroll);
    stopAnimation();
    element = null;
  }

  return {
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
      if (isLocked) scrollToBottom({ behavior: "instant" });
    },
    lock() {
      isLocked = true;
    },
    unlock() {
      isLocked = false;
    },
  };
}
