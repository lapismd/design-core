# Composer completion lifetime

Desktop's exact Conversation Drafts / Separate Conversations story failed once
with a fatal `derived_inert` warning and one unhandled CodeMirror callback error.
The captured stack points to the shared CommentComposer disabled getter called
by `composerSuggestions` after its owning effect and editor were destroyed.

Three source regressions reproduce queued source invocation, late search results
and retained completion application after the public ViewPlugin destroy hook.
All three failed before the repair. The extension now tracks retired view
identities through its owned plugin lifecycle and rejects before reading caller
reactive callbacks; it never reads CodeMirror's private destroyed field.

Validation used Node 24.10.0, pnpm 10.32.1 and isolated Storybook port 9470:

- The exact lifecycle file failed three tests before repair; running it together
  with the existing composer-trigger file passes all nine tests afterward.
- `pnpm test:storybook src/shared/chat/comment-composer/CommentComposer.stories.svelte -t Focused`
  passes the real focused teardown/remount scenario; all four directly affected
  composer story files pass 33 cases. An initial full-name selector matched no
  case and skipped 11; that skipped run is not acceptance evidence.
- Initial `pnpm check:types` found one test-constructor argument error; the
  corrected public constructor passes the full type and consumer checks.
- Initial `pnpm spec:check` rejected one non-atomic acceptance bullet; the
  corrected requirement passes all three specification lanes.
- Initial `pnpm checks` passed 917 unit tests, 20 tooling tests, 974 Storybook
  cases, static build/metadata, 16 Workspace pointer cases, 17 Shell pointer
  cases and three AI browser cases. Its final Shadcn lane passed 146 cases and
  skipped one, then failed seven because WebKit was not installed.
- After `pnpm exec playwright install webkit`, the exact WebKit project passes
  all seven cases. The subsequent complete `pnpm checks` succeeds, including
  the complete Shadcn lane: 153 passed and one existing skip.
- `spec-validator doctor` passes and QMD semantic discovery is available.
- Push preflight finds no open Dependabot pull requests; no empty dependency
  consolidation is created. The default checkout and its column-width work are
  preserved outside this isolated repair.

Desktop prepared-package acceptance and hosted source checks remain independent
consumer/merge gates. No callback, warning, accessibility rule or visual baseline
is weakened. This internal lifetime repair changes no public prop or export;
its new lifecycle story remains visual-pending. No release or publication occurs.
