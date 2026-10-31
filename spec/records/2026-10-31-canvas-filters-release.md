# Design Core 0.8.0 release record

## Scope and authority

On 2026-10-31 the user requested full verification, a GitHub PR/push and a new
release. They explicitly selected the existing default-workspace Button and
Column Canvas fixes plus Canvas Table and standalone Filter Builder. Other
workspaces are outside this release. The local checkout must match the pushed
source. Temporary cleanup is limited to canvas-table and structured-filters.

Feature PR: https://github.com/lapismd/design-core/pull/49.
Initial pushed source: 892ca102ea181aa7ba76933b9115a33bde33a6bf.
Base main: 30a5c8835afe1275c029da3c5ae8cbf11149a46d (0.7.4).
Two minor Changesets select 0.8.0. No plugin migrations or visual baselines.

## Preflight

`jj git fetch --remote release-https` refreshed release history before release.
Registry `pnpm view @lapismd/design-core version --json` reported 0.7.4. GitHub
queries before push found 0 open Dependabot PRs, so no consolidation PR was
needed. PR #49 is the only newly opened feature PR. Recheck dependency PRs before
any later push. Source qualification and publication are separate gates.

All registered workspaces are inventoried below. Live located workspaces were
inspected with `jj --no-pager st`; they are clean. Linux release read-only
workspace is stale and retained untouched. Legacy registrations with no recorded
root were compared through their stored empty working-copy revision; no live
root was located among sibling repositories and /private/tmp. A non-ancestor
classification does not imply an uncommitted file change. User-selected release
scope excludes all unrelated work and keeps every other registration intact.

| Workspace                    | Recorded revision | Status                                     | Release disposition                          |
| ---------------------------- | ----------------- | ------------------------------------------ | -------------------------------------------- |
| canvas-table                 | 9742084b09e1      | Clean                                      | Included                                     |
| catalog-package              | 7b90b0445bb4      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| column-fit-contents-20261025 | 8943f1e3c285      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| composer-lifetime            | 73f6ce620093      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| composer-package-20261025    | c032a7cda146      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| default                      | 95521fa03c89      | Clean                                      | Included                                     |
| design-core-sv-bump          | 9957936d495b      | Clean                                      | Included                                     |
| desktop-composer             | 3a1d4b8ae0f6      | Clean                                      | Included                                     |
| docker-validation            | dd0470ee517c      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| json-highlighting-20261030   | b3f5754f0f07      | Clean                                      | Not ancestor; retained outside release scope |
| linux-release-ro-20261031    | 1516969ccc7c      | Stale; retained untouched                  | Not ancestor; retained outside release scope |
| linux-ro-20261031            | 3a9202401e90      | Clean                                      | Not ancestor; retained outside release scope |
| mira-012                     | 5b22758b1b06      | Clean                                      | Included                                     |
| notebook-release             | cc0526bf24e4      | Clean                                      | Not ancestor; retained outside release scope |
| notebook-status              | 664295f46e39      | Clean                                      | Not ancestor; retained outside release scope |
| picker-contrast-20261026     | 36ae3e01290e      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| plugin-file-icons            | c6c3772006a7      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| release-metadata-20261030    | 3fe54b0e5ff3      | Clean                                      | Not ancestor; retained outside release scope |
| release-verify-20261030      | 5649ebb4f83c      | Clean                                      | Included                                     |
| reply-baseline-20261030      | de77e0d5ca62      | Clean                                      | Included                                     |
| required-release-20261031    | a860b3fab13b      | Clean                                      | Included                                     |
| structured-filters           | de0f8b814b03      | Clean                                      | Included                                     |
| swipe-lifetime-20261025      | f692cce4d942      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |
| swipe-package-20261025       | f2971304d7e8      | Recorded empty workspace; root not located | Not ancestor; retained outside release scope |

## Qualification and delivery

Final combined-source exact command:
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 pnpm checks`.
The full combined-source command exits 0: 1,071 unit cases, 38 tooling cases,
1,022 Storybook cases, 219 browser passes and 1 intentional platform skip.
All functional, interaction and accessibility failure counts are 0. `pnpm packages:check` and `pnpm packages:pack` pass,
including a zero-finding production audit and cold clean public consumers.
The isolated standalone/table consumer command is
`node .local/qualify-canvas-filters.mjs`; retain its final log separately.

Follow the normal Changesets Version Packages PR and protected trusted-publishing
workflow after local and required GitHub checks pass. Verify the installed npm
version, package exports, integrity/provenance and GitHub release before claiming
publication. Do not bypass failed checks or the production environment gate.

## Stored-content comparison

Beyond ancestry, each divergent workspace was compared with the candidate by
its changed-file contents from the common base. Exact matches are counted below;
different or older files remain outside the user-selected release. A divergent
snapshot is not silently integrated. Notebook history without one unambiguous common base is
retained without claiming equivalence.

| Workspace                    | Content disposition                                       | Identical changed files | Changed files compared |
| ---------------------------- | --------------------------------------------------------- | ----------------------- | ---------------------- |
| canvas-table                 | Included by ancestry                                      | 0                       | 0                      |
| catalog-package              | Different/older committed content; excluded by user scope | 1                       | 78                     |
| column-fit-contents-20261025 | Different/older committed content; excluded by user scope | 9                       | 114                    |
| composer-lifetime            | Different/older committed content; excluded by user scope | 3                       | 97                     |
| composer-package-20261025    | Different/older committed content; excluded by user scope | 1                       | 95                     |
| default                      | Included by ancestry                                      | 0                       | 0                      |
| design-core-sv-bump          | Included by ancestry                                      | 0                       | 0                      |
| desktop-composer             | Included by ancestry                                      | 0                       | 0                      |
| docker-validation            | Different/older committed content; excluded by user scope | 1                       | 78                     |
| json-highlighting-20261030   | Different/older committed content; excluded by user scope | 17                      | 29                     |
| linux-release-ro-20261031    | Different/older committed content; excluded by user scope | 18                      | 34                     |
| linux-ro-20261031            | Different/older committed content; excluded by user scope | 17                      | 31                     |
| mira-012                     | Included by ancestry                                      | 0                       | 0                      |
| notebook-release             | Divergent history; excluded by user scope                 | 0                       | 0                      |
| notebook-status              | Different/older committed content; excluded by user scope | 6                       | 9                      |
| picker-contrast-20261026     | Different/older committed content; excluded by user scope | 10                      | 118                    |
| plugin-file-icons            | Different/older committed content; excluded by user scope | 10                      | 128                    |
| release-metadata-20261030    | Different/older committed content; excluded by user scope | 26                      | 56                     |
| release-verify-20261030      | Included by ancestry                                      | 0                       | 0                      |
| reply-baseline-20261030      | Included by ancestry                                      | 0                       | 0                      |
| required-release-20261031    | Included by ancestry                                      | 0                       | 0                      |
| structured-filters           | Included by ancestry                                      | 0                       | 0                      |
| swipe-lifetime-20261025      | Different/older committed content; excluded by user scope | 8                       | 105                    |
| swipe-package-20261025       | Different/older committed content; excluded by user scope | 8                       | 105                    |

The final functional-source archive (0.7.4 package metadata before Changesets
versioning) has SHA-256 `364f677507f7d4d7573c9f032727aa9f12c8761c92686c43532b605252de0533`.
It is qualification input, not the future 0.8.0 publication artifact. Publication
will use the workflow-produced exact-source 0.8.0 archive.

The Changesets CLI status command cannot find Git HEAD in this non-colocated JJ
workspace. The installed CLI reader/config/assembler APIs independently confirm
oldVersion 0.7.4, type minor, newVersion 0.8.0, and both minor Changeset IDs.
No package files were altered to compute this plan.

## Feature PR merge

The user explicitly requested merge after all 11 required GitHub checks passed.
PR #49 was merged with expected head
892ca102ea181aa7ba76933b9115a33bde33a6bf, producing
`db893ff770248acd7b5be1346980c0b60220b9d6`. GitHub CI run
[41230710139](https://github.com/lapismd/design-core/actions/runs/41230710139)
passes all 11 required contexts, including dependency audits and aggregate Validate.
The remaining local Shadcn lane continues; publication remains gated on its
completion. Release workflow [41231721881](https://github.com/lapismd/design-core/actions/runs/41231721881)
is creating the normal Version Packages PR. No direct main push or publication
bypass is used.

## Version PR

[PR #50](https://github.com/lapismd/design-core/pull/50) consumes both minor
Changesets and selects 0.8.0. The generated diff changes only package metadata,
changelog and consumed Changesets. This follow-up adds final evidence and
records the two included local fixes in the release notes. No runtime code or
dependency graph changes are added at versioning. Run focused formatting and
specification checks, then retain all required PR checks before merge. The
protected artifact, npm-production publication, clean install/integrity/provenance
verification and GitHub release jobs must pass before declaring publication.

Version-record focused commands pass: changed-file `pnpm exec prettier ... --write`,
`pnpm spec:first` (no protected runtime files changed), `pnpm spec:check` (all
3 lanes), and `pnpm packages:check`. Runtime source and dependency graph are
unchanged from the fully qualified feature source. The version PR keeps all
11 required GitHub checks before merge and all protected release artifact lanes
before publication.
