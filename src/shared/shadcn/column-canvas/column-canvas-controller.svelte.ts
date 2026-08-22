import {
  COLUMN_CANVAS_LAYOUT_VERSION,
  normalizeColumnCanvasLayout,
  pairSplitKey,
  type ColumnCanvasColumnLayout,
  type ColumnCanvasLayout,
  type ColumnCanvasLayoutChangeEvent,
  type ColumnCanvasLayoutChangeSource,
  type ColumnCanvasLayoutPersistence,
  type ColumnCanvasPairSplit,
  type ColumnCanvasPersistenceErrorEvent,
} from "./column-canvas-persistence.js";
import type { ColumnCanvasColumnState } from "./column-canvas-types.js";

export const COLUMN_CANVAS_DEFAULT_MIN_WIDTH = 240;
export const COLUMN_CANVAS_DEFAULT_MAX_WIDTH = 760;
export const COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH = 0;

export type ColumnCanvasColumnConfig = {
  /** Initial expanded width in CSS pixels. */
  defaultWidth: number;
  minWidth?: number;
  /** Maximum durable width, or `null` for no upper bound. */
  maxWidth?: number | null;
  /**
   * Minimum `path.length` required before the column is path-visible.
   * Omit or `0` for a root lane that is always path-eligible.
   */
  pathLevel?: number;
  /** When true, Column renders a trailing resize handle. */
  resizable?: boolean;
  /** When true, Column can collapse to a rail via Toggle. */
  collapsible?: boolean;
  /** When true, Close can remove the column from the canvas. */
  closeable?: boolean;
  /**
   * When true (default for closeable columns), `select` at
   * `pathLevel - 1` reopens this column if it was closed.
   */
  openOnSelect?: boolean;
  /** Initial collapsed state before persistence restore. */
  collapsed?: boolean;
  /** Initial closed state before persistence restore. */
  closed?: boolean;
};

type ColumnRuntimeState = {
  width: number;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number | null;
  pathLevel: number;
  resizable: boolean;
  collapsible: boolean;
  closeable: boolean;
  openOnSelect: boolean;
  collapsed: boolean;
  closed: boolean;
  previewed: boolean;
};

export type CreateColumnCanvasControllerOptions<
  TColumnId extends string = string,
> = {
  columns: Record<TColumnId, ColumnCanvasColumnConfig>;
  initialPath?: string[];
  /** Optional extra space after the final column. Defaults to `0`. */
  trailingSpacerWidth?: number;
  persistence?: ColumnCanvasLayoutPersistence;
  saveDebounceMs?: number;
  onPathChange?: (path: string[]) => void;
  onLayoutChange?: (
    layout: ColumnCanvasLayout,
    event: ColumnCanvasLayoutChangeEvent,
  ) => void;
  onPersistenceError?: (event: ColumnCanvasPersistenceErrorEvent) => void;
};

/**
 * App-owned controller for Column Canvas path selection and durable column
 * layout (widths + collapse). Do not destructure reactive fields.
 *
 * Column-id generics are applied at `createColumnCanvasController` for config
 * autocomplete; the runtime controller is non-generic so Root/context accept it.
 */
export class ColumnCanvasController {
  path = $state<string[]>([]);
  readonly visibleDepth = $derived(this.path.length + 1);
  trailingSpacerWidth = $state(COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH);
  layoutReady = $state(false);
  get structuralRevision(): number {
    return this.#structuralRevision;
  }

  #columns = $state<Record<string, ColumnRuntimeState>>({});
  #structuralRevision = $state(0);
  #onPathChange: ((path: string[]) => void) | undefined;
  #onLayoutChange:
    | ((
        layout: ColumnCanvasLayout,
        event: ColumnCanvasLayoutChangeEvent,
      ) => void)
    | undefined;
  #onPersistenceError:
    | ((event: ColumnCanvasPersistenceErrorEvent) => void)
    | undefined;
  #persistence?: ColumnCanvasLayoutPersistence;
  #saveDebounceMs: number;
  #hydrating = false;
  #restoredColumns = new Map<string, ColumnCanvasColumnLayout>();
  #pairSplits = $state<Record<string, ColumnCanvasPairSplit>>({});
  #restorePromise: Promise<void> | null = null;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #pendingSaveEvent: ColumnCanvasLayoutChangeEvent | null = null;
  #saveChain: Promise<void> = Promise.resolve();
  #previewTimers = new Map<string, ReturnType<typeof setTimeout>>();
  #previewDismissTimers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(options: CreateColumnCanvasControllerOptions) {
    this.path = options.initialPath ? [...options.initialPath] : [];
    this.trailingSpacerWidth =
      options.trailingSpacerWidth ??
      COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH;
    this.#onPathChange = options.onPathChange;
    this.#onLayoutChange = options.onLayoutChange;
    this.#onPersistenceError = options.onPersistenceError;
    this.#persistence = options.persistence;
    this.#saveDebounceMs = Math.max(0, options.saveDebounceMs ?? 200);

    const next: Record<string, ColumnRuntimeState> = {};
    for (const [id, config] of Object.entries(options.columns)) {
      next[id] = createRuntimeState(config);
    }
    this.#columns = next;
    this.layoutReady = !this.#persistence;
  }

  // —— Path (Miller selection) ————————————————————————————————

  select = (level: number, key: string): void => {
    if (level < 0) return;
    if (this.path[level] === key) {
      this.clearFrom(level);
      return;
    }
    this.#setPath([...this.path.slice(0, level), key]);
    this.#openColumnsForSelect(level);
  };

  clearFrom = (level: number): void => {
    if (level < 0) {
      this.clear();
      return;
    }
    if (level >= this.path.length) return;
    this.#setPath(this.path.slice(0, level));
  };

  clear = (): void => {
    if (this.path.length === 0) return;
    this.#setPath([]);
  };

  isSelected = (level: number, key: string): boolean => {
    return this.path[level] === key;
  };

  /** Path key at `level`, or `undefined` when that depth is unset. */
  pathAt = (level: number): string | undefined => {
    return this.path[level];
  };

  getPathLevel = (id: string): number => {
    return this.#requireColumn(id).pathLevel;
  };

  /** True when `path.length` meets the column's configured `pathLevel`. */
  isPathVisible = (id: string): boolean => {
    return this.path.length >= this.getPathLevel(id);
  };

  /**
   * True when the column should render chrome: path-eligible and not closed.
   * Collapse is handled separately once visible.
   */
  isColumnVisible = (id: string): boolean => {
    return this.isPathVisible(id) && !this.isClosed(id);
  };

  // —— Layout ————————————————————————————————————————————————

  hasColumn = (id: string): boolean => {
    return this.#columns[id] !== undefined;
  };

  getWidth = (id: string): number => {
    return this.#requireColumn(id).width;
  };

  /** Initial width used when resetting a resized column. */
  getDefaultWidth = (id: string): number => {
    return this.#requireColumn(id).defaultWidth;
  };

  setWidth = (id: string, width: number): void => {
    const column = this.#requireColumn(id);
    const next = clampWidth(width, column.minWidth, column.maxWidth);
    if (column.width === next) return;
    this.#patchColumn(id, { width: next });
    this.#layoutChanged(id, "resize");
  };

  resetWidth = (id: string): void => {
    const column = this.#requireColumn(id);
    if (column.width === column.defaultWidth) return;
    this.#patchColumn(id, { width: column.defaultWidth });
    this.#layoutChanged(id, "reset-width");
  };

  isCollapsed = (id: string): boolean => {
    return this.#requireColumn(id).collapsed;
  };

  isClosed = (id: string): boolean => {
    return this.#requireColumn(id).closed;
  };

  getState = (id: string): ColumnCanvasColumnState => {
    const column = this.#requireColumn(id);
    if (column.closed) return "closed";
    return column.collapsed ? "collapsed" : "expanded";
  };

  isPreviewed = (id: string): boolean => {
    return this.#requireColumn(id).previewed;
  };

  isCollapsible = (id: string): boolean => {
    return this.#requireColumn(id).collapsible;
  };

  isCloseable = (id: string): boolean => {
    return this.#requireColumn(id).closeable;
  };

  isResizable = (id: string): boolean => {
    return this.#requireColumn(id).resizable;
  };

  getMinWidth = (id: string): number => {
    return this.#requireColumn(id).minWidth;
  };

  getMaxWidth = (id: string): number | null => {
    return this.#requireColumn(id).maxWidth;
  };

  getPairSplit = (
    leadingColumnId: string,
    trailingColumnId: string,
  ): number | undefined => {
    return this.#pairSplits[pairSplitKey(leadingColumnId, trailingColumnId)]
      ?.leadingFraction;
  };

  setPairSplit = (
    leadingColumnId: string,
    trailingColumnId: string,
    leadingFraction: number,
  ): void => {
    this.#requireColumn(leadingColumnId);
    this.#requireColumn(trailingColumnId);
    if (
      leadingColumnId === trailingColumnId ||
      !Number.isFinite(leadingFraction)
    ) {
      return;
    }
    const nextFraction = Math.min(
      0.999_999,
      Math.max(0.000_001, leadingFraction),
    );
    const key = pairSplitKey(leadingColumnId, trailingColumnId);
    const current = this.#pairSplits[key];
    if (
      current &&
      Math.abs(current.leadingFraction - nextFraction) < Number.EPSILON
    ) {
      return;
    }
    this.#pairSplits = {
      ...this.#pairSplits,
      [key]: {
        leadingColumnId,
        trailingColumnId,
        leadingFraction: nextFraction,
      },
    };
    this.#layoutChanged(leadingColumnId, "resize-pair", trailingColumnId);
  };

  resetPairSplit = (
    leadingColumnId: string,
    trailingColumnId: string,
  ): void => {
    const key = pairSplitKey(leadingColumnId, trailingColumnId);
    if (!this.#pairSplits[key]) return;
    const next = { ...this.#pairSplits };
    delete next[key];
    this.#pairSplits = next;
    this.#layoutChanged(leadingColumnId, "reset-pair", trailingColumnId);
  };

  collapse = (id: string): void => {
    this.setCollapsed(id, true);
  };

  expand = (id: string): void => {
    this.setCollapsed(id, false);
  };

  toggle = (id: string): void => {
    const column = this.#requireColumn(id);
    if (column.closed) {
      this.open(id);
      return;
    }
    if (!column.collapsible) return;
    this.setCollapsed(id, !column.collapsed);
  };

  setCollapsed = (id: string, collapsed: boolean): void => {
    const column = this.#requireColumn(id);
    if (!column.collapsible) return;
    this.dismissPreview(id);
    if (column.collapsed === collapsed) return;
    this.#patchColumn(id, { collapsed });
    this.#structuralLayoutChanged();
    this.#layoutChanged(id, "collapse");
  };

  /** Remove a closeable column from the canvas (keeps registered state). */
  close = (id: string): void => {
    this.setClosed(id, true);
  };

  /** Show a previously closed column again. */
  open = (id: string): void => {
    this.setClosed(id, false);
  };

  setClosed = (id: string, closed: boolean): void => {
    const column = this.#requireColumn(id);
    if (!column.closeable) return;
    this.dismissPreview(id);
    if (column.closed === closed) return;
    this.#patchColumn(id, {
      closed,
      // Opening restores an expanded column; closing clears collapse chrome.
      ...(closed ? { collapsed: false } : {}),
    });
    this.#structuralLayoutChanged();
    this.#layoutChanged(id, "close");
  };

  /** Preview a collapsed or closed column without changing durable layout. */
  preview = (id: string): void => {
    const column = this.#requireColumn(id);
    this.#clearPreviewTimer(id);
    this.#clearPreviewDismissTimer(id);
    if ((!column.collapsed && !column.closed) || column.previewed) return;
    this.#patchColumn(id, { previewed: true });
  };

  /** Preview after a consumer-owned hover delay. */
  schedulePreview = (id: string, delay = 600): void => {
    const column = this.#requireColumn(id);
    this.#clearPreviewTimer(id);
    this.#clearPreviewDismissTimer(id);
    if (!column.collapsed && !column.closed) return;
    this.#previewTimers.set(
      id,
      setTimeout(
        () => {
          this.#previewTimers.delete(id);
          this.preview(id);
        },
        Math.max(0, delay),
      ),
    );
  };

  /** Keep a preview open while pointer or focus enters owned content. */
  keepPreview = (id: string): void => {
    this.#requireColumn(id);
    this.#clearPreviewDismissTimer(id);
  };

  /** Dismiss a preview after a short pointer/focus handoff grace period. */
  schedulePreviewDismiss = (id: string, delay = 120): void => {
    const column = this.#requireColumn(id);
    this.#clearPreviewTimer(id);
    this.#clearPreviewDismissTimer(id);
    if (!column.previewed) return;
    this.#previewDismissTimers.set(
      id,
      setTimeout(
        () => {
          this.#previewDismissTimers.delete(id);
          this.dismissPreview(id);
        },
        Math.max(0, delay),
      ),
    );
  };

  /** Clear pending and open transient preview state immediately. */
  dismissPreview = (id: string): void => {
    const column = this.#requireColumn(id);
    this.#clearPreviewTimer(id);
    this.#clearPreviewDismissTimer(id);
    if (!column.previewed) return;
    this.#patchColumn(id, { previewed: false });
  };

  /**
   * Register or update a column at runtime (dynamic stack lanes).
   * Applies any previously restored persistence snapshot for `id`.
   */
  ensureColumn = (id: string, config: ColumnCanvasColumnConfig): void => {
    const columnId = String(id).trim();
    if (!columnId) {
      throw new TypeError("Column Canvas column ids must not be empty.");
    }

    const existing = this.#columns[columnId];
    if (existing) {
      const closeable = config.closeable ?? existing.closeable;
      const next = {
        ...existing,
        minWidth: config.minWidth ?? existing.minWidth,
        maxWidth:
          config.maxWidth === undefined ? existing.maxWidth : config.maxWidth,
        pathLevel:
          config.pathLevel === undefined
            ? existing.pathLevel
            : normalizePathLevel(config.pathLevel),
        resizable: config.resizable ?? existing.resizable,
        collapsible: config.collapsible ?? existing.collapsible,
        closeable,
        openOnSelect:
          config.openOnSelect ??
          (config.closeable !== undefined ? closeable : existing.openOnSelect),
        defaultWidth: config.defaultWidth,
      };
      if (next.maxWidth !== null && next.minWidth > next.maxWidth) {
        throw new RangeError(
          "Column Canvas minWidth must be less than or equal to maxWidth.",
        );
      }
      this.#patchColumn(columnId, next);
      this.#structuralLayoutChanged();
      return;
    }

    const runtime = createRuntimeState(config);
    const restored = this.#restoredColumns.get(columnId);
    if (restored) {
      runtime.collapsed = runtime.collapsible ? restored.collapsed : false;
      runtime.closed = runtime.closeable ? Boolean(restored.closed) : false;
      if (restored.width !== undefined) {
        runtime.width = clampWidth(
          restored.width,
          runtime.minWidth,
          runtime.maxWidth,
        );
      }
    }

    this.#columns = { ...this.#columns, [columnId]: runtime };
    this.#structuralLayoutChanged();
    this.#layoutChanged(columnId, "ensure");
  };

  getLayout = (): ColumnCanvasLayout => {
    const columns: Record<string, ColumnCanvasColumnLayout> = {};
    for (const [id, column] of Object.entries(this.#columns)) {
      columns[id] = {
        collapsed: column.collapsed,
        closed: column.closed,
        width: column.width,
      };
    }
    return {
      version: COLUMN_CANVAS_LAYOUT_VERSION,
      columns,
      pairSplits: Object.values(this.#pairSplits),
    };
  };

  /** Restore the configured persistence adapter once. */
  async restoreLayout(): Promise<void> {
    if (this.layoutReady) return;
    if (this.#restorePromise) return this.#restorePromise;
    this.#restorePromise = this.#restoreLayout();
    try {
      await this.#restorePromise;
    } finally {
      this.#restorePromise = null;
    }
  }

  async flushSave(): Promise<void> {
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
    }
    const event = this.#pendingSaveEvent;
    this.#pendingSaveEvent = null;
    if (!event) return this.#saveChain;

    const snapshot = this.getLayout();
    this.#onLayoutChange?.(snapshot, event);
    if (!this.#persistence) return this.#saveChain;

    this.#saveChain = this.#saveChain.then(async () => {
      try {
        await this.#persistence?.save(snapshot, event);
      } catch (error) {
        this.#onPersistenceError?.({ operation: "save", error });
      }
    });
    return this.#saveChain;
  }

  async dispose(): Promise<void> {
    for (const id of Object.keys(this.#columns)) this.dismissPreview(id);
    await this.flushSave();
  }

  #clearPreviewTimer(id: string): void {
    const timer = this.#previewTimers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.#previewTimers.delete(id);
  }

  #clearPreviewDismissTimer(id: string): void {
    const timer = this.#previewDismissTimers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.#previewDismissTimers.delete(id);
  }

  #setPath(next: string[]): void {
    this.path = next;
    this.#onPathChange?.([...next]);
  }

  /** Reopen closeable columns that should appear after selecting at `level`. */
  #openColumnsForSelect(level: number): void {
    const targetPathLevel = level + 1;
    for (const [id, column] of Object.entries(this.#columns)) {
      if (
        column.closeable &&
        column.openOnSelect &&
        column.pathLevel === targetPathLevel &&
        column.closed
      ) {
        this.setClosed(id, false);
      }
    }
  }

  #requireColumn(id: string): ColumnRuntimeState {
    const column = this.#columns[String(id)];
    if (!column) {
      throw new Error(
        `Column Canvas column "${id}" is not registered. Pass it in createColumnCanvasController({ columns }) or call ensureColumn().`,
      );
    }
    return column;
  }

  #patchColumn(id: string, patch: Partial<ColumnRuntimeState>): void {
    const current = this.#requireColumn(id);
    this.#columns = {
      ...this.#columns,
      [String(id)]: { ...current, ...patch },
    };
  }

  #structuralLayoutChanged(): void {
    this.#structuralRevision += 1;
  }

  async #restoreLayout(): Promise<void> {
    this.#hydrating = true;
    try {
      const restored = normalizeColumnCanvasLayout(
        await this.#persistence?.load(),
      );
      this.#restoredColumns = restored.columns;
      this.#pairSplits = Object.fromEntries(
        restored.pairSplits.map((split) => [
          pairSplitKey(split.leadingColumnId, split.trailingColumnId),
          split,
        ]),
      );
      const next = { ...this.#columns };
      for (const [id, column] of Object.entries(next)) {
        const restored = this.#restoredColumns.get(id);
        if (!restored) continue;
        next[id] = {
          ...column,
          collapsed: column.collapsible ? restored.collapsed : false,
          closed: column.closeable ? Boolean(restored.closed) : false,
          width:
            restored.width === undefined
              ? column.width
              : clampWidth(restored.width, column.minWidth, column.maxWidth),
        };
      }
      this.#columns = next;
    } catch (error) {
      this.#onPersistenceError?.({ operation: "load", error });
    } finally {
      this.#hydrating = false;
      this.layoutReady = true;
    }
  }

  #layoutChanged(
    columnId: string,
    source: ColumnCanvasLayoutChangeSource,
    relatedColumnId?: string,
  ): void {
    if (this.#hydrating || !this.layoutReady) return;
    this.#pendingSaveEvent = { source, columnId, relatedColumnId };
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null;
      void this.flushSave();
    }, this.#saveDebounceMs);
  }
}

export function createColumnCanvasController<TColumnId extends string>(
  options: CreateColumnCanvasControllerOptions<TColumnId>,
): ColumnCanvasController {
  return new ColumnCanvasController(options);
}

function createRuntimeState(
  config: ColumnCanvasColumnConfig,
): ColumnRuntimeState {
  const minWidth = Math.round(
    config.minWidth ?? COLUMN_CANVAS_DEFAULT_MIN_WIDTH,
  );
  const maxWidth =
    config.maxWidth === null
      ? null
      : Math.round(config.maxWidth ?? COLUMN_CANVAS_DEFAULT_MAX_WIDTH);
  if (maxWidth !== null && minWidth > maxWidth) {
    throw new RangeError(
      "Column Canvas minWidth must be less than or equal to maxWidth.",
    );
  }
  const defaultWidth = clampWidth(config.defaultWidth, minWidth, maxWidth);
  const closeable = config.closeable ?? false;
  const collapsible = config.collapsible ?? false;
  const pathLevel = normalizePathLevel(config.pathLevel);
  return {
    width: defaultWidth,
    defaultWidth,
    minWidth,
    maxWidth,
    pathLevel,
    resizable: config.resizable ?? false,
    collapsible,
    closeable,
    openOnSelect: config.openOnSelect ?? closeable,
    collapsed: Boolean(config.collapsed && collapsible && !config.closed),
    closed: Boolean(config.closed && closeable),
    previewed: false,
  };
}

function normalizePathLevel(pathLevel: number | undefined): number {
  if (pathLevel === undefined) return 0;
  if (!Number.isFinite(pathLevel)) return 0;
  return Math.max(0, Math.round(pathLevel));
}

function clampWidth(
  width: number,
  minWidth: number,
  maxWidth: number | null,
): number {
  const finite = Number.isFinite(width) ? width : minWidth;
  const rounded = Math.max(minWidth, Math.round(finite));
  return maxWidth === null ? rounded : Math.min(maxWidth, rounded);
}
