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
