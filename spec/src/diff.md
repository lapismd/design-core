# Diff

Diff contracts keep change-set listing, file comparison, and merge presentation separate from version-control commands, file I/O, and review policy.

## Public surface coverage

| Surface                | Public boundary             | Requirement |
| ---------------------- | --------------------------- | ----------- |
| Shared Diff invariants | Diff layer                  | DC-DIFF-001 |
| File Listing           | `@lapismd/design-core/diff` | DC-DIFF-002 |
| File Diff              | `@lapismd/design-core/diff` | DC-DIFF-003 |
| Merge Editor           | `@lapismd/design-core/diff` | DC-DIFF-004 |
| Diff Guidance          | Documentation surface       | DC-DIFF-005 |

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
- Selection and view mode MUST remain host-controllable.
- Row leading, label, and meta content MUST be host-replaceable.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-003 — File Diff

**Requirement.** The File Diff family MUST render unified or split textual changes from two texts or a unified patch without owning comments or version-control transport.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- Unchanged context MUST collapse with incremental expand controls.
- Line identity MUST be exposed for host accessories through data attributes or a snippet.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-004 — Merge Editor

**Requirement.** The Merge Editor family MUST present one-way or three-way merge blocks and apply host-triggered accept, delete, and resolve actions without writing a repository.

### Acceptance details

- The public boundary is `@lapismd/design-core/diff`.
- The editor MUST report resolved content and remaining conflict counts to the host.
- Connector and block visuals MUST derive from the shared merge render model.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-DIFF-005 — Diff Guidance

**Requirement.** The Diff Guidance family MUST explain when to use File Listing, File Diff, Merge Editor, and Forms UnifiedReviewDiff.

### Acceptance details

- The public boundary is Documentation surface.
- Guidance MUST keep version-control execution and persistence in the host.
- Guidance MUST route short field-value review to Forms UnifiedReviewDiff.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
