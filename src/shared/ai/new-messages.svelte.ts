export type NewMessagesOptions = {
  isLocked: () => boolean;
  onResize?: () => void;
  /** Opt in to coalescing geometry work outside the ResizeObserver delivery. */
  deferResize?: boolean | (() => boolean);
  requestAnimationFrame?: typeof globalThis.requestAnimationFrame;
  cancelAnimationFrame?: typeof globalThis.cancelAnimationFrame;
  createResizeObserver?: (
    callback: ResizeObserverCallback,
  ) => Pick<ResizeObserver, "observe" | "disconnect">;
};

export type NewMessagesController = {
  readonly hasNewMessages: boolean;
  attach: (element: HTMLElement | null) => void;
  notify: (messageId?: string) => void;
  dismiss: () => void;
  cleanup: () => void;
};

export function createNewMessages(
  options: NewMessagesOptions,
): NewMessagesController {
  let element: HTMLElement | null = null;
  let observer: Pick<ResizeObserver, "observe" | "disconnect"> | null = null;
  let hasNewMessages = $state(false);
  let resizeFrame = 0;
  const seenMessageIds = new Set<string>();

  const makeObserver =
    options.createResizeObserver ??
    ((callback: ResizeObserverCallback) =>
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(callback));

  function markNew(): void {
    options.onResize?.();
    if (!options.isLocked()) {
      hasNewMessages = true;
    }
  }

  function attach(next: HTMLElement | null): void {
    cleanup();
    element = next;
    if (!element) return;

    observer = makeObserver((entries) => {
      if (!entries.some((entry) => entry.target === element)) return;
      const deferred =
        typeof options.deferResize === "function"
          ? options.deferResize()
          : options.deferResize;
      if (!deferred) {
        options.onResize?.();
        return;
      }
      if (resizeFrame) return;
      const current = element;
      resizeFrame = (options.requestAnimationFrame ?? requestAnimationFrame)(
        () => {
          resizeFrame = 0;
          if (element === current) options.onResize?.();
        },
      );
    });
    observer?.observe(element);
  }

  function cleanup(): void {
    if (resizeFrame)
      (options.cancelAnimationFrame ?? cancelAnimationFrame)(resizeFrame);
    resizeFrame = 0;
    observer?.disconnect();
    observer = null;
    element = null;
    hasNewMessages = false;
    seenMessageIds.clear();
  }

  return {
    get hasNewMessages() {
      return hasNewMessages;
    },
    attach,
    notify(messageId) {
      if (messageId) {
        if (seenMessageIds.has(messageId)) return;
        seenMessageIds.add(messageId);
      }
      markNew();
    },
    dismiss() {
      hasNewMessages = false;
    },
    cleanup,
  };
}
