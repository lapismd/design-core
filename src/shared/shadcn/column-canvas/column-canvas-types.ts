import type { Snippet } from "svelte";

export type ColumnCanvasDisplayMode = "auto" | "fixed" | "compact";

export type ColumnCanvasResolvedDisplayMode = "wide" | "compact" | "fixed";

export type ColumnCanvasColumnState = "expanded" | "collapsed" | "closed";

export type ColumnCanvasCollapsedRailContext = {
  /** Stable controller id for the collapsed column. */
  id: string;
  /** Accessible column title. */
  title: string;
  /** Optional consumer count passed to Column. */
  count: number | undefined;
  /** Restore the column to its expanded inline presentation. */
  expand: () => void;
};

export type ColumnCanvasToggleIcon = Snippet<[ColumnCanvasColumnState]>;
