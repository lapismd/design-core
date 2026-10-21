# Handled input in custom transcript sections

2026-10-19; enclosing Jujutsu change qpvlkwxy; DC-CHAT-006/007.

Native Notes review found a real duplicate paste in a tool-result comment.
Code/table comments paste once. The custom-section action handled bubbled input
without checking whether a nested editor had already consumed it. The source
regression establishes that this can append pasted text or a typed character a
second time to the same active draft.

The custom section now ignores default-prevented keyboard and paste events,
as well as existing interactive targets. Unhandled section input keeps the
existing whole-section annotation path. No public API, stored anchor, receipt,
reader identity or persistence schema changes. DC-CHAT-007's exact input
requirement is explicit; wider milestone and visual gates remain unchanged.

- Before: `pnpm exec vitest run --project unit src/shared/chat/transcript/custom-interaction.spec.ts`
  fails two cases: Original draft becomes Original draftPasted once or
  Original draftx. `.local/transcript-handled-input-before.log`.
- After: `pnpm exec vitest run --project unit src/shared/chat/transcript`
  passes 49 cases/nine files, including both exact regressions;
  `.local/transcript-handled-input-after.log`.
- `pnpm test:storybook src/shared/chat/transcript` passes 30 interaction/axe
  checks/two files in a fresh process. The new custom-tool example pastes once
  into its real comment editor and retains the exact text through Classic;
  `.local/transcript-handled-input-stories.log`.
- `node scripts/pack-local.mjs` prepares public source/declarations and audits
  252 CSS files with zero remaining utilities. Archive SHA256:
  `6bc9cced7710ae14bd18023a783230fa193113b125cc5ff0fea3be05ee66143b`;
  `.local/transcript-handled-input-pack.log`. No publication.

Notes E-AI-053 owns refreshed archive and actual native acceptance. Before the
source repair its physical code/table/typed-tool acceptance passed after the
duplicated tool draft was explicitly corrected. That result does not qualify
native paste. The exact paste still needs qualification in the new consumer.
Broad package/release/provider/platform and visual baseline lanes remain deferred
under the user's functional-delivery priority.

Final source types and all three public-consumer profiles pass with zero
errors/warnings (`.local/transcript-handled-input-types.log`). Initial spec check
rejected an added second sentence in an acceptance bullet; the input rule now
lives in its owning requirement prose. Final `pnpm spec:check` passes validation,
book and source-first (`.local/transcript-handled-input-spec-final.log`).
Changed-file formatting passes. Original assertions and milestone gates remain.
