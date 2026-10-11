# Design Core CI focus regressions

Owning requirements: DC-AI-017 and DC-FORM-044.

## Reported CI failure

Run 38128536116, job 114438619315 failed `NavigatesTheEmojiGrid` in
`src/shared/ai/experimental/emoji-picker/EmojiPicker.stories.svelte`:
678 stories passed and one failed. ArrowDown moved focus into the grid, but
an opening autofocus callback subsequently moved it back to search.

The exact unchanged local command passed once, confirming that a rerun alone
was insufficient evidence:

`pnpm test:storybook src/shared/ai/experimental/emoji-picker/EmojiPicker.stories.svelte -t NavigatesTheEmojiGrid`

Repeated opening diagnostics reproduced the failure, and focus-event stack
traces identified Bits UI's scheduled opening autofocus as the later writer.
Replacing `userEvent.type` with `userEvent.keyboard` still reproduced it.
The component now focuses its search control in `onOpenAutoFocus` and prevents
the default delayed callback. Its normal keyboard assertions are retained.

## Source regression evidence

`PreservesGridFocusAfterOpeningAnimationFrames` controls only its own browser
animation callbacks, restores the browser APIs in `finally`, and checks grid
focus both before and after releasing pending opening frames. The same test
against the parent component failed once; the fixed component passed it.

Exact command:

`pnpm test:storybook src/shared/ai/experimental/emoji-picker/EmojiPicker.stories.svelte -t PreservesGridFocusAfterOpeningAnimationFrames`

The original exact target passed after the fix. All three Emoji Picker stories
passed. A diagnostic sequence also completed 100 open/navigate/close cycles
without a focus failure. That diagnostic loop and its tracing were removed;
the controlled regression remains in the source catalog.

## Separate main-branch failure

Main run 38128781279, job 114438583189 failed `DialogFrame/Dark`: the story
queried an exiting dialog before the next opening was ready. That run also had
678 passes and one failure. The focused Dark target and three-story family
passed unchanged locally.

An exit diagnostic proved that the previous scenario finished with its dialog
still connected and `data-state="closed"`, after focus had already returned to
the trigger. An immediate removal assertion failed and the following Dark
scenario encountered the remaining modal pointer lock. The story now awaits
open content, retains its field-value/focus assertions, and awaits complete
exit before finishing. The focused Dark target and all three family stories
passed with this synchronization.

## Release and consumer scope

The change starts from remote main at 0.3.0 and includes a patch Changeset.
The existing KaTeX exception is unchanged and remains restricted to its
already accepted versions; this change does not authorize an exception for
0.3.1 or publish any version.

Lapis Notes source and stories contain no EmojiPicker or `ai/experimental`
imports. Lapis Plugins imports Reasoning from the experimental barrel but does
not instantiate EmojiPicker. Both consumers remain unchanged. A fresh
Svelte/Vite archive consumer passed EmojiPicker keyboard navigation, three
close/reopen cycles with trigger-focus restoration, search, and selection
through the public experimental export.

Changed Emoji Picker stories remain visual-pending. Screenshot comparisons
and baseline updates are excluded by the user's standing preference.

## Complete validation

`pnpm checks` passed all nine nonvisual lanes with no unexplained failures:

- Governance, formatting, source style, and all four type-check projects passed.
- 723 unit tests, three Turbo helper tests, and ten release-policy tests passed.
- The static Storybook build and visual metadata audit passed.
- All 680 Storybook interaction/accessibility tests passed across 216 files.
- Workspace: 15 passes; Shell: 11 passes; AI: three passes.
- Shadcn: 56 passes with its existing engine-specific skip unchanged.

`pnpm audit` and `pnpm audit --prod` each reported zero findings.
`pnpm packages:pack` passed archive validation, clean-consumer types, and cold
runtime acceptance. Its six low-severity npm audit propagation rows all
terminate in the already accepted KaTeX advisory for version 0.3.0.

The first aggregate attempt found one canonical bullet-format diagnostic;
joining that bullet into a single sentence preserved its constraints and the
complete rerun passed. The first additional archive fixture attempt used a
relative tarball path and failed before installing the package; rerunning
with the absolute archive path passed without a product change.

Additional consumer command:

`node .local/emoji-packed-runtime.mjs /Users/stevejuma/code/lapismd/design-core-npm-release/.release/tarballs/lapismd-design-core-0.3.0.tgz`

Local logs: `/tmp/design-emoji-delayed-regression-before.log`,
`/tmp/design-emoji-delayed-regression-after.log`,
`/tmp/design-emoji-focus-exact-after.log`,
`/tmp/design-emoji-focus-family-final.log`,
`/tmp/design-dialog-exit-before.log`, `/tmp/design-dialog-dark-after.log`,
`/tmp/design-dialog-family-after.log`,
`/tmp/design-core-ci-focus-checks-final.log`,
`/tmp/design-core-ci-focus-pack.log`, and
`/tmp/design-core-ci-focus-packed-emoji-final.log`.
