export const canvasTableTokenNames = {
  background: "--ui-canvas-table-background",
  foreground: "--ui-canvas-table-foreground",
  header: "--ui-canvas-table-header",
  gutter: "--ui-canvas-table-gutter",
  muted: "--ui-canvas-table-muted",
  border: "--ui-canvas-table-border",
  selection: "--ui-canvas-table-selection",
  accent: "--ui-canvas-table-accent",
  search: "--ui-canvas-table-search",
  font: "--ui-canvas-table-font",
  column1: "--ui-canvas-table-column-1",
  column2: "--ui-canvas-table-column-2",
  column3: "--ui-canvas-table-column-3",
  column4: "--ui-canvas-table-column-4",
  column5: "--ui-canvas-table-column-5",
} as const;

export type CanvasTableToken =
  (typeof canvasTableTokenNames)[keyof typeof canvasTableTokenNames];
