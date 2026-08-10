import { getContext, setContext } from "svelte";
import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";
import type { ColumnCanvasResolvedDisplayMode } from "./column-canvas-types.js";

const COLUMN_CANVAS_CONTEXT = Symbol("ui-column-canvas");

export type ColumnCanvasContext = {
  /** App-owned controller. Do not destructure reactive fields. */
  controller: ColumnCanvasController;
  /** Resolved presentation mode. Do not destructure this reactive getter. */
  readonly displayMode: ColumnCanvasResolvedDisplayMode;
  /** Schedule active-column alignment after a structural column change. */
  requestAlignment: () => void;
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
