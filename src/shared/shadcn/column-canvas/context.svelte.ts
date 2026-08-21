import { getContext, setContext } from "svelte";
import type { Snippet } from "svelte";
import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";
import type { ColumnCanvasResolvedDisplayMode } from "./column-canvas-types.js";

const COLUMN_CANVAS_CONTEXT = Symbol("ui-column-canvas");

export type ColumnCanvasStickyColumnRegistration = {
  /** Stable id shared with the source column. */
  readonly id: string;
  /** Accessible title used by the default rail and return action. */
  readonly title: string;
  /** Consumer-owned contents for the floating rail's return button. */
  readonly rail: Snippet | undefined;
};

export type ColumnCanvasResizeBehavior =
  | { readonly kind: "hidden" }
  | { readonly kind: "column" }
  | {
      readonly kind: "pair";
      readonly leadingColumnId: string;
      readonly trailingColumnId: string;
      readonly trailingTitle: string;
      readonly leadingWidth: number;
      readonly trailingWidth: number;
    };

export type ColumnCanvasContext = {
  /** App-owned controller. Do not destructure reactive fields. */
  controller: ColumnCanvasController;
  /** Resolved presentation mode. Do not destructure this reactive getter. */
  readonly displayMode: ColumnCanvasResolvedDisplayMode;
  /** Schedule active-column alignment after a structural column change. */
  requestAlignment: () => void;
  /** Recompute transient floating-rail geometry without moving the canvas. */
  requestStickyLayout: () => void;
  /** Resolve independent or shared-divider behavior for a visible column. */
  getResizeBehavior: (columnId: string) => ColumnCanvasResizeBehavior;
  /** Register a column's transient floating-rail presentation. */
  registerStickyColumn: (
    registration: ColumnCanvasStickyColumnRegistration,
  ) => () => void;
};

export function setColumnCanvasContext(
  context: ColumnCanvasContext,
): ColumnCanvasContext {
  return setContext(COLUMN_CANVAS_CONTEXT, context);
}

export function useColumnCanvas(): ColumnCanvasController {
  return useColumnCanvasContext().controller;
}

export function useColumnCanvasContext(): ColumnCanvasContext {
  const context = getContext<ColumnCanvasContext | undefined>(
    COLUMN_CANVAS_CONTEXT,
  );
  if (!context) {
    throw new Error(
      "ColumnCanvas compound parts must be rendered inside ColumnCanvas.Root",
    );
  }
  return context;
}
