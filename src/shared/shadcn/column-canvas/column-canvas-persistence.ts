export const COLUMN_CANVAS_LAYOUT_VERSION = 1 as const;
export const COLUMN_CANVAS_DEFAULT_STORAGE_KEY =
  "@lapismd/design-core/column-canvas-layout";

export interface ColumnCanvasColumnLayout {
  collapsed: boolean;
  /** When omitted (older snapshots), treated as open. */
  closed?: boolean;
  width?: number;
}

export interface ColumnCanvasLayoutV1 {
  version: typeof COLUMN_CANVAS_LAYOUT_VERSION;
  columns: Record<string, ColumnCanvasColumnLayout>;
}

export type ColumnCanvasLayoutChangeSource =
  | "collapse"
  | "close"
  | "resize"
  | "reset-width"
  | "register"
  | "ensure";

export interface ColumnCanvasLayoutChangeEvent {
  source: ColumnCanvasLayoutChangeSource;
  columnId: string;
}

export interface ColumnCanvasLayoutPersistence {
  load(): Promise<unknown | null>;
  save(
    layout: ColumnCanvasLayoutV1,
    event: ColumnCanvasLayoutChangeEvent,
  ): Promise<void>;
}

export interface ColumnCanvasPersistenceErrorEvent {
  operation: "load" | "save";
  error: unknown;
}

/**
 * Browser storage adapter for Column Canvas layout (widths + collapse).
 * Pass a Storage implementation in tests or non-window contexts.
 */
export function createLocalStorageColumnCanvasLayoutPersistence(
  key = COLUMN_CANVAS_DEFAULT_STORAGE_KEY,
  storage?: Storage,
): ColumnCanvasLayoutPersistence {
  const resolveStorage = (): Storage => {
    const resolved = storage ?? globalThis.localStorage;
    if (!resolved) {
      throw new Error("Column Canvas localStorage is not available.");
    }
    return resolved;
  };

  return {
    async load() {
      const value = resolveStorage().getItem(key);
      return value ? (JSON.parse(value) as unknown) : null;
    },
    async save(layout) {
      resolveStorage().setItem(key, JSON.stringify(layout));
    },
  };
}

export function normalizeColumnCanvasLayout(
  value: unknown,
): Map<string, ColumnCanvasColumnLayout> {
  const columns = new Map<string, ColumnCanvasColumnLayout>();
  if (!isRecord(value) || value.version !== COLUMN_CANVAS_LAYOUT_VERSION) {
    return columns;
  }
  if (!isRecord(value.columns)) return columns;

  for (const [id, column] of Object.entries(value.columns)) {
    if (!id || !isRecord(column) || typeof column.collapsed !== "boolean") {
      continue;
    }
    columns.set(id, {
      collapsed: column.collapsed,
      ...(typeof column.closed === "boolean" ? { closed: column.closed } : {}),
      ...(typeof column.width === "number" && Number.isFinite(column.width)
        ? { width: column.width }
        : {}),
    });
  }
  return columns;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
