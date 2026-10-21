# Wave 4 release qualification — 2026-10-21

## Scope and authority

The user requested an audit of Design Core workspaces, then its public release.
The existing dependency-first plan requires protected source integration,
public-registry dependencies, nonvisual qualification and immutable publication.
This record owns DC-PKG-009, DC-PKG-011, DC-ARCH-005 and DC-TOOL-003 evidence.
Product milestone statuses and original completion gates remain unchanged.

## Before state and workspace audit

- `jj --no-pager st`: clean default workspace; parent `068a97b0ad90`.
- `jj workspace list` and read-only `git worktree list --porcelain`: only the
  default checkout remains. No secondary active working copy has pending data.
- Eight historical JJ registrations and four generator sandboxes were retired
  by the qualified October 18 reconciliation. The owning record is
  `2026-10-18-workspace-reconciliation.md`; its archive bookmarks and recovery
  inventory remain retained. They are not new pending source work.
- The default source has 68 commits after remote main `9560a62d`, across 519
  files. This is consolidated local work, not yet merged on GitHub. The prior
  footer and transcript reconciliation is included; published history is intact.
- `jj git fetch --remote codex-https`: no remote changes. GitHub has no open PRs,
  including Dependabot. npm latest and latest GitHub release remain 0.5.1.
- Installed Mira and Visual Delta were temporary local archives despite portable
  tracked ranges. Qualification replaces them with registry Mira 0.1.0 and
  Visual Delta 0.0.9; Playwright is aligned at 1.62.1.
- `pnpm release:check`: passed before changes. Changesets selects 0.6.0.

## Attempts and current qualification

- `pnpm up '@lapismd/mira@~0.1.0' @lapismd/storybook-addon-visual-delta@0.0.9 @playwright/test@1.62.1 playwright@1.62.1`: passed.
- First `pnpm checks:release`: stopped at spec-first because removing the manual
  screenshot CI workflow also maps to architecture/tooling chapters. Both
  chapters are now updated; no test assertion or gate was weakened.
- First `pnpm audit --json`: seven findings, all in dev tooling: five Vite
  advisories fixed in 6.4.4+, plus two critical Storybook entries fixed in
  10.6.2+. Patch qualification follows; no new exception is authorized.
- The manual screenshot workflow is removed under the user's explicit request
  to exclude visual tests from CI. Functional and accessibility lanes remain.

Qualification, exact source/PR/workflow identities, artifact checksums and
public-consumer results remain pending. No release is claimed by this record.

The patched Storybook 10.6.3 and Vite 6.4.5 graph passes full and production
`pnpm audit --json` with zero findings. The second release check passes
governance, all four strict Svelte consumer checks and the native-CSS audit.
Its unit suite reports 858 passes and one failure: the editor-boundary test
still asserted that Mira 0.1.0 must be rejected. The range assertions now
require 0.1.0, admit 0.1 patches and reject 0.2, matching the updated package
contract without relaxing the registry-only or ownership assertions.

## Local source qualification

- Exact `pnpm test:unit src/shared/forms/code-editor/editor-shell-boundary.spec.ts`:
  four passes after the range update, one failing case before it.
- Full `pnpm test:unit`: 137 files / 859 tests pass.
- `pnpm test:release`: 16 pass; `pnpm test:turbo`: three pass.
- `pnpm fmt:check`: all matched files pass; changed lockfile also passes its
  explicit Prettier check.
- `pnpm build-storybook`: fresh Storybook 10.6.3/Vite 6.4.5 build passes in
  2m55s. `pnpm workspace:visual:audit`: zero contract errors and zero orphan
  baselines. This audits metadata and runs no screenshot comparison.
- The four strict Svelte checks, governance and native-CSS audit already pass
  against the same production source. The release command's remaining unit,
  release, static-build and metadata stages pass after the narrow test update.
- Full interaction/accessibility and pointer suites are reserved for protected
  hosted CI on the exact release PR, avoiding concurrent heavy local browser
  runs. Their results and final 0.6.0 package qualification remain pending.

No consumer application is restarted and no archived workspace is removed.

The final pre-commit spec check also maps the revised editor-boundary test to
DC-FORM-033. Its owning editor chapter now records the qualified 0.1.0 minimum;
the first attempt failed that missing-chapter gate, then the exact check reruns.

## Versioned candidate

The final preparation spec and release-config checks pass. Preparation source
`f81d8909b179` is committed and pushed on `codex/wave-four-design-core`, with no
main update or publication. `pnpm release:version` consumes all 15 Changesets
and generates 0.6.0 plus its changelog. No published version is edited manually.
The command uses existing GitHub authentication without writing a credential
to the checkout. The versioned spec/config checks pass and the exact 0.6.0
archive qualification is running before publication.

The first 0.6.0 packed check passes archive preparation, independent installed
types and audit classification, then times out on an outdated AuthorCard button
name. DC-SHA-058 requires the visible fallback in that name: `About Archive
author, AA`, while details remain `About Archive author`. Both packed trigger
locators now assert the complete required name; no product or accessibility
behavior, timeout or interaction assertion is weakened. The exact runtime
boundary reruns against the existing archive before the complete pack gate.
The independent consumer has six low propagated entries, rooted only in the
previously accepted KaTeX GHSA-238p-pmpm-9mq7; other severities are zero.

The first direct-runtime retry supplied a relative tarball path, which npm
resolved inside its disposable consumer rather than the repository (install
exit 254). The runner now supplies the absolute archive path; package code and
assertions are unchanged. DC-ARCH-006's obsolete 0.3.0-only prose is synchronized
with DC-PKG-009 and the already recorded October 11 cross-release acceptance;
this adds no advisory or exception and retains independent audit qualification.

## Hosted accessibility qualification

PR #31 is attached at source `4ac484f203a624d0b5492e1d8287d63acf2ff5c7`.
CI `39660230850` passes governance, quality, units, static Storybook, Workspace
and Shell pointer suites and AI browser acceptance. Storybook interactions
report 839 passes / 58 failures in 27 files, all from axe 4.14's existing
`label-content-name-mismatch` rule. The Shadcn pointer lane remains pending.
No failed lane is waived and no screenshot comparison is run.

Shared selected-value, avatar fallback, filter and badge/count names now retain
their complete visible text with their host context. Link Preview uses its
rendered contents for its name; catalog-only rich Column Canvas rows remove
title-only overrides. Fixture action labels match their visible wording.
Selectors follow the changed complete names while preserving state/callback
assertions; the global accessibility rules and deadlines remain unchanged.
The 27 affected files run in a fresh serial browser process, with full hosted
qualification required on the final source. Naming fixes do not change layout,
application routing, persistence, selected values or author authority.

The direct cold-runtime retry with an absolute archive path passes development
and production CSS, fonts, focus, themes, token overrides, TagList actions,
reactive CodeEditor and bound Composer Input teardown without Tailwind or Svelte
diagnostics. Subsequent naming changes require a freshly prepared final archive.

The first focused cold run across all 27 affected files reports 123 passes and
11 failures: eight stale or ambiguous selectors and three deeper naming cases.
After correcting those, the same command reports 131 passes and three Column
Canvas row-query failures. Their full names include descriptions or task IDs,
so selectors now distinguish the exact Composer row from Composer Input/Drawer
and match the visible task key/status/title. The complete Column Canvas rerun
first reports 13 passes and one remaining task query; its exact correction
reruns the same 14 cases. State/callback assertions and all axe checks remain.

Original hosted Shadcn pointer acceptance completes with 152 passes and one
platform-specific skip. The original CI still fails its interaction gate and
correctly skips audits; its Validate result fails. Final-source hosted CI,
including all pointer suites, remains mandatory before merge.

The final exact Column Canvas rerun passes all 14 cases in a fresh process.
Together with the unchanged 26 passing files in the preceding 27-file run,
all affected flows now pass focused qualification. The current spec/config
checks pass, and a fresh full `pnpm packages:pack` is in progress. The release
candidate remains unpublished while final-source hosted qualification runs.
