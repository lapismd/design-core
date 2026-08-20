export const columnCanvasTokenNames = {
  background: "--ui-column-canvas-background",
  columnBackground: "--ui-column-canvas-column-background",
  borderColor: "--ui-column-canvas-border-color",
  radius: "--ui-column-canvas-radius",
  headerHeight: "--ui-column-canvas-header-height",
  gap: "--ui-column-canvas-gap",
  collapsedWidth: "--ui-column-canvas-collapsed-width",
  compactPeekWidth: "--ui-column-canvas-compact-peek-width",
  wideContextWidth: "--ui-column-canvas-wide-context-width",
  stickyPeekWidth: "--ui-column-canvas-sticky-peek-width",
  resizeHandleHover: "--ui-column-canvas-resize-handle-hover",
  titleColor: "--ui-column-canvas-title-color",
  countColor: "--ui-column-canvas-count-color",
  headerActionHover: "--ui-column-canvas-header-action-hover",
  headerActionHoverForeground:
    "--ui-column-canvas-header-action-hover-foreground",
  padding: "--ui-column-canvas-padding",
  scrollbarGap: "--ui-column-canvas-scrollbar-gap",
  itemGap: "--ui-column-canvas-item-gap",
  itemHover: "--ui-column-canvas-item-hover",
  railHover: "--ui-column-canvas-rail-hover",
  itemSelected: "--ui-column-canvas-item-selected",
  itemSelectedForeground: "--ui-column-canvas-item-selected-foreground",
} as const;

export type ColumnCanvasToken =
  (typeof columnCanvasTokenNames)[keyof typeof columnCanvasTokenNames];
