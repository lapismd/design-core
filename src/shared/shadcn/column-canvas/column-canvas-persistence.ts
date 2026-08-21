export const COLUMN_CANVAS_LAYOUT_VERSION = 2 as const;
export const COLUMN_CANVAS_LAYOUT_V1_VERSION = 1 as const;
export const COLUMN_CANVAS_DEFAULT_STORAGE_KEY =
  "@lapismd/design-core/column-canvas-layout";

export interface ColumnCanvasColumnLayout {
  collapsed: boolean;
  /** When omitted (older snapshots), treated as open. */
  closed?: boolean;
  width?: number;
}

export interface ColumnCanvasLayoutV1 {
  version: typeof COLUMN_CANVAS_LAYOUT_V1_VERSION;
  columns: Record<string, ColumnCanvasColumnLayout>;
}

export interface ColumnCanvasPairSplit {
  leadingColumnId: string;
  trailingColumnId: string;
  /** Leading-column share of the pair's available width, from 0 to 1. */
  leadingFraction: number;
}

export interface ColumnCanvasLayoutV2 {
  version: typeof COLUMN_CANVAS_LAYOUT_VERSION;
  columns: Record<string, ColumnCanvasColumnLayout>;
  pairSplits: ColumnCanvasPairSplit[];
}

export type ColumnCanvasLayout = ColumnCanvasLayoutV2;

export interface NormalizedColumnCanvasLayout {
  columns: Map<string, ColumnCanvasColumnLayout>;
  pairSplits: ColumnCanvasPairSplit[];
}

export type ColumnCanvasLayoutChangeSource =
  | "collapse"
  | "close"
  | "resize"
  | "resize-pair"
  | "reset-pair"
  | "reset-width"
  | "register"
  | "ensure";

export interface ColumnCanvasLayoutChangeEvent {
  source: ColumnCanvasLayoutChangeSource;
  columnId: string;
  /** The other member affected by a paired resize or reset. */
  relatedColumnId?: string;
}

export interface ColumnCanvasLayoutPersistence {
  load(): Promise<unknown | null>;
  save(
    layout: ColumnCanvasLayout,
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
): NormalizedColumnCanvasLayout {
  const columns = new Map<string, ColumnCanvasColumnLayout>();
  const pairSplits: ColumnCanvasPairSplit[] = [];
  if (
    !isRecord(value) ||
    (value.version !== COLUMN_CANVAS_LAYOUT_VERSION &&
      value.version !== COLUMN_CANVAS_LAYOUT_V1_VERSION)
  ) {
    return { columns, pairSplits };
  }
  if (!isRecord(value.columns)) return { columns, pairSplits };

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

  if (
    value.version === COLUMN_CANVAS_LAYOUT_VERSION &&
    Array.isArray(value.pairSplits)
  ) {
    const seen = new Set<string>();
    for (const split of value.pairSplits) {
      if (
        !isRecord(split) ||
        typeof split.leadingColumnId !== "string" ||
        !split.leadingColumnId ||
        typeof split.trailingColumnId !== "string" ||
        !split.trailingColumnId ||
        split.leadingColumnId === split.trailingColumnId ||
        typeof split.leadingFraction !== "number" ||
        !Number.isFinite(split.leadingFraction) ||
        split.leadingFraction <= 0 ||
        split.leadingFraction >= 1
      ) {
        continue;
      }
      const key = pairSplitKey(split.leadingColumnId, split.trailingColumnId);
      if (seen.has(key)) continue;
      seen.add(key);
      pairSplits.push({
        leadingColumnId: split.leadingColumnId,
        trailingColumnId: split.trailingColumnId,
        leadingFraction: split.leadingFraction,
      });
    }
  }

  return { columns, pairSplits };
}

export function pairSplitKey(
  leadingColumnId: string,
  trailingColumnId: string,
): string {
  return JSON.stringify([leadingColumnId, trailingColumnId]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
