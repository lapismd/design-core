# File listing conflict and count metadata

DC-DIFF-002: FileListing now accepts host-owned `conflicted` metadata, retains a
semantic red tint during selection/hover and renders a trailing accessible icon.
Folder rows sum loaded descendants independently of disclosure and report how
many files have known counts. Unknown binary counts are omitted. Custom file
and directory metadata snippets retain authority.

Targeted evidence only, following the user request to defer broad qualification:

- `pnpm exec vitest run --project unit src/shared/diff/file-listing/file-listing-rows.spec.ts`: one failed / three passed before; four passed after.
- `pnpm exec vitest run --project storybook src/shared/diff/file-listing/FileListing.stories.svelte`: eleven passed including interaction/accessibility. During iteration the added folder totals exposed accessible-name and overly broad story selectors; all six initial failures, then three and one, were repaired without disabling checks.
- Strict Svelte/TypeScript: zero errors and warnings after replacing unsupported aria-description and correcting story matcher types (four errors / one warning initially).
- `pnpm pack --out .local/packages/lapismd-design-core-0.6.0-history-review.tgz`: prepared a source-export review archive. No main-package build is needed.

Agent UI consumes this archive through its ignored review dependency hook; npm
manifests and portable lock entries retain registry ranges. This is temporary
local acceptance, not a publication or downstream-service update. Broad suites,
other consumers and visual baseline approval remain deferred to final review.

## Prepared consumer acceptance archive

The source-only tarball exposed Vite 8 optimizer parsing of `.svelte.ts` files
in the consumer. The existing `packLocal` workflow was then used with
`retainSource: true` and suffix `-history-review-built`; it prepared declarations
and browser CSS with zero remaining utility references. Archive:
`.local/packages/lapismd-design-core-0.6.0-history-review-built.tgz`, SHA-256
`ad206732908689b06432cad37518afcf6ea112e4d460b30909d3f42fc06fa8bc`.
This replaces the source-only archive for temporary Agent UI review. The source
spec check passed all three lanes and spec-first covered ten protected files and
two canonical chapters. No published package or downstream service changed.
