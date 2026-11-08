import type { Snippet } from "svelte";

/**
 * Generic kanban data contracts. Consumers (for example a bases view or a
 * tasks planner) map their own domain records onto these shapes; the board
 * never reaches back into consumer state.
 */

/** Stamp painted on the card mini surface and the detail page (e.g. "Done"). */
export interface KanbanCardStamp {
  /** Stamp heading text, e.g. "Done" or "Not Now". */
  label: string;
  /** Visual tone selecting the stamp border colour. */
  tone: "done" | "not-now";
  /** ISO or pre-formatted date text rendered under the label. */
  date?: string | null;
  /** Small caption line, e.g. "Completed" or "by System". */
  caption?: string | null;
}

/** Optional card footer counters rendered beside the meta grid. */
export interface KanbanCardCounters {
  /** Lightning-bolt counter value. */
  zap?: number;
  /** Comment counter value. */
  comments?: number;
}

/** Subtask progress rendered as a check counter on the card and detail. */
export interface KanbanCardProgress {
  done: number;
  total: number;
}

/** One card on the board. All presentational fields except id/title/color are optional. */
export interface KanbanCardData {
  /** Stable card identifier used for keys, selection, drag data, and callbacks. */
  id: string;
  /** Card title rendered in the card body and the detail heading. */
  title: string;
  /** CSS colour value driving the card's `--card-color` paint. */
  color: string;
  /** Short consumer-formatted description rendered beneath the title. */
  summary?: string | null;
  /** Generic metadata; an explicit empty array suppresses legacy meta cells. */
  metadata?: KanbanCardMetadata[];
  /** Generic highlight, independent of completion stamps and date semantics. */
  badge?: KanbanCardBadge | null;
  /** Overrides the uppercase tab label at the top of the card; defaults to the title. */
  tabLabel?: string | null;
  /** Tag badges rendered beside the tab label. */
  tags?: string[];
  /** Shows the pin corner on the card and stacks it in the board's pinned corner. */
  pinned?: boolean;
  /** Applies the golden-ticket paint on the card and detail page. */
  golden?: boolean;
  /** Subtask progress; omitted or null hides the check counter. */
  progress?: KanbanCardProgress | null;
  /** ISO or pre-formatted creation date for the "Added" meta cell. */
  createdAt?: string | null;
  /** ISO or pre-formatted update date for the refresh meta cell. */
  updatedAt?: string | null;
  /** Link text taking precedence over `statusText` in the third meta cell. */
  linkText?: string | null;
  /** Status text for the third meta cell and the detail footer. */
  statusText?: string | null;
  /** Priority text for the fourth meta cell; falls back to "No priority". */
  priorityText?: string | null;
  /** Optional footer counters; omitted hides the counter cluster. */
  counters?: KanbanCardCounters | null;
  /** Stamp shown mini on the card (not-now tone) and full on the detail page. */
  stamp?: KanbanCardStamp | null;
  /** Closure hint rendered under the detail notch (e.g. an auto-move message). */
  closureMessage?: string | null;
}

/** One column (lane) on the board. */
export interface KanbanColumnData {
  /** Stable column identifier used for keys, drag data, and callbacks. */
  id: string;
  /** Column title rendered in the header pill, collapsed rail, and dialogs. */
  label: string;
  /** CSS colour value driving the column's `--column-color` paint. */
  color: string;
  /** Locked columns cannot collapse (legacy: the Maybe lane). */
  locked?: boolean;
  /** Primary column that stays expanded and anchors collapse behaviour. */
  primary?: boolean;
  /** Excluded from column reordering (legacy: Not Now / Maybe lanes). */
  isFixedPosition?: boolean;
  /** Completion lane: Mark as Done targets it and its button disables on it. */
  isCompleted?: boolean;
  /** Excluded from the initial auto-expand scan (legacy: non-workflow lanes). */
  excludeFromAutoExpand?: boolean;
  /** Ordered cards in this column. */
  cards: KanbanCardData[];
  /** Count before a consumer-owned column filter; omitted hides the total. */
  totalCount?: number;
}

/** A consumer-formatted field, with a stable property id and accessible label. */
export interface KanbanCardMetadata {
  id: string;
  label: string;
  value: string;
}

/** Values are display text; the generic family never parses a badge as a date. */
export interface KanbanCardBadge {
  label: string;
  value: string;
  /** Defaults to the card's accent. */
  color?: string;
}

export interface KanbanCardContext {
  card: KanbanCardData;
  columnId: string;
}

/** Optional presentation regions shared by board, detail, column and activity. */
export interface KanbanCardSnippets {
  body?: Snippet<[context: KanbanCardContext]>;
  tags?: Snippet<[context: KanbanCardContext]>;
  metadata?: Snippet<[context: KanbanCardContext]>;
  badge?: Snippet<[context: KanbanCardContext]>;
}

export interface KanbanActivityEntry extends KanbanCardContext {
  /** ISO timestamp or literal YYYY-MM-DD; missing/invalid values are undated. */
  date?: string | null;
}

export interface KanbanActivityDay {
  key: string;
  date: Date | null;
  entries: KanbanActivityEntry[];
}

/** Consumer-persisted column metadata written through the edit popover. */
export interface KanbanColumnMeta {
  title?: string;
  color?: string;
}

/** Context handed to the detail `body` snippet. */
export interface KanbanDetailBodyContext {
  /** The card the detail dialog currently shows. */
  card: KanbanCardData;
  /** Whether the body edit surface is active (E key / Edit button set this). */
  editing: boolean;
  /** Consumer hook to enter or leave body editing (mirrors `bind:editing`). */
  setEditing: (editing: boolean) => void;
}

/** Column picker entry for the detail stage navigation. */
export interface KanbanDetailColumnOption {
  id: string;
  label: string;
}
