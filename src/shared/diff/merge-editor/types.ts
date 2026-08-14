import type { MergeMode } from "../core/merge/types.js";

export interface MergeResolvedChange {
  resolved: boolean;
  conflictCount: number;
  unresolvedConflictCount: number;
  content: string;
}

export type MergeEditorMode = MergeMode;
