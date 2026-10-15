# Shared emoji picker — slice 1

Implementation in the isolated `design-core-plain-css` workspace above
`81233838`. This is the first implementation slice of the approved reusable-component
promotion plan. Responsive tabs, avatars, shell and Chat work remain later
slices; consumer migration is deferred until all shared components are reviewed.

## Provenance and contract

The richer picker is adapted from `jj-store`'s
`web/src/lib/ui/community-emoji-picker/CommunityEmojiPicker.svelte` at
`2d9cdf2063e5`, with its Apache-2.0 Community ancestry recorded by
`jj-store/docs/ui-provenance.json`. Community's
`src/components/community-emoji-picker/CommunityEmojiPicker.svelte` at
`a5f64a4c7dea` is the comparison source. Emoji Mart 5.6.0 and
`@emoji-mart/data` 1.2.1 are consumed as published dependencies with their
original package licenses, rather than vendored source.

DC-SHA-054 owns the new generic family. DC-AI-017 retains the compatibility
exports and explicit restricted choices. Host identity/appearance stores are
removed; ordinary custom IDs, callback-owned persistence and explicit theme
replace those dependencies. The full library/data are lazy imports; popup
teardown cancels pending mounts and releases its observer.

## Baseline

`pnpm test:storybook src/shared/ai/experimental/emoji-picker/EmojiPicker.stories.svelte src/shared/ai/experimental/reaction-bar/ReactionBar.stories.svelte src/shared/ai/conversation/Conversation.stories.svelte`
passed five tests across three files, zero failures before editing
(`/tmp/dc-emoji-baseline.log`). Existing restricted-grid stories continue to
exercise the same selection and autofocus contracts explicitly.

## Verification

- Focused after: the original three story files plus the new generic family
  pass 13 tests across four files, zero interaction/accessibility failures
  (`/tmp/dc-emoji-stories-final.log`). The exact original five regressions remain
  included with explicit restricted choices.
- Cold browser acceptance: `pnpm test:shadcn:pointer tests/shadcn/emoji-picker.spec.ts`
  passes six tests, zero failures (`/tmp/dc-emoji-browser-final-6.log`): keyboard
  search/selection/reopening, explicit themes/skin tones/categories, narrow
  sizing/token override, no full-library/data requests for restricted or preset
  choices, delayed-load disposal, and failed-download recovery without host reload.

## Findings resolved during the slice

- Initial focused run: three failures in 11 stories. The ReactionBar fixture
  expected its original restricted list; it now declares that list explicitly.
  Full-picker typing through Storybook's shadow-DOM helper did not reach the
  native input; real keyboard search remains covered by Playwright, with native
  pointer selection covered in Storybook and the packed consumer.
- The dark example exposed an axe contrast failure: inherited host RGB tokens
  overrode Emoji Mart's selected mode. The integration isolates those names while
  retaining public sizing, font and hover tokens. Both color modes now pass axe.
- Emoji Mart declarations omit its DOM custom-element base. The adapter types
  that private DOM/update boundary locally; no public type shim or consumer
  compiler relaxation is introduced. Four initial type errors and one subsequent
  story-only query-option error were repaired.
- Full-picker focus exposed Bits UI's light-DOM focus-trap assumptions. The
  full library uses the public non-modal Popover option and owns initial search
  focus plus capture-phase Escape; the restricted grid retains trapping.
  Keyboard selection, trigger focus restoration and reopening are verified.
- Browser iteration initially had two failing cases at a time (focus and
  delayed-load matching, then keyboard-result navigation and Escape). The data
  route now observes the actual bundled JSON request and the keyboard test
  follows the library's selected search result. No product assertion was waived.
- Failed module downloads are cached by the browser, so an in-popup Retry could
  not recover (one deliberately injected failure). The new contract instead
  gives an explicit refresh instruction and Close, protecting host drafts and
  avoiding automatic application reload. Its fault-injection test now verifies
  the mounted host survives dismissal.
- Emoji Mart joins the shared catalog prebundle inventory. Browser lanes and
  spec/package generation are serialized: generated watched artifacts can reload
  a preview mid-test. The review server is paused during verification and will
  return on port 9409.

## Aggregate and package acceptance

`pnpm checks` completed successfully with zero functional, interaction or
accessibility failures (`/tmp/dc-emoji-checks-retry.log`):

- All three specification lanes, formatting, four type lanes (zero errors or
  warnings), and the no-Tailwind source audit passed.
- Unit coverage passed 740 tests across 115 files, plus three Turbo helpers
  and 16 release/package helpers.
- The static Storybook build and visual metadata audit passed; all 704
  Storybook interaction/accessibility tests passed across 218 files.
- Browser suites passed 15 Workspace, 11 Shell, three AI and 65 Shadcn tests.
  One Chromium case intentionally skips WebKit-only overlay behavior; its
  corresponding WebKit case passed. There are no unexplained test failures.

An initial aggregate attempt rejected one compound specification acceptance
bullet; the wording was repaired without changing the contract. A later attempt
stalled in the existing Reference Picker story and was interrupted, rather than
counted as a pass (`/tmp/dc-emoji-checks-final.log`). Its exact fresh target,
`pnpm test:storybook src/shared/forms/reference-picker/ReferencePicker.stories.svelte`,
passed both tests (`/tmp/dc-emoji-reference-cold.log`). The unchanged full retry
above then passed that story and every remaining lane. Reference Picker source
and assertions were not changed.

`pnpm package:local` passed (`/tmp/dc-emoji-package.log`). The prepared archive
audited 209 CSS files with zero remaining utility references. It excludes story
fixtures and includes the generic and compatibility exports and declarations.

- Archive: `.local/packages/lapismd-design-core-0.3.5-built.tgz`
- SHA-256: `51b6774ba5efbfa548b28f606564a5e32a03c790cbec561bd85b85bd9d7e7a4c`

`checkPublicPackageRuntime` from `scripts/check-public-package-runtime.mjs`, run
against that archive and `https://registry.npmjs.org`, passed clean consumer
types and cold development/production acceptance (`/tmp/dc-emoji-consumer.log`).
The fixture uses no Tailwind tooling and verifies fonts, themes, token overrides,
existing primitive/editor lifecycle contracts, full-picker search and selection,
and canonical/compatibility component identity.

Review remains pending in Storybook on port 9409. Responsive Tabs remains the
next review-gated slice. No consumer migration, release or visual baseline
updates are part of this change.
