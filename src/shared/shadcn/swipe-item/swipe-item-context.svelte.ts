import { getContext, setContext, tick } from "svelte";
import {
  SWIPE_ITEM_WHEEL_IDLE_MS,
  constrainSwipeItemOffset,
  resolveSwipeItemSettle,
  swipeItemOffsetDeltaFromWheel,
  swipeItemSideForOffset,
  swipeItemStableOffset,
  type SwipeItemDirection,
} from "./swipe-item-gesture.js";
import type {
  SwipeItemFullSwipeEvent,
  SwipeItemOpen,
  SwipeItemSide,
} from "./types.js";

type Getter<T> = () => T;

interface SwipeItemStateProps {
  open: Getter<SwipeItemOpen>;
  setOpen: (open: SwipeItemOpen) => void;
  disabled: Getter<boolean>;
  activationDistance: Getter<number>;
  revealThreshold: Getter<number>;
  fullSwipeThreshold: Getter<number>;
  velocityThreshold: Getter<number>;
  actionsId: (side: SwipeItemSide) => string;
}

interface SwipeItemActionsRegistration {
  readonly onFullSwipe: ((event: SwipeItemFullSwipeEvent) => void) | undefined;
}

interface SwipeGesture {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  startOffset: number;
  lastX: number;
  lastTime: number;
  velocityX: number;
  dragging: boolean;
  captured: boolean;
  ownerDocument: Document;
}

interface SwipeWheelSession {
  startOffset: number;
  rawOffset: number;
  absDeltaX: number;
  absDeltaY: number;
  active: boolean;
  lastTime: number;
  velocityX: number;
  ownerDocument: Document;
  idleTimer: number | null;
}

export class SwipeItemState {
  readonly props: SwipeItemStateProps;
  direction = $state<SwipeItemDirection>("ltr");
  itemWidth = $state(0);
  dragOffset = $state<number | null>(null);

  readonly open = $derived.by(() => this.props.open());
  readonly disabled = $derived.by(() => this.props.disabled());
  readonly widths = $derived.by(() => ({
    start: this.#actionWidths.start,
    end: this.#actionWidths.end,
  }));
  readonly fullSwipe = $derived.by(() => ({
    start: this.#fullSwipeAvailable.start,
    end: this.#fullSwipeAvailable.end,
  }));
  readonly stableOffset = $derived.by(() =>
    swipeItemStableOffset(this.open, this.direction, this.widths),
  );
  readonly offset = $derived(this.dragOffset ?? this.stableOffset);
  readonly dragging = $derived(this.dragOffset !== null);
  readonly activeSide = $derived(
    swipeItemSideForOffset(this.offset, this.direction),
  );
  readonly armedSide = $derived.by(() => {
    const side = this.activeSide;
    if (
      !this.dragging ||
      !side ||
      !this.fullSwipe[side] ||
      Math.abs(this.offset) <
        this.itemWidth *
          Math.max(0, Math.min(1, this.props.fullSwipeThreshold()))
    ) {
      return null;
    }
    return side;
  });

  #root: HTMLDivElement | null = null;
  #content: HTMLDivElement | null = null;
  #actions: Record<SwipeItemSide, SwipeItemActionsRegistration | null> = {
    start: null,
    end: null,
  };
  #actionWidths = $state<Record<SwipeItemSide, number>>({
    start: 0,
    end: 0,
  });
  #fullSwipeAvailable = $state<Record<SwipeItemSide, boolean>>({
    start: false,
    end: false,
  });
  #triggers: Record<SwipeItemSide, HTMLButtonElement | null> = {
    start: null,
    end: null,
  };
  #gesture: SwipeGesture | null = null;
  #wheelSession: SwipeWheelSession | null = null;
  #suppressClick = false;
  #suppressClickTimer: number | null = null;

  constructor(props: SwipeItemStateProps) {
    this.props = props;
  }

  actionsId(side: SwipeItemSide): string {
    return this.props.actionsId(side);
  }

  bindRoot(element: HTMLDivElement | null): () => void {
    this.#root = element;
    if (!element) return () => {};

    const measure = () => {
      this.itemWidth = element.getBoundingClientRect().width;
      this.direction =
        getComputedStyle(element).direction === "rtl" ? "rtl" : "ltr";
    };
    measure();

    if (typeof ResizeObserver === "undefined") return () => {};
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
      if (this.#root === element) this.#root = null;
    };
  }

  bindContent(element: HTMLDivElement | null): () => void {
    this.#content = element;
    if (!element) return () => {};

    element.addEventListener("wheel", this.handleWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", this.handleWheel);
      if (this.#content === element) this.#content = null;
    };
  }

  registerActions(
    side: SwipeItemSide,
    registration: SwipeItemActionsRegistration,
  ): () => void {
    this.#actions[side] = registration;
    this.#fullSwipeAvailable[side] = Boolean(registration.onFullSwipe);
    return () => {
      if (this.#actions[side] === registration) {
        this.#actions[side] = null;
        this.#actionWidths[side] = 0;
        this.#fullSwipeAvailable[side] = false;
      }
    };
  }

  setActionsWidth(side: SwipeItemSide, width: number): void {
    this.#actionWidths[side] = Math.max(0, width);
  }

  registerTrigger(
    side: SwipeItemSide,
    element: HTMLButtonElement | null,
  ): () => void {
    this.#triggers[side] = element;
    return () => {
      if (this.#triggers[side] === element) this.#triggers[side] = null;
    };
  }

  setOpen(open: SwipeItemOpen): void {
    if (this.disabled && open !== null) return;
    this.props.setOpen(open);
  }

  toggle(side: SwipeItemSide): void {
    this.setOpen(this.open === side ? null : side);
  }

  close(options: { focusSide?: SwipeItemSide } = {}): void {
    const focusSide = options.focusSide;
    this.setOpen(null);
    if (focusSide) {
      void tick().then(() => this.#triggers[focusSide]?.focus());
    }
  }

  #isIgnoredStart(target: EventTarget | null): boolean {
    return (
      target instanceof Element &&
      Boolean(
        target.closest(
          [
            '[data-ui-component="swipe-item"][data-ui-part="actions"]',
            '[data-ui-part="trigger"]',
            "[data-swipe-item-gesture-ignore]",
            "input",
            "select",
            "textarea",
            "summary",
            "[contenteditable='true']",
            "[role='combobox']",
            "[role='listbox']",
            "[role='menu']",
            "[role='slider']",
          ].join(","),
        ),
      )
    );
  }

  handlePointerDown = (
    event: PointerEvent & { currentTarget: HTMLDivElement },
  ): void => {
    if (
      this.disabled ||
      !event.isPrimary ||
      event.button !== 0 ||
      this.#isIgnoredStart(event.target)
    ) {
      return;
    }

    const startOffset = this.dragOffset ?? this.stableOffset;
    this.#clearWheelSession({ settle: false, clearOffset: false });

    this.direction =
      this.#root && getComputedStyle(this.#root).direction === "rtl"
        ? "rtl"
        : "ltr";
    const captured = event.pointerType !== "touch";
    if (captured) event.currentTarget.setPointerCapture?.(event.pointerId);
    this.#gesture = {
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      startOffset,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocityX: 0,
      dragging: false,
      captured,
      ownerDocument: event.currentTarget.ownerDocument,
    };

    if (event.pointerType === "touch") {
      const ownerDocument = event.currentTarget.ownerDocument;
      ownerDocument.addEventListener("pointermove", this.handlePointerMove, {
        passive: false,
      });
      ownerDocument.addEventListener("pointerup", this.handlePointerEnd);
      ownerDocument.addEventListener("pointercancel", this.handlePointerCancel);
    }
  };

  handlePointerMove = (event: PointerEvent): void => {
    const gesture = this.#gesture;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (!gesture.dragging) {
      const distance = Math.max(
        0,
        Number.isFinite(this.props.activationDistance())
          ? this.props.activationDistance()
          : 10,
      );
      if (Math.abs(deltaX) < distance && Math.abs(deltaY) < distance) return;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        this.#clearGesture();
        return;
      }
      gesture.dragging = true;
    }

    event.preventDefault();
    this.dragOffset = constrainSwipeItemOffset({
      rawOffset: gesture.startOffset + deltaX,
      direction: this.direction,
      widths: this.widths,
      fullSwipe: this.fullSwipe,
      itemWidth: this.itemWidth,
    });
    const elapsed = Math.max(1, event.timeStamp - gesture.lastTime);
    gesture.velocityX = (event.clientX - gesture.lastX) / elapsed;
    gesture.lastX = event.clientX;
    gesture.lastTime = event.timeStamp;
  };

  handlePointerEnd = (event: PointerEvent): void => {
    const gesture = this.#gesture;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    // Settle when the pointer dragged, or when it took over a live wheel offset.
    if (!gesture.dragging && this.dragOffset === null) {
      this.#clearGesture();
      return;
    }

    const offset = this.dragOffset ?? gesture.startOffset;
    const result = resolveSwipeItemSettle({
      offset,
      startOffset: gesture.startOffset,
      velocityX: gesture.dragging ? gesture.velocityX : 0,
      direction: this.direction,
      widths: this.widths,
      fullSwipe: this.fullSwipe,
      itemWidth: this.itemWidth,
      revealThreshold: this.props.revealThreshold(),
      fullSwipeThreshold: this.props.fullSwipeThreshold(),
      velocityThreshold: this.props.velocityThreshold(),
    });
    this.#markCompatibilityClickForSuppression(gesture.ownerDocument);
    this.#clearGesture();

    if (result.kind === "commit") {
      this.#actions[result.side]?.onFullSwipe?.({
        side: result.side,
        pointerType: gesture.pointerType,
      });
      this.setOpen(null);
    } else {
      this.setOpen(result.kind === "open" ? result.side : null);
    }
  };

  handlePointerCancel = (event: PointerEvent): void => {
    if (this.#gesture?.pointerId === event.pointerId) this.#clearGesture();
  };

  handleLostPointerCapture = (event: PointerEvent): void => {
    if (this.#gesture?.pointerId === event.pointerId) this.#clearGesture();
  };

  handleContentClickCapture = (event: MouseEvent): void => {
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest('[data-ui-part="trigger"]')
    ) {
      return;
    }

    if (this.#suppressClick) {
      this.#suppressClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.open !== null) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.setOpen(null);
    }
  };

  handleKeydown = (event: KeyboardEvent): void => {
    if (
      event.key !== "Escape" ||
      event.defaultPrevented ||
      this.open === null
    ) {
      return;
    }
    event.preventDefault();
    const focusSide = this.open;
    this.close({ focusSide });
  };

  handleOutsidePointerDown = (event: PointerEvent): void => {
    if (
      this.open !== null &&
      event.target instanceof Node &&
      !this.#root?.contains(event.target)
    ) {
      this.setOpen(null);
    }
  };

  handleWheel = (event: WheelEvent): void => {
    if (this.disabled || this.#gesture || this.#isIgnoredStart(event.target)) {
      return;
    }

    const deltaX = event.deltaX;
    const deltaY = event.deltaY;
    if (deltaX === 0 && deltaY === 0) return;

    let session = this.#wheelSession;
    if (!session) {
      this.direction =
        this.#root && getComputedStyle(this.#root).direction === "rtl"
          ? "rtl"
          : "ltr";
      session = {
        startOffset: this.stableOffset,
        rawOffset: this.stableOffset,
        absDeltaX: 0,
        absDeltaY: 0,
        active: false,
        lastTime: event.timeStamp,
        velocityX: 0,
        ownerDocument:
          this.#content?.ownerDocument ?? this.#root?.ownerDocument ?? document,
        idleTimer: null,
      };
      this.#wheelSession = session;
    }

    session.absDeltaX += Math.abs(deltaX);
    session.absDeltaY += Math.abs(deltaY);

    if (!session.active) {
      const distance = Math.max(
        0,
        Number.isFinite(this.props.activationDistance())
          ? this.props.activationDistance()
          : 10,
      );
      if (session.absDeltaX < distance && session.absDeltaY < distance) {
        this.#scheduleWheelIdle(session);
        return;
      }
      if (session.absDeltaX <= session.absDeltaY) {
        this.#clearWheelSession({ settle: false, clearOffset: true });
        return;
      }
      session.active = true;
    }

    event.preventDefault();
    const offsetDelta = swipeItemOffsetDeltaFromWheel(deltaX);
    const elapsed = Math.max(1, event.timeStamp - session.lastTime);
    session.velocityX = offsetDelta / elapsed;
    session.lastTime = event.timeStamp;
    session.rawOffset += offsetDelta;
    this.dragOffset = constrainSwipeItemOffset({
      rawOffset: session.rawOffset,
      direction: this.direction,
      widths: this.widths,
      fullSwipe: this.fullSwipe,
      itemWidth: this.itemWidth,
    });
    this.#scheduleWheelIdle(session);
  };

  destroy(): void {
    this.#clearGesture();
    this.#clearWheelSession({ settle: false, clearOffset: true });
    if (this.#suppressClickTimer !== null && this.#root) {
      this.#root.ownerDocument.defaultView?.clearTimeout(
        this.#suppressClickTimer,
      );
    }
  }

  #markCompatibilityClickForSuppression(ownerDocument: Document): void {
    this.#suppressClick = true;
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) return;
    if (this.#suppressClickTimer !== null) {
      ownerWindow.clearTimeout(this.#suppressClickTimer);
    }
    this.#suppressClickTimer = ownerWindow.setTimeout(() => {
      this.#suppressClick = false;
      this.#suppressClickTimer = null;
    }, 0);
  }

  #scheduleWheelIdle(session: SwipeWheelSession): void {
    const ownerWindow = session.ownerDocument.defaultView;
    if (!ownerWindow) return;
    if (session.idleTimer !== null) {
      ownerWindow.clearTimeout(session.idleTimer);
    }
    session.idleTimer = ownerWindow.setTimeout(() => {
      if (this.#wheelSession !== session) return;
      if (session.active) {
        this.#settleWheelSession(session);
      } else {
        this.#clearWheelSession({ settle: false, clearOffset: true });
      }
    }, SWIPE_ITEM_WHEEL_IDLE_MS);
  }

  #settleWheelSession(session: SwipeWheelSession): void {
    const offset = this.dragOffset ?? session.rawOffset;
    const result = resolveSwipeItemSettle({
      offset,
      startOffset: session.startOffset,
      velocityX: session.velocityX,
      direction: this.direction,
      widths: this.widths,
      fullSwipe: this.fullSwipe,
      itemWidth: this.itemWidth,
      revealThreshold: this.props.revealThreshold(),
      fullSwipeThreshold: this.props.fullSwipeThreshold(),
      velocityThreshold: this.props.velocityThreshold(),
    });
    this.#clearWheelSession({ settle: false, clearOffset: true });

    if (result.kind === "commit") {
      this.#actions[result.side]?.onFullSwipe?.({
        side: result.side,
        pointerType: "wheel",
      });
      this.setOpen(null);
    } else {
      this.setOpen(result.kind === "open" ? result.side : null);
    }
  }

  #clearWheelSession(options: { settle: boolean; clearOffset: boolean }): void {
    const session = this.#wheelSession;
    if (!session) {
      if (options.clearOffset && !this.#gesture) this.dragOffset = null;
      return;
    }

    if (options.settle && session.active) {
      this.#settleWheelSession(session);
      return;
    }

    const ownerWindow = session.ownerDocument.defaultView;
    if (session.idleTimer !== null && ownerWindow) {
      ownerWindow.clearTimeout(session.idleTimer);
    }
    this.#wheelSession = null;
    if (options.clearOffset && !this.#gesture) this.dragOffset = null;
  }

  #clearGesture(): void {
    const gesture = this.#gesture;
    if (!gesture) return;
    this.#gesture = null;
    if (
      gesture.captured &&
      this.#content?.hasPointerCapture?.(gesture.pointerId)
    ) {
      this.#content.releasePointerCapture?.(gesture.pointerId);
    }
    gesture.ownerDocument.removeEventListener(
      "pointermove",
      this.handlePointerMove,
    );
    gesture.ownerDocument.removeEventListener(
      "pointerup",
      this.handlePointerEnd,
    );
    gesture.ownerDocument.removeEventListener(
      "pointercancel",
      this.handlePointerCancel,
    );
    this.dragOffset = null;
  }
}

const SWIPE_ITEM_CONTEXT = Symbol("ui-swipe-item");

export function setSwipeItemState(props: SwipeItemStateProps): SwipeItemState {
  return setContext(SWIPE_ITEM_CONTEXT, new SwipeItemState(props));
}

export function useSwipeItemState(): SwipeItemState {
  const state = getContext<SwipeItemState | undefined>(SWIPE_ITEM_CONTEXT);
  if (!state) {
    throw new Error(
      "SwipeItem compound parts must be rendered inside SwipeItem.Root",
    );
  }
  return state;
}
