import { getContext, setContext } from "svelte";

const COLUMN_CANVAS_COLUMN_CONTEXT = Symbol("ui-column-canvas-column");

export type ColumnCanvasColumnContext = {
  id: string;
  /** Convenience title used for a11y labels and default header. */
  title: string;
  count: number | undefined;
  resizable: boolean;
  collapsible: boolean;
};

export function setColumnCanvasColumnContext(
  context: ColumnCanvasColumnContext,
): ColumnCanvasColumnContext {
  return setContext(COLUMN_CANVAS_COLUMN_CONTEXT, context);
}

export function useColumnCanvasColumn(): ColumnCanvasColumnContext {
  const context = getContext<ColumnCanvasColumnContext | undefined>(
    COLUMN_CANVAS_COLUMN_CONTEXT,
  );
  if (!context) {
    throw new Error(
      "ColumnCanvas header/body parts must be rendered inside ColumnCanvas.Column",
    );
  }
  return context;
}
