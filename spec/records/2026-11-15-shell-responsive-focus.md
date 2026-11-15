# Responsive shell focus ownership

15 November 2026. Source change `lovmquuv`, independent clone based on Design
Core main `4b4490b8`, package version 0.13.3. Status: complete source checks and the prepared consumer Storybook lane pass;
hosted PR and registry intake remain separate gates.

## Original failure and ownership

JJ Store PR #86 at `87be3ad6` failed
`ApplicationMenu.stories.svelte > NativeChangeDraftSurvivesMobileToDesktopRelocation`:
the CI shard passed 62 cases and failed one. Escape closed the native Create
change dialog after responsive relocation, but focus landed on the AppShell
root instead of the retained Application menu trigger. The draft and trigger
identity assertions remained intact. The job log is retained task-locally as
`jj-store/.local/pr86-storybook-shard2.log`.

The exact unchanged case also failed alone against JJ Store main `6fdce65c`
using its frozen registry Design Core 0.13.2: 0 passed/1 failed, with six cases
excluded by the exact name filter. Managed Linux report:
`jj-store-validation-28e3bb98-8918-4434-a501-2a90e7415c8a`.

The Design Core controller changed responsive mode through `showMain(false)`.
That method always focuses the shell root, even if main content or a portalled
modal owns focus. Two new direct controller cases reproduced this on current
Design Core main: 2 failed/1 passed before the production repair. Logs remain
at the task root as `design-core-focus-before.log` and `design-core-focus-after.log`.

## Repair and focused source evidence

DC-SHELL-008 makes responsive focus ownership explicit. Mode changes still reset
the transient mobile stage and clear its stale return target. They retain the
existing root focus handoff when focus belongs to a registered panel; main
editors and external portalled widgets keep their focus. No consumer workaround,
public API change, timing adjustment or test assertion weakening is involved.

- `pnpm test:unit src/shared/shell/app-shell/app-shell-mode-focus.spec.ts`:
  before 2 failed/1 passed; after 3 passed/0 failed. Real DOM ownership checks
  cover both modes, a main draft, portalled focus and panel focus handoff.
- `pnpm test:storybook src/shared/shell/app-shell/AppShellModeFocus.stories.svelte`:
  2 passed/0 failed in a fresh Chromium run. Actual viewport changes preserve
  the main input, modal draft, focus and Escape return target. New stories
  retain visual-pending; no baselines changed.
- First `pnpm checks` stopped on a new verification row using unsupported
  status `Planned`; the row now uses the owning schema's `In progress`.
  `design-core-focus-checks.log` preserves that failed attempt. The rerun log
  is `design-core-focus-checks-rerun.log`; it completed successfully (exit 0).
  It passed formatting, four strict type/consumer checks with zero errors or
  warnings, canonical specification/exports, 1,133 unit tests, three Turbo
  regression cases and 37 release-tooling cases, 1,062 Storybook interactions,
  static Storybook/visual metadata, and browser acceptance: workspace 27/27,
  shell 17/17, AI 3/3 and shadcn 196 passed/one platform-selected skip.
  The existing skipped Scroll Area case requires WebKit and is excluded by
  this Chromium project; it is not WebKit qualification.

## Prepared public package and unchanged consumer

`pnpm package:local` completed public declaration/Svelte preparation and browser
CSS preparation (3 compiled, 279 audited, zero remaining utility references).
The owned prepared archive is
`design-core-private-archives/lapismd-design-core-0.13.3-built.tgz` under the
isolated task root, SHA-256
`2d80ca5552020d21529dc5b4535a27f683c765bffbbc68d2cb30e165756818e1`.
It was built from this change's production source before later evidence edits.
The generated archive stays outside the repository and is not committed.

JJ Store's documented ignored verified-archive workflow checks identity and
checksum, projects the package into an isolated frozen install, then restores
tracked manifests before testing. Registry manifests/lockfiles remain unchanged.
Its prepared source pass is distinct from registry or release acceptance.

- Original exact consumer story: 1 passed/0 failed, six cases name-filtered;
  report `jj-store-validation-20f98e13-7a42-4f93-861c-1045dbf6aed8`.
- Complete unchanged ApplicationMenu family: 7 passed/0 failed;
  report `jj-store-validation-32934580-04ee-437b-ad46-908e3de63dfb`.
- Complete managed consumer Storybook lane: 1,047 passed/0 failed/two existing
  quarantines across four fresh shards (273+284+238+252), exit 0. Report
  `jj-store-validation-16afad75-5475-4186-b0b3-97ec6d5b742d`. The existing
  Q-STORY-001/002 quarantines remain unchanged and unqualified.

This establishes the source of the PR failure without adding an application
focus override. Source and prepared-package tests do not qualify another OS,
Tauri, installed apps, all other consumers or registry intake. Package
publication and registry updates still require separate user authorization.

## Landing and release gates

The pre-push GitHub query found no open Design Core Dependabot PRs; no empty
dependency consolidation was created. A patch Changeset records the fix without
publishing or changing package versions. Complete `pnpm checks` and the unchanged
consumer lane above pass; final evidence-only specification/formatting is checked
before the source commit. Original failed runs remain retained. Native app,
other-platform and registry qualification are not inferred from Chromium passes.
