import Root from "./column-canvas.svelte";
import Column from "./column-canvas-column.svelte";
import CollapsedColumn from "./column-canvas-collapsed-column.svelte";
import Header from "./column-canvas-header.svelte";
import Title from "./column-canvas-title.svelte";
import Count from "./column-canvas-count.svelte";
import HeaderActions from "./column-canvas-header-actions.svelte";
import Toggle from "./column-canvas-toggle.svelte";
import Close from "./column-canvas-close.svelte";
import Body from "./column-canvas-body.svelte";
import Item from "./column-canvas-item.svelte";

export {
  Root,
  Column,
  CollapsedColumn,
  Header,
  Title,
  Count,
  HeaderActions,
  Toggle,
  Close,
  Body,
  Item,
  //
  Root as ColumnCanvas,
  Column as ColumnCanvasColumn,
  CollapsedColumn as ColumnCanvasCollapsedColumn,
  Header as ColumnCanvasHeader,
  Title as ColumnCanvasTitle,
  Count as ColumnCanvasCount,
  HeaderActions as ColumnCanvasHeaderActions,
  Toggle as ColumnCanvasToggle,
  Close as ColumnCanvasClose,
  Body as ColumnCanvasBody,
  Item as ColumnCanvasItem,
};

export {
  createColumnCanvasController,
  ColumnCanvasController,
  COLUMN_CANVAS_DEFAULT_MIN_WIDTH,
  COLUMN_CANVAS_DEFAULT_MAX_WIDTH,
  COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH,
  type ColumnCanvasColumnConfig,
  type CreateColumnCanvasControllerOptions,
} from "./column-canvas-controller.svelte.js";

export {
  COLUMN_CANVAS_LAYOUT_VERSION,
  COLUMN_CANVAS_LAYOUT_V1_VERSION,
  COLUMN_CANVAS_DEFAULT_STORAGE_KEY,
  createLocalStorageColumnCanvasLayoutPersistence,
  normalizeColumnCanvasLayout,
  type ColumnCanvasColumnLayout,
  type ColumnCanvasLayoutV1,
  type ColumnCanvasLayoutV2,
  type ColumnCanvasLayout,
  type ColumnCanvasPairSplit,
  type ColumnCanvasLayoutChangeSource,
  type ColumnCanvasLayoutChangeEvent,
  type ColumnCanvasLayoutPersistence,
  type ColumnCanvasPersistenceErrorEvent,
} from "./column-canvas-persistence.js";

export {
  allocateColumnCanvasPair,
  allocateColumnCanvasWidth,
  type ColumnCanvasPairAllocation,
  type ColumnCanvasWidthBounds,
} from "./column-canvas-layout.js";

export type {
  ColumnCanvasDisplayMode,
  ColumnCanvasResolvedDisplayMode,
} from "./column-canvas-types.js";

export {
  useColumnCanvas,
  useColumnCanvasContext,
  type ColumnCanvasContext,
  type ColumnCanvasResizeBehavior,
} from "./context.svelte.js";

export {
  useColumnCanvasColumn,
  type ColumnCanvasColumnContext,
} from "./column-canvas-column-context.svelte.js";

export {
  columnCanvasTokenNames,
  type ColumnCanvasToken,
} from "./column-canvas.tokens.js";
