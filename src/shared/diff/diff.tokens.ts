/**
 * Public Diff token names. Defaults live in `diff.tokens.css`.
 */
export const diffTokenNames = {
  fileGap: "--ui-diff-file-gap",
  fileSectionBorder: "--ui-diff-file-section-border",
  fileSectionSeparator: "--ui-diff-file-section-separator",
  fileSelectionOutlineOffset: "--ui-diff-file-selection-outline-offset",
  fileSelectionOutline: "--ui-diff-file-selection-outline",
  fileContentPaddingBottom: "--ui-diff-file-content-padding-bottom",
  fileSelectedHeader: "--ui-diff-file-selected-header",
  addedBackground: "--ui-diff-added-background",
  addedForeground: "--ui-diff-added-foreground",
  removedBackground: "--ui-diff-removed-background",
  removedForeground: "--ui-diff-removed-foreground",
  modifiedBackground: "--ui-diff-modified-background",
  conflictBackground: "--ui-diff-conflict-background",
  fileConflictBackground: "--ui-diff-file-conflict-background",
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
