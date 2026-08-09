import {
  COLUMN_CANVAS_LAYOUT_VERSION,
  normalizeColumnCanvasLayout,
  type ColumnCanvasColumnLayout,
  type ColumnCanvasLayoutChangeEvent,
  type ColumnCanvasLayoutChangeSource,
  type ColumnCanvasLayoutPersistence,
  type ColumnCanvasLayoutV1,
  type ColumnCanvasPersistenceErrorEvent,
} from "./column-canvas-persistence.js";

export const COLUMN_CANVAS_DEFAULT_MIN_WIDTH = 240;
export const COLUMN_CANVAS_DEFAULT_MAX_WIDTH = 760;
export const COLUMN_CANVAS_DEFAULT_TRAILING_SPACER_WIDTH = 640;

export type ColumnCanvasColumnConfig = {
  /** Initial expanded width in CSS pixels. */
  defaultWidth: number;
  minWidth?: number;
  maxWidth?: number;
  /** When true, Column renders a trailing resize handle. */
  resizable?: boolean;
  /** When true, Column can collapse to a rail via Toggle. */
  collapsible?: boolean;
  /** Initial collapsed state before persistence restore. */
  collapsed?: boolean;
};

type ColumnRuntimeState = {
  width: number;
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  resizable: boolean;
  collapsible: boolean;
  collapsed: boolean;
};

export type CreateColumnCanvasControllerOptions<
  TColumnId extends string = string,
> = {
  columns: Record<TColumnId, ColumnCanvasColumnConfig>;
  initialPath?: string[];
  trailingSpacerWidth?: number;
  persistence?: ColumnCanvasLayoutPersistence;
  saveDebounceMs?: number;
  onPathChange?: (path: string[]) => void;
  onLayoutChange?: (
    layout: ColumnCanvasLayoutV1,
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

  #columns = $state<Record<string, ColumnRuntimeState>>({});
  #onPathChange: ((path: string[]) => void) | undefined;
  #onLayoutChange:
    | ((
        layout: ColumnCanvasLayoutV1,
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
  #restorePromise: Promise<void> | null = null;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #pendingSaveEvent: ColumnCanvasLayoutChangeEvent | null = null;
  #saveChain: Promise<void> = Promise.resolve();

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

  // —— Layout ————————————————————————————————————————————————

  hasColumn = (id: string): boolean => {
    return this.#columns[id] !== undefined;
  };

  getWidth = (id: string): number => {
    return this.#requireColumn(id).width;
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

  isCollapsible = (id: string): boolean => {
    return this.#requireColumn(id).collapsible;
  };

  isResizable = (id: string): boolean => {
    return this.#requireColumn(id).resizable;
  };

  getMinWidth = (id: string): number => {
    return this.#requireColumn(id).minWidth;
  };

  getMaxWidth = (id: string): number => {
    return this.#requireColumn(id).maxWidth;
  };

  collapse = (id: string): void => {
    this.setCollapsed(id, true);
  };

  expand = (id: string): void => {
    this.setCollapsed(id, false);
  };

  toggle = (id: string): void => {
    const column = this.#requireColumn(id);
    if (!column.collapsible) return;
    this.setCollapsed(id, !column.collapsed);
  };

  setCollapsed = (id: string, collapsed: boolean): void => {
    const column = this.#requireColumn(id);
    if (!column.collapsible) return;
    if (column.collapsed === collapsed) return;
    this.#patchColumn(id, { collapsed });
    this.#layoutChanged(id, "collapse");
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
      const next = {
        ...existing,
        minWidth: config.minWidth ?? existing.minWidth,
        maxWidth: config.maxWidth ?? existing.maxWidth,
        resizable: config.resizable ?? existing.resizable,
        collapsible: config.collapsible ?? existing.collapsible,
        defaultWidth: config.defaultWidth,
      };
      if (next.minWidth > next.maxWidth) {
        throw new RangeError(
          "Column Canvas minWidth must be less than or equal to maxWidth.",
        );
      }
      this.#patchColumn(columnId, next);
      return;
    }

    const runtime = createRuntimeState(config);
    const restored = this.#restoredColumns.get(columnId);
    if (restored) {
      runtime.collapsed = runtime.collapsible ? restored.collapsed : false;
      if (restored.width !== undefined) {
        runtime.width = clampWidth(
          restored.width,
          runtime.minWidth,
          runtime.maxWidth,
        );
      }
    }

    this.#columns = { ...this.#columns, [columnId]: runtime };
    this.#layoutChanged(columnId, "ensure");
  };

  getLayout = (): ColumnCanvasLayoutV1 => {
    const columns: Record<string, ColumnCanvasColumnLayout> = {};
    for (const [id, column] of Object.entries(this.#columns)) {
      columns[id] = {
        collapsed: column.collapsed,
        width: column.width,
      };
    }
    return {
      version: COLUMN_CANVAS_LAYOUT_VERSION,
      columns,
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
    await this.flushSave();
  }

  #setPath(next: string[]): void {
    this.path = next;
    this.#onPathChange?.([...next]);
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

  async #restoreLayout(): Promise<void> {
    this.#hydrating = true;
    try {
      this.#restoredColumns = normalizeColumnCanvasLayout(
        await this.#persistence?.load(),
      );
      const next = { ...this.#columns };
      for (const [id, column] of Object.entries(next)) {
        const restored = this.#restoredColumns.get(id);
        if (!restored) continue;
        next[id] = {
          ...column,
          collapsed: column.collapsible ? restored.collapsed : false,
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
  ): void {
    if (this.#hydrating || !this.layoutReady) return;
    this.#pendingSaveEvent = { source, columnId };
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
  const maxWidth = Math.round(
    config.maxWidth ?? COLUMN_CANVAS_DEFAULT_MAX_WIDTH,
  );
  if (minWidth > maxWidth) {
    throw new RangeError(
      "Column Canvas minWidth must be less than or equal to maxWidth.",
    );
  }
  const defaultWidth = clampWidth(config.defaultWidth, minWidth, maxWidth);
  return {
    width: defaultWidth,
    defaultWidth,
    minWidth,
    maxWidth,
    resizable: config.resizable ?? false,
    collapsible: config.collapsible ?? false,
    collapsed: Boolean(config.collapsed && (config.collapsible ?? false)),
  };
}

function clampWidth(width: number, minWidth: number, maxWidth: number): number {
  const finite = Number.isFinite(width) ? width : minWidth;
  return Math.min(maxWidth, Math.max(minWidth, Math.round(finite)));
}
