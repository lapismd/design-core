import type { UnifiedDiffRow } from "../core/unified-diff.js";

export type FileDiffViewMode = "unified" | "split";

export interface FileDiffLineContext {
  path: string;
  lineNumber: number | null;
  variant: UnifiedDiffRow["variant"];
  text: string;
}

export interface FileDiffFile {
  path: string;
  oldText?: string | null;
  newText?: string | null;
  patch?: string;
  language?: string;
}

export interface FileDiffScrollTarget {
  path?: string;
  lineNumber: number;
  variant?: UnifiedDiffRow["variant"];
}
