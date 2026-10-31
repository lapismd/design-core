# Explorer reveal focus

Notebook's mobile filter acceptance exposed keyboard focus moving to the file
explorer while a Select or input was active. Explorer's reveal flash scheduled
an unconditional row focus two seconds after the reveal began. The source fix
belongs to Design Core, rather than a Notebook delay or focus override.

The reveal now focuses its row at the beginning, provided focus has not changed
during asynchronous rendering. The flash timer only clears the visual flash.
The queued frame ignores an unmounted owner. No public API or styling changes
are required, and visual baselines remain unchanged.

## Focused evidence

- Exact command (Node 24): `pnpm exec vitest run --project storybook src/shared/workspace/explorer/WorkspaceExplorer.stories.svelte -t RevealPathFlashesAndFocuses`.
- Before implementation: one failure, seventeen skipped. Moving focus to the
  Create File button during the flash is undone by the old timer, which focuses
  the revealed file row instead.
- After implementation: one pass, seventeen skipped.
- All eighteen Explorer stories pass on the source main workspace before the
  fix is moved into the existing Notebook source workspace. That workspace
  retains the prior mounted-status-content fix consumed by Notebook's temporary
  archive, so acceptance must use its archive rather than dropping that fix.
- Requalification in the Notebook source workspace passes all eighteen Explorer
  stories. Complete `pnpm checks` passes: 914 unit tests in 142 files, 974
  Storybook interaction/accessibility cases in 277 files, formatting and all
  four type-check targets, native-CSS and specification gates, static Storybook,
  visual metadata audit, 16 workspace pointer tests, 17 shell pointer tests,
  3 AI browser tests and 153 Shadcn pointer cases. One WebKit-only Scroll Area
  case remains platform-gated in the Chromium lane; no skip was added.
- The full gate first reports an atomic acceptance-bullet diagnostic, then an
  unsupported test-query `exact` option. Both are corrected without changing
  the source fix or assertions; the final gate exits zero.
- The prepared local 0.7.0 archive has SHA-256
  `b921bb67a711cc2dd5eb5279afa35ed50385f2d6394651df0cbb3debc12c47c8`.
  Notebook's exact desktop/mobile filters pass, followed by its full 395-unit,
  42-story qualification, against that archive. Source and consumer evidence
  remain distinct; publication and visual approval are not performed.

The initial CLI invocation included a literal `--` before Vitest selectors and
was stopped after observing the same failure; the exact command above provides
the completed before/after counts.
