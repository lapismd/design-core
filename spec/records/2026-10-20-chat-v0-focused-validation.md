# Chat v0 focused validation

Date: 2026-10-20. Requirements: DC-CHAT-006, DC-SHA-058.
Milestone review: the original family gates and visual baselines are unchanged.
The user resumed main-component work for an essential local desktop candidate,
with secondary work and broad qualification deferred. This record supplements
the earlier unqualified system-message review; it does not overwrite it.

The exact targets are the two Author Card stories and Transcript's centered
system-message story. Desktop's focused inline-mention story initially failed
label-content-name-mismatch: visible fallback initials preceded the name while
the accessible label put them last. Mention triggers now separate the visible
name and put fallback initials before it in the accessible label. Ordinary avatar
triggers preserve their previous supplied label and fallback behavior. No public
type, storage, profile lookup or action authority changes. The existing
DC-SHA-058 participant avatar name remains `About Alex Morgan, AM`.

Commands and observed results:

- `pnpm ui guide testing --json`, `pnpm ui guide layers --json`,
  `pnpm ui guide specification --json`: guidance loaded.
- `pnpm exec vitest run --project storybook src/shared/shadcn/author-card/AuthorCard.stories.svelte`:
  2 passed, including mention hover and ordinary popover/action/focus behavior.
- `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte -t 'Centered system messages'`:
  selected zero tests due to generated title casing; all 28 skipped. Not a pass.
- Corrected `-t Centered`: 2 passed, 26 out of scope stories skipped.
- `packLocal(process.cwd(), {suffix:'-chat-v0'})`: prepared the public source
  package with declarations and browser CSS; utility audit reports 0 remaining
  references. Archive `.local/packages/lapismd-design-core-0.5.1-chat-v0.tgz`,
  SHA256 `8bfec943c2b6231075041803ade06c1d59cf3197afc8638be850246195abd0cb`.
  Desktop selected it through its ignored archive overlay; no publication.

Broad type/theme/viewport matrices, baseline approval and distribution remain
outside this user-prioritized v0 slice. Desktop E-AI-089 owns its final consumer
checks, native service tests and cold review-app evidence. Logs are ignored under
`.local/chat-v0-*`. `pnpm spec:validate` passed (8 validators, 31 chapters, 300 requirements).
Initial `pnpm spec:first` required the owning AI chapter for shared chat.css;
added its unchanged-contract mapping before the final rerun.
The next action is local desktop user testing.

Final `pnpm spec:first` passes: 6 protected files, 4 canonical chapters.
Desktop consumer rerun passes all 14 focused light/desktop stories with
accessibility enabled. No broad or native provider gate is claimed.
