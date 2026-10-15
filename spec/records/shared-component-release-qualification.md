# Shared component release qualification

The user approved landing the reviewed isolated workspace into the main Design
Core workspace, opening a pull request and releasing the package. The source
stack is based on remote main `b46bcf02` (published Design Core 0.3.5); the
final implementation snapshot is `de539b06`, before this evidence-only update.
The main workspace was clean and fetching `codex-https` found no newer commits.

## Final qualification

`pnpm checks` passed every required nonvisual lane
(`/tmp/dc-release-checks.log`): all three specification lanes, repository
formatting, four type checks with zero errors and warnings, the native-CSS
audit, 741 unit tests across 115 files, three Turbo tests, 16 release/style
tests, static Storybook build and metadata audit, and 754 Storybook interaction
and accessibility cases across 226 files. Browser checks passed Workspace
15/15, Shell 11/11, AI 3/3 and Shadcn 83/84 with the existing Chromium-only
WebKit-preference skip: 112 passes, one governed platform skip, zero failures.
The browser lanes started fresh checkout-owned Storybook processes. The
non-failing tablet ResizeObserver diagnostics remain as previously recorded.

`pnpm release:check` and `pnpm packages:pack` passed
(`/tmp/dc-release-packed.log`). The archive installed and type-checked in a
clean consumer. Cold development and production CSS, licensed fonts, focus,
themes, token overrides, reactive CodeEditor and Composer Input ownership
lifecycle passed without Tailwind tooling or Svelte diagnostics.

Both `pnpm audit --json` and `pnpm audit --prod --json` reported zero
vulnerabilities for the locked source graph (`/tmp/dc-release-audit.json` and
`/tmp/dc-release-audit-prod.json`). The independent packed consumer retains
the unchanged, previously approved low-severity KaTeX advisory
GHSA-238p-pmpm-9mq7 and its six-package propagation chain. No additional
exception or relaxed gate was introduced.

This closes the aggregate and package qualification deferred in
`chat-composer-actions.md` and `comment-composer.md`. Earlier focused regressions
and source provenance remain in those records and
`app-component-promotion-batch.md`. Changed stories remain `visual-pending`;
screenshot baselines are unchanged. Consumer adoption, Panel Toggle integration
and the remaining transcript/comment-controller slices stay separate.

## Pull request interaction follow-up

PR #25's first Linux interaction run reported 753 passes and one failure in
AvatarPicker's `ChooseImageEmojiOrInitials` story: its synchronous emoji lookup
ran after the search input mounted but before Emoji Mart populated the grid.
The exact isolated command passed locally before editing. Both selection stories
now await the same expected emoji button with a bounded asynchronous role query;
their selection, value and shape assertions remain unchanged. No runtime source,
shared helper, timeout policy, accessibility rule or baseline was changed.

`pnpm test:storybook src/shared/forms/avatar-picker/AvatarPicker.stories.svelte -t ChooseImageEmojiOrInitials`
passes after the repair (`/tmp/dc-pr25-avatar-after.log`). Both complete owning
story families pass 16/16 (`/tmp/dc-pr25-picker-families.log`). The complete main
workspace gate is rerun before committing this follow-up; the PR's complete
Linux pipeline remains the final merge gate.

The follow-up `pnpm checks` run in the main workspace passed every lane
(`/tmp/dc-main-final-checks.log`): 741 units, 754 Storybook cases, four clean
type checks, static build/metadata, and 112 browser passes with the same single
platform skip. The evidence-only addition was formatted and specification
checked before committing.
