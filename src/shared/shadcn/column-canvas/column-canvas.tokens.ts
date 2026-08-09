export const columnCanvasTokenNames = {
  background: "--ui-column-canvas-background",
  columnBackground: "--ui-column-canvas-column-background",
  borderColor: "--ui-column-canvas-border-color",
  radius: "--ui-column-canvas-radius",
  headerHeight: "--ui-column-canvas-header-height",
  gap: "--ui-column-canvas-gap",
  collapsedWidth: "--ui-column-canvas-collapsed-width",
  resizeHandleHover: "--ui-column-canvas-resize-handle-hover",
  titleColor: "--ui-column-canvas-title-color",
  countColor: "--ui-column-canvas-count-color",
  padding: "--ui-column-canvas-padding",
  itemHover: "--ui-column-canvas-item-hover",
  itemSelected: "--ui-column-canvas-item-selected",
  itemSelectedForeground: "--ui-column-canvas-item-selected-foreground",
} as const;

export type ColumnCanvasToken =
  (typeof columnCanvasTokenNames)[keyof typeof columnCanvasTokenNames];
