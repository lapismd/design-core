import type { HTMLAttributes } from "svelte/elements";

/** Logical edge whose actions are revealed. */
export type SwipeItemSide = "start" | "end";

/** Stable revealed side, or `null` when the item is closed. */
export type SwipeItemOpen = SwipeItemSide | null;

/** Detail passed to a side's release-only full-swipe callback. */
export interface SwipeItemFullSwipeEvent {
  side: SwipeItemSide;
  pointerType: string;
}

export interface SwipeItemRootProps extends HTMLAttributes<HTMLDivElement> {
  ref?: HTMLDivElement | null;
  /** Stable controlled/uncontrolled reveal state. */
  open?: SwipeItemOpen;
  /** Disables pointer gestures, triggers, and actions. */
  disabled?: boolean;
  /** Pixels of movement required before horizontal intent is accepted. */
  activationDistance?: number;
  /** Fraction of the action-pane width required to settle it open. */
  revealThreshold?: number;
  /** Fraction of the item width required to run a full-swipe callback. */
  fullSwipeThreshold?: number;
  /** Horizontal pixels per millisecond required for velocity settling. */
  velocityThreshold?: number;
  /** Called when an interaction changes the stable revealed side. */
  onOpenChange?: (open: SwipeItemOpen) => void;
}
