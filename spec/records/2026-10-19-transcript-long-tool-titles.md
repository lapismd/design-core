# Long captured tool titles in constrained transcripts

DC-CHAT-006; enclosing Jujutsu change vvnxoroq; 2026-10-19.

The desktop reproduction includes two workspace sidebars, a conversation list,
long prose and a captured read with a deep path and long basename. The inspect
button inherited Button's `white-space: nowrap`. Through the styled Scroll Area
content wrapper, that path widened the transcript to its maximum width and
clipped neighbouring prose. Ordinary prose alone did not reproduce the defect.

ChatTools now explicitly allows title wrapping and lets the title span shrink.
The exact captured title, accessible name, inspector callback and independent
disclosure controls are preserved. No public API, source bytes, storage,
controller identity, editor wrapping policy or host authority changes.

Source regression and verification (logs under `.local/verification/footer`):

- `pnpm test:storybook src/shared/chat/transcript/Transcript.readonly.stories.svelte -t Narrow`
  with prose alone passes two cases. Adding the inspectable long path fails both
  Document and Classic: the reader extends to 948px inside a 320px frame.
  `wrapping-long-path-source-before.log` records two failures.
- The exact rerun after the CSS fix passes both cases;
  `wrapping-long-path-source-after.log`.
- `pnpm test:storybook src/shared/chat/transcript/Transcript.readonly.stories.svelte src/shared/chat/transcript/Transcript.tools.stories.svelte src/shared/chat/transcript/Transcript.task-lists.stories.svelte`
  passes all 12 interaction/accessibility cases in a fresh process. Assertions
  cover prose bounds, wrapping, title and complete heading overflow;
  `wrapping-affected-source.log`.
- `pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings`
  passes with zero errors/warnings; `wrapping-source-types.log`.

The source is prepared through `packLocal` from `scripts/pack-local.mjs`, suffix
`-tool-title-wrap`; desktop owns the verified public-archive install and consumer
acceptance. Its evidence records the final source revision and SHA256.
Preparation passes: 254 CSS files audited, zero utility references;
`wrapping-pack.log`. `pnpm spec:check` passes validation, mdBook and source-first;
`wrapping-source-spec.log`. Changed-file Prettier checks pass.

Milestone review: DC-CHAT-006 remains In progress. This repairs constrained
layout without completing the original history, streaming, native/provider or
release gates. The user's minimal-testing direction defers aggregate package,
pointer, static and visual matrices. Stories remain visual-pending and no
baseline is changed. Focused source checks and the public desktop reproduction
are the selected acceptance surface.
