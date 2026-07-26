export type NewMessagesOptions = {
  isLocked: () => boolean;
  onResize?: () => void;
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
  let initialized = false;
  let hasNewMessages = $state(false);
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
      if (!initialized) {
        initialized = true;
        return;
      }
      markNew();
    });
    observer?.observe(element);
  }

  function cleanup(): void {
    observer?.disconnect();
    observer = null;
    element = null;
    initialized = false;
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
