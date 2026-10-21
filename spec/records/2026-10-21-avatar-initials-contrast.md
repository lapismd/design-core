# Readable initials on custom avatar backgrounds

2026-10-21; source parent `98c64887`; DC-SHA-056 and DC-FORM-047.

Desktop M10 live qualification exposed an accessibility failure in the shared
Avatar used by participant creation and AvatarPicker. Purple `#6e56cf` inherited
`#222222`, producing 2.95:1 contrast. Avatar now chooses the higher-contrast black
or white foreground for opaque three- and six-digit hex backgrounds. Explicit
`--ui-avatar-foreground` overrides still win; other CSS backgrounds retain theme
semantics. No account identity, upload, persistence or public prop is added.

- Desktop before: `MultiRecipient.stories.ts`, Create Named Participant and
  Failed Participant Save fail colour contrast at small and large sizes.
- `pnpm exec vitest run --project unit src/shared/shadcn/avatar/avatar-contrast.spec.ts`:
  12 pass, covering dark/light backgrounds, short hex, unsupported/translucent
  values and missing colours.
- `pnpm exec vitest run --project storybook src/shared/shadcn/avatar/Avatar.stories.svelte src/shared/forms/avatar-picker/AvatarPicker.stories.svelte`:
  15 interaction/accessibility cases pass, including native computed foregrounds
  and an explicit host override.
- First `pnpm checks` fails specification validation because one acceptance
  bullet contained two sentences; corrected without weakening the requirement.
- Second `pnpm checks` (`.local/avatar-contrast-checks-2.log`): specification,
  formatting and all source/consumer type lanes pass with zero diagnostics;
  137 unit files / 859 tests, release/tool checks, static catalog, 256 story
  files / 887 interactions and 16 workspace browser cases pass. Shell has
  10 passes and one 30-second mobile-story readiness timeout, before gestures.
  The aggregate stops there; it is not a passing aggregate.
- `pnpm test:shell:pointer tests/shell/app-shell-mobile-pointer.spec.ts`
  (`.local/avatar-contrast-shell-retry.log`): both cases pass on a cold retry.
- `node --env-file-if-exists=.env scripts/run-turbo.mjs ci:browser-shell --summarize`
  (`.local/avatar-contrast-shell-full-retry.log`): nine pass; both mobile cases
  time out at story readiness. Trace has only Vite connection events and no
  rendered story at timeout. No timeout, assertion or baseline is changed.
- `node --env-file-if-exists=.env scripts/run-turbo.mjs ci:browser-ai --summarize`
  (`.local/avatar-contrast-ai-browser.log`): all three browser cases pass.
- `node --env-file-if-exists=.env scripts/run-turbo.mjs ci:browser-shadcn --summarize`
  (`.local/avatar-contrast-shadcn-browser.log`): 14 pass and two fail before
  stopping the owned run after failures to reduce native-test contention. The
  remaining 136 cases are not qualified (one was interrupted). Failures are
  15-second story-finished waits in top-bar and composer presentation scenarios;
  all six reached Avatar upload/group browser cases pass. This is a failed,
  incomplete lane, not a passing suite.

`pnpm spec:check` passes all three final document lanes after the run record
update (`.local/avatar-contrast-final-spec.log`).

The shell startup failure is unresolved and is not waived by the focused retry.
The Avatar regression itself passes, but required broad qualification remains
incomplete; this record does not claim a fully passing source qualification.

Full checks run because Avatar is shared by multiple independent consumers.
Consumer archive intake and native desktop gates remain separate. Visual
baselines are unchanged and review remains visual-pending. No release or
milestone completion is claimed by this source repair.
