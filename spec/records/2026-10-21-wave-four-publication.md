# Design Core 0.6.0 public publication

## Scope and unchanged contract

The user explicitly requested auditing Design Core workspaces for unmerged data,
then releasing this repository next. DC-PKG-009/011, DC-ARCH-005/006 and
DC-TOOL-003 remain unchanged: public registry dependencies, complete nonvisual
qualification, protected integration, independent archive inspection, immutable
publication and clean public consumers. Existing product milestone gates remain
unchanged. Screenshots and baseline updates are excluded by the user's prior
instruction; interaction, accessibility and browser gates remain required.

Preparation and failed attempts remain in `2026-10-21-wave-four-release.md`.
The Desktop coordinator and E-RELEASE-017 retain cross-repository state. This
library release does not complete Desktop installation, signing, upgrade,
rollback, Deno retirement or later release waves.

## Workspace and source proof

- `jj --no-pager st`, `jj workspace list` and read-only
  `git worktree list --porcelain`: one clean active default checkout.
- The October 18 reconciliation includes retired workspace changes by ancestry
  or recorded equivalent implementation; its tracked archive bookmarks remain
  present. The retirement record documents preserving ignored artifacts and 57
  verified generator inputs. A fresh probe cannot resolve the old recovery path,
  and macOS denies listing `~/.Trash` with EPERM, so current recovery contents
  are unverified. This does not establish deletion. No archive is modified or
  deleted in this release, and the complete retired source reconciliation is
  already in the released tree.
- `jj git fetch --remote codex-https` and GitHub PR inspection refresh main;
  there is no open Dependabot proposal to consolidate.
- Protected [PR #31](https://github.com/lapismd/design-core/pull/31) at
  `027c17574e8e530a1c13297108daf942f03d14c5` passes all eleven required checks in
  [CI 39664953890](https://github.com/lapismd/design-core/actions/runs/39664953890).
  Storybook interaction/axe: 897/897 across 258 files. Shadcn pointer: 152 pass,
  one existing platform-specific skip. All other functional lanes and both
  workspace audits pass. No failed gate is waived.
- `gh pr merge 31 --auto --merge --match-head-commit 027c17574e8e530a1c13297108daf942f03d14c5` initially reports
  automatic merge disabled and changes no state. After all gates pass,
  ordinary protected `gh pr merge 31 --merge --match-head-commit 027c17574e8e530a1c13297108daf942f03d14c5` succeeds
  at `5bae94975c9923d15f1bcf52609958fa28b82ab9`.
- `jj diff --from 027c1757 --to 5bae9497 --summary` is empty: merge and tested
  source trees match exactly. Fetch advances local main; `jj new main` moves
  the default workspace onto integrated main without rewriting public history.

## Publication qualification

[Release workflow 39667451267](https://github.com/lapismd/design-core/actions/runs/39667451267)
passes all five jobs, including hosted source/package checks, protected trusted
npm publication, clean registry installation and signature/provenance verification,
then public GitHub release creation. Exact-main CI `39667451520` also passes all
eleven required checks. Hosted release units pass 859/859 across 137 files.

- Package: `@lapismd/design-core@0.6.0`; public npm latest is 0.6.0.
- Artifact: `design-core-release-5bae94975c9923d15f1bcf52609958fa28b82ab9`,
  ID `12378706645`; 1,755,798-byte npm archive / 4,184 files.
- Tarball SHA-256:
  `240a578240d2055a922c92f15a17f6aeb2b8b69a9aad04f78fd34cee6d013a2b`.
- npm integrity:
  `sha512-xLZssOtMmjptLwIX+DondoV6SDR4bKxSumLBxCseq0WimssAB4/Y+SfcppI2TAcc8wUCVHplgTEAU5yK9c2PbA==`.
- Release-manifest SHA-256:
  `372c8c8c6532e7c2ee44042cad7dbd9ecd27d7b64028b8520840c59e580418fc`.
- Downloaded hosted archive inspection verifies manifest/source binding, every
  checksum, 292 export targets, Apache-2.0 metadata and matching license,
  font/syntax notices, portable registry dependencies and omission of repository
  internals/test fixtures. All 4,184 files and permissions match the qualified
  local package; only archive encoding/compression differs.
- `checkPackedAudit` accepts only the existing low KaTeX
  GHSA-238p-pmpm-9mq7 propagation through six affected packages. The first local
  audit-evaluation invocation had an extra closing parenthesis; the corrected
  invocation passes. This is a verifier invocation error, not a waived gate.
- The existing user request explicitly approves this wave. After inspection,
  the protected npm-production deployment `7236284840` is approved through the
  pending-deployments API. Credentials remain in GitHub OIDC; no local npm login
  or bootstrap token is used.
- Publication receipt records success at 20:18:07 UTC and Sigstore transparency
  log index `3363421274`. Initial public version requests return 404 and npm
  latest briefly remains 0.5.1 while processing; subsequent verification
  succeeds without republishing bytes or moving tags.
- An independent registry download matches the approved archive byte for byte,
  including SHA-256, SHA-512 integrity and SHA-1 shasum. SLSA v1 subject SHA-512
  and source match the exact manifest. Two npm package signatures are present;
  hosted `npm audit signatures --include-attestations` verifies 45 graph
  identities with zero invalid or missing signatures. Signature evidence is
  retained in artifact `12378503272`.
- [GitHub release](https://github.com/lapismd/design-core/releases/tag/design-core%400.6.0)
  is public, stable and non-draft at 20:21:18 UTC. The tag points to the exact
  approved main `5bae94975c9923d15f1bcf52609958fa28b82ab9`.

## Public consumer and documentation closure

The independent public archive is passed as an absolute path to
`checkPublicPackageRuntime` from the owning release script. Fresh installed
consumer types pass; cold development and production CSS, fonts, focus, themes,
token overrides, TagList overflow/actions, reactive CodeEditor and bound Composer
Input lifecycle pass without Tailwind tooling or Svelte diagnostics. The exact
log is `/private/tmp/design-core-wave4-public-consumer.log`; registry inspection,
manifest, archive and signatures are retained under the temporary
`design-core-wave4-hosted.htsuGQ` evidence directory.

`pnpm exec prettier --check spec/records/2026-10-21-wave-four-publication.md`
and `pnpm spec:check` pass. This completion slice changes only Markdown evidence;
no product tests are rerun locally for it. Its protected documentation PR retains
normal hosted checks. Product milestones and deferred application adoption keep
their original gates; all required 0.6.0 public library gates are now complete.
