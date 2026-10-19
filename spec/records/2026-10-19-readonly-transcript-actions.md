# Read-only transcript comment actions

2026-10-19; enclosing Jujutsu change svmprzzl; DC-CHAT-006/007.

The Notes session-layout review passes `canComment=false` and marks imported
blocks non-commentable, but hovering still showed a disabled Comment control.
The shared hover-actions component now omits comment controls when the host
disables commenting, and omits the empty action group when no independent
reaction or host actions remain. Existing comments are retained. Hosts that
allow commenting still see the disabled waiting-for-source control on
unpublished blocks. No public API, controller authority, stored anchor or
persistence format changes.

- Before: `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.readonly.stories.svelte`
  fails both Document and Classic cases on the unwanted button.
  `.local/readonly-before.log`.
- After: the same command plus `src/shared/chat/transcript/Transcript.tools.stories.svelte`
  passes 5 interaction/axe cases in a fresh process, retaining the editable
  tool-comment regression. `.local/readonly-after.log`.

Notes owns the verified local archive refresh and consumer Storybook acceptance.
The user prioritizes visible Storybook review and explicitly defers ordinary
app integration until confirmation. Aggregate package/provider/release and
visual-baseline lanes remain deferred; no baselines are changed.

Source closure: `pnpm exec vitest run --project unit src/shared/chat/transcript`
passes all49cases/ninefiles (`readonly-unit.log`). `pnpm check:types` passes
source and allthreepublicconsumer profiles with0errors/0warnings
(`readonly-types.log`). `pnpm spec:check` passes validation, mdBook and
source-first (`readonly-spec.log`). Changed-file formatting passes.
A prepared public archive is built with `packLocal` from `scripts/pack-local.mjs`
using suffix `-readonly-actions`; it retains declarations and ordinary CSS.
Consumer source revision and SHA256 are recorded in Notes E-AI-057. No
publication or installed-application restart is performed.
