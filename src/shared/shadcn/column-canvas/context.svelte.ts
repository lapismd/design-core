import { getContext, setContext } from "svelte";
import type { ColumnCanvasController } from "./column-canvas-controller.svelte.js";

const COLUMN_CANVAS_CONTEXT = Symbol("ui-column-canvas");

export type ColumnCanvasContext = {
  /** App-owned controller. Do not destructure reactive fields. */
  controller: ColumnCanvasController;
};

export function setColumnCanvasContext(
  context: ColumnCanvasContext,
): ColumnCanvasContext {
  return setContext(COLUMN_CANVAS_CONTEXT, context);
}

export function useColumnCanvas(): ColumnCanvasController {
  const context = getContext<ColumnCanvasContext | undefined>(
    COLUMN_CANVAS_CONTEXT,
  );
  if (!context) {
    throw new Error(
      "ColumnCanvas compound parts must be rendered inside ColumnCanvas.Root",
    );
  }
  return context.controller;
}
