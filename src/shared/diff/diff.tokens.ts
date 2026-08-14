/**
 * Public Diff token names. Defaults live in `diff.tokens.css`.
 */
export const diffTokenNames = {
  addedBackground: "--ui-diff-added-background",
  addedForeground: "--ui-diff-added-foreground",
  removedBackground: "--ui-diff-removed-background",
  removedForeground: "--ui-diff-removed-foreground",
  modifiedBackground: "--ui-diff-modified-background",
  conflictBackground: "--ui-diff-conflict-background",
  resolvedBackground: "--ui-diff-resolved-background",
  segmentAdded: "--ui-diff-segment-added",
  segmentRemoved: "--ui-diff-segment-removed",
  gutter: "--ui-diff-gutter",
  mono: "--ui-diff-mono",
  rowHover: "--ui-diff-row-hover",
  selected: "--ui-diff-selected",
  border: "--ui-diff-border",
  statAdded: "--ui-diff-stat-added",
  statRemoved: "--ui-diff-stat-removed",
} as const;

export type DiffToken = (typeof diffTokenNames)[keyof typeof diffTokenNames];
