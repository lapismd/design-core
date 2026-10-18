# File-listing accessible change counts

DC-DIFF-002 retains the full-path default label and includes visible signed
additions/deletions. Custom row snippets use their native accessible text.
No props, persistence or filesystem behavior changes. Visual review is pending.

The Notes repository UI reproduced axe label-content-name-mismatch for a selected
file whose visible counts were missing from the button name. The new exact story
failed once before the fix; all ten File Listing interaction cases pass after it.
The initial command with a spaced test filter selected no cases (ten skipped).
The first whole-family run found two failures: the new story needed an explicit
template and the virtual-list assertion needed to include the now-visible counts;
that run also recorded one consequent unhandled rendering error. Both are fixed.

Commands and logs under `.local/repository-accessibility`:

- `pnpm test:storybook src/shared/diff/file-listing/FileListing.stories.svelte -t 'Accessible visible change counts'`: no cases selected (`before.log`).
- `pnpm test:storybook src/shared/diff/file-listing/FileListing.stories.svelte`: initial two failures and one rendering error (`after.log`).
- `pnpm test:storybook src/shared/diff/file-listing/FileListing.stories.svelte -t AccessibleVisibleChangeCounts`: one exact failure (`exact-before.log`).
- Same family command after repair: ten pass (`exact-after.log`).

Package qualification is complete:

- `pnpm checks`: governance (three specification lanes), formatting, strict
  types, consumer/CSS audits, 821 unit cases, 19 Node cases and static Storybook
  build pass. The parallel Storybook phase was stopped after 241 files reported
  and two families remained pending; no complete result is claimed for it.
  Three ResizeObserver browser diagnostics were recorded in that attempt.
- `pnpm test:storybook src/shared/chat/transcript/Transcript.stories.svelte src/shared/diff/merge-editor/MergeEditor.stories.svelte --no-file-parallelism`:
  all 41 cases pass; `pending-families.log`.
- `pnpm test:storybook --no-file-parallelism`: all 243 files and 840 cases pass;
  `full-serial.log`. Diagnostics remain enabled.
- `node --env-file-if-exists=.env scripts/run-turbo.mjs ci:browser-workspace --summarize`:
  16 pass; the corresponding shell lane has 11 passes and AI lane has three.
- The corresponding `ci:browser-shadcn` lane has 151 passes and one guarded
  Chromium skip for a WebKit-only case, which also passes in WebKit. Logs are
  `workspace-final.log`, `shell-final.log`, `ai-final.log`, `shadcn-final.log`.
  Earlier `pnpm exec node --env-file-if-exists=.env ...` wrapper attempts fail
  before testing with `.env: not found`; the direct Node commands above succeed.

The package was prepared with `pnpm package:local` (`pack.log`), with zero
remaining utility references. The private Notes migration consumes the public
prepared archive, SHA-256
`54ae2c389eab07aa6ee8cbc9689d8f8f8da81012f5d062b889fbbe4b03bcbe57`,
through its ignored archive overlay. Its 144 directly affected production story
checks across both themes/widths, 212 renderer/governance cases and three cold
native API cases pass. Notes' full catalog/build and evidence are tracked
separately in E-REPO-007. No package is published and no visual baseline changes.
