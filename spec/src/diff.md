# Diff

File Diff Composer headers and Merge Editor titles with an explicit path compose the shared FileTypeIcon at size s. A host fileHeaderLeading snippet replaces the default icon. Missing paths do not invent file types; truncation, sticky headers and merge controls retain their original behavior.

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

- The public boundary is Diff layer and MUST remain consumable under strict indexed-access and exact-optional TypeScript settings; internal composition MUST omit absent optional props and guard missing indexed navigation targets.
- Diff production sources MUST import only shadcn primitives and Diff-owned modules.
- Hosts MUST supply file contents, selection persistence, and merge resolution policy.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-002 — File Listing

**Requirement.** The File Listing family MUST present a host-owned change-set as a controlled list, folder tree, or compacted package tree without performing filesystem operations.

File and directory rows accept opt-in host drag callbacks and eligibility
predicates. Native drag events provide the same public context as row slots;
the host owns payloads and operation policy. Without a drag callback rows remain
non-draggable, and selection/disclosure behavior stays independent of dragging.

`--ui-diff-file-listing-row-gap` defaults to `2px`, separating row backgrounds
in list, folder and package modes. Eager rows split that space across their
block margins; virtual row wrappers include it in their measured height so
scroll offsets, continuation and keyboard navigation retain the same spacing.

Default file rows compose the public FileTypeIcon primitive (DC-SHA-064) at
14px, preserving the original icon slot and folder/disclosure geometry. The
legacy `fileIconNameForPath` helper retains its public Lucide-name contract.

Default file-row accessible names retain the full path and every visible signed
change count. Custom leading, label or meta snippets use their native text as
the accessible name rather than an overriding path-only label.

Host-issued `conflicted` file metadata MUST remain visible through selection and
hover as a semantic conflict tint and trailing accessible icon. Default directory
metadata MUST sum all loaded descendants, including collapsed descendants, while
distinguishing unknown counts from measured zero and leaving custom metadata
snippets authoritative. Totals describe loaded files only.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`; hosts MAY provide public `FileListingDirectory` values before their children are loaded, and controlled disclosure MUST request expansion through `onDirectoryToggle` without performing I/O or inventing child files.
- Selection and view mode MUST remain host-controllable through `selectedPath`, `mode`, and a compact three-segment `FileListingViewModeToggle` (list, folder tree, package) with one group border, and selected rows plus the active segment MUST use the shared `--ui-diff-selected` fill.
- Row leading, label, and meta content MUST be host-replaceable snippets; default file-row meta MUST render File Change Stats from `additions` and `deletions`, while root files in folder and package views MUST use the normal row inset without a disclosure spacer; nested files MUST retain their depth and disclosure alignment in eager and virtualized rendering.
- Opt-in measured virtualization MUST bound mounted list, folder-tree, and package-tree rows against the nearest scroll viewport, including the public Scroll Area viewport before runtime overflow styles settle, retain stable row keys and keyboard navigation, and request host-owned continuation once per loaded edge without changing the default eager rendering contract; the catalog MUST exercise this path alongside lazy-directory, list, tree, package, empty, and selected states.

## DC-DIFF-003 — File Diff

**Requirement.** The File Diff family MUST render unified or split textual changes from two texts or a unified patch without owning comments or version-control transport.

Highlighted additions/removals MUST retain readable syntax foreground on row and intraline washes through `--ui-diff-changed-syntax-foreground` (default `--foreground`), while unchanged rows retain readable normal syntax colors in both light and dark modes.

Multi-file headers MUST expose semantic hover and keyboard-focus backgrounds,
retaining selected tint over an opaque diff surface so sticky headers obscure
scrolled content, including with translucent theme tints. Inset selection outlines MUST paint all four edges
above opaque file content and sticky gutters without intercepting input.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`, and unchanged context MUST collapse with incremental expand controls in both unified and split layouts; split panes MUST share expansion state, keep changed-row pairing and old/new line numbers, and reveal or hide the same context when either pane's controls are used.
- Line identity MUST be exposed through `data-diff-line-*`, a `lineAccessory` snippet, and a host-owned `lineAnnotation` seam after unified rows; line accessories MUST occupy the number gutter and reveal on row hover or keyboard focus, while split gutters MUST show old-file numbers on the left and new-file numbers on the right, each aligned with its row.
- Multi-file composition MUST support opt-in header-wide disclosure excluding interactive trailing actions, presentational header metadata, and public spacing/border/selection tokens for continuous square sections and MUST accept a typed host-owned file body for loading, unavailable and domain previews while retaining disclosure semantics and controlled selection/collapse, host-owned headers, optional sticky headers and repeatable path scrolling without persistence; File Diff accepts an optional host label distinguishing previous/later pane landmarks across files or hunks while preserving default names when omitted.
- The catalog MUST demonstrate unified, split, collapsed-context, binary, empty, multi-file composer, and wrap-text states without introducing a second runtime contract.

## DC-DIFF-004 — Merge Editor

**Requirement.** The Merge Editor family MUST present one-way or three-way merge blocks and apply host-triggered accept, delete, and resolve actions without writing a repository. Horizontally scrollable panes MUST be keyboard-focusable.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`, with optional `headerCenter` controls centered between the truncating path and pager (on a second row in narrow editors), optional `headerActions` after the pager, and unchanged chrome when omitted.
- The editor MUST report resolved content through `onResolvedChange`, overlay optional editable sides that report `onLeftChange`, `onBaseChange`, and `onRightChange`, assemble a working-copy center while the headless default keeps VCS ancestor semantics, insert a side above or below center or remove it through center-pointed actions, reassemble after those actions or any pane edit, and retain edited or accepted three-way pane contents when only whitespace or case comparison options change.
- Connector, block, caret, and line-number visuals MUST share the merge render model and one line grid, catalog interaction coverage MUST assert that grid through element-level measurements, column headers MUST align with editor panes, and Next/Previous MUST count and visit pending merge or unresolved-resolve hunks, mark the current hunk with a ring on the code overlay, follow caret or click into a pending hunk, show a visible hover, and scroll only when those buttons move the current hunk.
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
- Added and removed counts MUST use distinct `--ui-diff-stat-*` colors and `formatDiffDelta` prefixes, retaining at least 4.5:1 text contrast against the default surface in light and dark modes.
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

**Requirement.** File Diff and Merge Editor MUST scroll through the public shadcn ScrollArea, fill the host height, and keep unwrapped horizontal scrollbars at the bottom of that filled surface. File Diff MAY override the host scroll strategy for unified and split panes. An explicit content-sizing option MUST let an outer multi-file collection own vertical scrolling while preserving horizontal split synchronization; fill sizing remains the default.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- File Diff and Merge Editor MUST mount shadcn `scroll-area` viewports instead of native overflow panes.
- The editor MUST fill the host height, paint line-number gutters through unused space below the last line and split context-fold rows, keep those sticky gutters opaque so scrolled line text and fold controls cannot show through, and keep unwrapped horizontal scrollbars at the bottom of that surface, just above any merge footer.
- The catalog MUST demonstrate the filled ScrollArea on File Diff and Merge Editor, with Merge Editor horizontal synchronization enabled by default and overridable through `syncHorizontalScroll`, and scrolled editable text and current-hunk overlays remaining beneath opaque gutters.
