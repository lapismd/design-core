# Diff

Diff contracts keep change-set listing, file comparison, and merge presentation separate from version-control commands, file I/O, and review policy. Headless tree, unified-diff, and merge models live under `src/shared/diff/core`.

## Public surface coverage

| Surface                | Public boundary             | Requirement |
| ---------------------- | --------------------------- | ----------- |
| Shared Diff invariants | Diff layer                  | DC-DIFF-001 |
| File Listing           | `@lapismd/design-core/diff` | DC-DIFF-002 |
| File Diff              | `@lapismd/design-core/diff` | DC-DIFF-003 |
| Merge Editor           | `@lapismd/design-core/diff` | DC-DIFF-004 |
| Diff Guidance          | Documentation surface       | DC-DIFF-005 |
| File Change Stats      | `@lapismd/design-core/diff` | DC-DIFF-006 |
| Diff wrap and frame    | `@lapismd/design-core/diff` | DC-DIFF-007 |
| Diff scroll surfaces   | `@lapismd/design-core/diff` | DC-DIFF-008 |

## DC-DIFF-001 — Shared Diff invariants

**Requirement.** The Shared Diff invariants family MUST keep file listing, file comparison, and merge presentation independent of version-control commands, file I/O, and review policy.

### Acceptance details

- The public boundary is Diff layer.
- Diff production sources MUST import only shadcn primitives and Diff-owned modules.
- Hosts MUST supply file contents, selection persistence, and merge resolution policy.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-002 — File Listing

**Requirement.** The File Listing family MUST present a host-owned change-set as a controlled list, folder tree, or compacted package tree without performing filesystem operations.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- Selection and view mode MUST remain host-controllable through `selectedPath`, `mode`, and `FileListingViewModeToggle`, and selected rows and active view-mode toggles MUST use the shared `--ui-diff-selected` fill.
- Row leading, label, and meta content MUST be host-replaceable snippets; default file-row meta MUST render File Change Stats from `additions` and `deletions`.
- The catalog MUST demonstrate list, folder tree, package tree, empty, and selected states without introducing a second runtime contract.

## DC-DIFF-003 — File Diff

**Requirement.** The File Diff family MUST render unified or split textual changes from two texts or a unified patch without owning comments or version-control transport.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- Unchanged context MUST collapse with incremental expand controls.
- Line identity MUST be exposed through `data-diff-line-*` or a `lineAccessory` snippet, and split gutters MUST show old-file numbers on the left and new-file numbers on the right, each aligned with its row.
- The catalog MUST demonstrate unified, split, collapsed-context, binary, empty, multi-file composer, and wrap-text states without introducing a second runtime contract.

## DC-DIFF-004 — Merge Editor

**Requirement.** The Merge Editor family MUST present one-way or three-way merge blocks and apply host-triggered accept, delete, and resolve actions without writing a repository. Horizontally scrollable panes MUST be keyboard-focusable.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- The editor MUST report resolved content through `onResolvedChange`, overlay optional editable sides that report `onLeftChange`, `onBaseChange`, and `onRightChange`, assemble a working-copy center while the headless default keeps VCS ancestor semantics, insert a side above or below center or remove it through center-pointed actions, and reassemble after those actions or any pane edit.
- Connector, block, caret, and line-number visuals MUST share the merge render model and one line grid, column headers MUST align with editor panes, and Next/Previous MUST count and visit pending merge or unresolved-resolve hunks, mark the current hunk with a ring on the code overlay, follow caret or click into a pending hunk, show a visible hover, and scroll only when those buttons move the current hunk.
- The catalog MUST demonstrate one-way, three-way, editable, MisMerge-style solid insert/reject arrows that use the same `--ui-diff-gutter` color and size as line numbers, syntax-highlighted Changeyard fixtures, comparison-option, and connector-band states without introducing a second runtime contract.

## DC-DIFF-005 — Diff Guidance

**Requirement.** The Diff Guidance family MUST explain when to use File Listing, File Change Stats, File Diff, Merge Editor, and Forms UnifiedReviewDiff.

### Acceptance details

- The public boundary is Documentation surface.
- Guidance MUST keep version-control execution and persistence in the host.
- Guidance MUST route short field-value review to Forms UnifiedReviewDiff.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-006 — File Change Stats

**Requirement.** The File Change Stats family MUST present added and removed line counts with distinct tones and MUST NOT own change-set listing or file comparison.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- Added and removed counts MUST use distinct `--ui-diff-stat-*` colors and `formatDiffDelta` prefixes.
- Zero sides MUST hide unless `showZero` is set.
- The catalog MUST demonstrate added, removed, and hidden-zero states without introducing a second runtime contract.

## DC-DIFF-007 — Diff wrap and frame

**Requirement.** File Diff and Merge Editor MUST wrap long lines against the available width when `wrap` is true and MUST paint their outer card through `--ui-diff-frame-border` and `--ui-diff-frame-radius`.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- `wrap` MUST set `data-wrap="true"` and wrap text to the pane width, while unwrapped split panes MUST clip to their column and sync horizontal scroll.
- Frame tokens MUST default to the card border and radius so hosts can flush them.
- The catalog MUST demonstrate wrap on File Diff and Merge Editor.

## DC-DIFF-008 — Diff scroll surfaces

**Requirement.** File Diff and Merge Editor MUST scroll through the public shadcn ScrollArea, fill the host height, and keep unwrapped horizontal scrollbars at the bottom of that filled surface.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- File Diff and Merge Editor MUST mount shadcn `scroll-area` viewports instead of native overflow panes.
- The editor MUST fill the host height, paint line-number gutters through unused space below the last line, and keep unwrapped horizontal scrollbars at the bottom of that surface, just above any merge footer.
- The catalog MUST demonstrate the filled ScrollArea on File Diff and Merge Editor.
