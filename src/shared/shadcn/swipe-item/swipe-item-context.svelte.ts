import { getContext, setContext, tick } from "svelte";
import {
  constrainSwipeItemOffset,
  resolveSwipeItemSettle,
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
  readonly id: string;
  readonly width: Getter<number>;
  readonly onFullSwipe: Getter<
    ((event: SwipeItemFullSwipeEvent) => void) | undefined
  >;
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

export class SwipeItemState {
  readonly props: SwipeItemStateProps;
  direction = $state<SwipeItemDirection>("ltr");
  itemWidth = $state(0);
  dragOffset = $state<number | null>(null);

  readonly open = $derived.by(() => this.props.open());
  readonly disabled = $derived.by(() => this.props.disabled());
  readonly widths = $derived.by(() => ({
    start: this.#actions.start?.width() ?? 0,
    end: this.#actions.end?.width() ?? 0,
  }));
  readonly fullSwipe = $derived.by(() => ({
    start: Boolean(this.#actions.start?.onFullSwipe()),
    end: Boolean(this.#actions.end?.onFullSwipe()),
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
  #actions = $state<Record<SwipeItemSide, SwipeItemActionsRegistration | null>>(
    {
      start: null,
      end: null,
    },
  );
  #triggers: Record<SwipeItemSide, HTMLButtonElement | null> = {
    start: null,
    end: null,
  };
  #gesture: SwipeGesture | null = null;
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
    return () => {
      if (this.#content === element) this.#content = null;
    };
  }

  registerActions(
    side: SwipeItemSide,
    registration: SwipeItemActionsRegistration,
  ): () => void {
    this.#actions[side] = registration;
    return () => {
      if (this.#actions[side] === registration) {
        this.#actions[side] = null;
      }
    };
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
      startOffset: this.stableOffset,
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

    if (!gesture.dragging) {
      this.#clearGesture();
      return;
    }

    const offset = this.dragOffset ?? gesture.startOffset;
    const result = resolveSwipeItemSettle({
      offset,
      startOffset: gesture.startOffset,
      velocityX: gesture.velocityX,
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
      this.#actions[result.side]?.onFullSwipe()?.({
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

  destroy(): void {
    this.#clearGesture();
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
