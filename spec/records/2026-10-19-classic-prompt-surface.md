# Classic transcript prompt surface

2026-10-19; enclosing Jujutsu change zxymrkyp; DC-CHAT-006 and DC-CHAT-008.

Notes adopts the shared Transcript as its sole renderer, including read-only
JSONL previews. Classic user messages now use the same rounded, primary-tinted
surface as jj-store's CommunityMessage (12% primary mixed with background).
Hover and focus retain that tint. Assistant hover and Document presentation
remain unchanged. This is family-owned CSS using the existing role marker;
no new public API, persistence or controller policy is introduced.

Before: the exact new Storybook regression fails 1/4 tests because the prompt
background is transparent. After: the same fresh-process command passes 4/4:
`pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.readonly.stories.svelte`.
Logs: `.local/ai-classic-before.log` and `.local/ai-classic-after.log`.

Full required source qualification uses
`TURBO_ENV_MODE=loose VITEST_MAX_WORKERS=2 pnpm checks` because shared Transcript
CSS affects multiple consumers. The aggregate finished with one unrelated timing failure in unchanged Column
Canvas wheel animation coverage (the transient animation marker had already
cleared). Source and three public consumer type profiles, formatting, native CSS,
829 unit tests, 861 Storybook tests, static Storybook, 16 workspace, 11 shell and
3 AI browser tests passed. Shadcn finished 150 passed, one conditional WebKit-only
skip in Chromium and that one failure. The fresh-process exact retry passed 1/1:
`pnpm test:shadcn:pointer tests/shadcn/column-canvas-scroll.spec.ts -g 'resizes the trailing pair inversely'`.
Logs: `.local/ai-classic-full-gate.log` and `.local/ai-classic-shadcn-retry.log`.
The aggregate itself is recorded as failed; the exact retry supplies current
acceptance without altering the test or unrelated implementation. No visual
baseline changes.

The prepared public archive is
`lapismd-design-core-0.5.1-jsonl-classic.tgz`, source snapshot
`38e915c785f2982be4c397d270e46ae6881e98ae`, SHA256
`aecf4d055e703d507551e73be08d79e4396ee5f4fdc1e7a46fc54216e3d62336`.
`packLocal` emits ordinary CSS and declarations, with no utilities remaining.
Notes records its consumer acceptance independently. Later source edits are
specification/evidence only. Package publication and visual approval stay separate.

Consumer comment-retention coverage also exposed a singular accessible-name
mismatch in the pending queue. The disclosure now includes the visible count
verbatim, then sent/pending context: `Collapse 1 comment (pending)` and
`Collapse 2 comments (pending)`. The shared source owns the fix; Notes adds no
override. DC-CHAT-008 and its verification row retain In progress status.
`pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte src/shared/chat/transcript/Transcript.readonly.stories.svelte`
passes 31/31, including exact singular/plural coverage and Classic surfaces
(`.local/ai-comment-count-regression.log`). A second `TURBO_ENV_MODE=loose VITEST_MAX_WORKERS=2 pnpm checks` run
passed current source and three public consumer type profiles (zero warnings),
formatting, governance, native CSS, 829 unit tests and script tests. Its duplicate
static Storybook build was cancelled during transformation to keep the review
app refresh and focused UI matrix responsive; owned child processes were stopped.
This is not a second aggregate pass. The earlier full run and exact cold retry
remain the broad evidence, with the aggregate timing failure explicitly retained.
Log: `.local/ai-classic-source-final.log`. Deferred duplicate wider qualification
does not change the DC-CHAT-006/008 In progress status or visual approval gap.

Final Notes archive intake uses `lapismd-design-core-0.5.1-jsonl-inline.tgz`,
source snapshot `a03c8ec314271eb84f7adf74794b3c23eff1cdf3`, SHA256
`75c90a44f261a61a9cd6adaf05ff63b5d7b2516a73d507039c44ea85ae108e72`.
It contains the prompt tint and accessible queue labels, with ordinary CSS and
zero remaining utilities (`.local/ai-jsonl-inline-pack.log`). No publication.
