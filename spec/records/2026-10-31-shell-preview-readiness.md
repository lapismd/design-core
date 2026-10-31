# Hosted Shell preview qualification

Requirements: DC-SHELL-002, DC-WS-034, DC-WS-050, DC-TOOL-003.

Current-head Core PR #42 source `3faf01f7` reports 993 Storybook passes and one
failure in `AppShell.stories.svelte > NestedProjectAndFileSidebars` during CI
run `41188942555`, job `124501542538`. An inline-presentation assertion receives
`overlay`. The generated story source location does not identify which of the
three dismissal phases failed. Full diagnostics are retained in
`/tmp/lapis-core-pr42-storybook-failed-20261031.log`.

The candidate retains all original attributes, geometry, focus and timing
assertions and adds distinct assertion context for initial inline presentation,
edge departure, short-hover cancellation and selection-followed dismissal.
Exact cold Linux repetition and affected-family/catalog qualification remain
required before a repair can be committed and pushed. No failed hosted gate is
retried or waived, and the PR remains unmerged.

Read-only review identifies a missing final selection precondition: the story
schedules preview dismissal immediately after an option click/text change.
Sidebar's document `focusin` intentionally calls `keepPreview` for its owned
selector, cancelling a pending dismissal. Legitimate late Select focus
restoration can therefore cancel that scheduled timer. Before the unchanged
`schedulePreviewDismiss(0)`, the candidate requires physical option removal,
restored selector focus and completed pointer admission under the existing
default deadline. All original timers, focus/geometry and inline/overlay
assertions remain. Earlier edge and short-hover phases are unchanged; their
failure has not been reproduced.

## Problems quick-fix keyboard ownership

Five independent cold invocations of the original exact Shell target pass.
The context-only diagnostic source `e91d43a2` passes the exact Shell case and
all 16 App Shell stories, then its complete catalog reports 993 passes and one
failure in `WorkspaceProblems.stories.svelte > BottomPanel`. The quick-fix menu
remains open after Escape. Its trigger currently stops propagation for every
keydown, including Escape before focus moves into the menu. The old story
cleanup also manually removes dropdown nodes and clears document locks; those
mutations cannot qualify real dismissal.

The new exact `QuickFixEscapeFromTrigger` regression opens the real production
quick-fix with Enter, retains the no-row-navigation assertion, dispatches Escape
at its opening trigger and requires actual portal removal plus released pointer
admission. The before target must fail before the owning keyboard handler is
repaired. Source receipts remain under the `sidebar-diagnostic` results sibling.

Cold Linux before source `99c9bde5` fails that exact new regression once, with
six intentionally filtered cases: Escape leaves the real menu `data-state=open`
and physically mounted. The repair lets only Escape bubble from the trigger;
all other keyboard propagation and pointer/activation handling remain unchanged.
The shared Problems story helper now uses Escape, captured portal removal and
pointer-release assertions instead of mutating DOM or document locks. Exact
regression, all seven Problems stories, Shell family/catalog and complete owner
qualification remain required after this production correction.

## Corrected owner and host qualification

Immutable production source `c6ea034a668ae0c38d2c7b160217d2abe759bd3d` passes
the same exact Escape regression, all seven Problems stories, five independent
cold NestedProjectAndFileSidebars invocations and the complete 16-case Shell
family. Its uncached complete aggregate passes 920 units, 995 catalog/axe cases,
all four strict surfaces with zero errors/warnings, formatting/spec/static,
Workspace 16, Shell 17, AI three and Shadcn 153 browser cases with one existing
platform skip. The complete aggregate exits zero, with no cached lanes or
flaky/retried cases. The following exact public-package command also passes:
three installed patch postimages, clean strict types and cold development/
production runtime behavior in both themes have no Svelte diagnostics. The
existing advisory-specific low KaTeX acceptance remains explicit for six
affected packages; no new exception is introduced.

The retained-source prepared archive is kept separately from the earlier
candidate under `qualified-popup-artifact`, SHA-256
`fc8b527931d01efc94b64076689de52d9abb79c00c67e3eb32057a69f360bea9`.
Its pre-version manifest still says 0.7.2; these bytes are not npm 0.7.2 and do
not satisfy final registry consumption. Earlier candidate archives remain intact.

The regression additionally checks both tree and table production hosts at
source `3786f4e2b25f1bb318ec0baaac66a8c4ee02a6b7`. Only the excluded story
file changes from the production candidate: runtime source, manifests, frozen
lock and shared patch remain identical. That exact target, all seven Problems
stories, four strict checks, all 995 catalog/axe cases, static Storybook and
specification pass. This strengthens the host coverage without repeating
unrelated already-green runtime lanes. Receipts remain under
`/tmp/lapis-core-tracked-patch-validation-20261031/{popup-after,problems-hosts}/results`.

The popup-after driver's human-readable source description was copied from the
previous packaging worker. Its exact source commit, verified immutable bundle
and frozen graph identify the corrected production code above; the stale
description does not imply that the Problems runtime is unchanged from `97d`.
Original raw receipts remain intact. Protected current-head PR checks, version
review and actual publication remain separate gates.

Final pre-push HTTPS fetch leaves main at `3ee2b016`. All 23 registered
workspaces remain accounted for, with 14 available roots and no new
registrations or other changed heads. The retained stale Linux diagnostic
checkout stays untouched; its registered revision is read without updating the
working copy. Full inventory:
`/tmp/lapis-core-popup-final-workspaces-20261031.json`.
Open Dependabot count is zero. Fresh production/full pnpm audits both exit zero,
with zero advisory records; production has zero vulnerabilities, and full
metadata retains the existing low count under the unchanged policy. Raw audit
JSON remains in `/tmp/lapis-core-popup-audit-{prod,full}-20261031.json`.

## Version-candidate forced cleanup

Source PR #42 merges after all 11 hosted checks pass on `b70aff4c`; main
`14618457` also passes all 11. The three-file 0.7.3 version candidate `2b4b61f2`
then reports 994 passes and one repeated NestedProjectAndFileSidebars failure
in run `41192239991`, job `124511467680`. Raw diagnostics remain in
`/tmp/lapis-core-version45-storybook-20261031.log`. The DOM matcher discards its
optional expect message, so the generated source location remains ambiguous.

The owning public controller explicitly distinguishes cancellable
`schedulePreviewDismiss` from immediate `dismissPreview`. The final phase
already proves the preview remains open through selection, then performs forced
cleanup before keyboard expansion/closing. It now uses `dismissPreview` for
that intended action. All selector settlement, zero-tick, state/geometry and
focus assertions remain; earlier 160/100/260/620-millisecond hover phases still
verify delayed departure and cancellation. No production implementation,
dependency, timeout, retry or visual baseline changes.

The four inline assertions retain the same DOM matcher through one local helper
that rethrows phase and public controller state on failure. Exact cold target,
complete Shell family/catalog, strict/static/spec checks and fresh current-head
protected version CI remain required. The version PR is unmerged until green;
this test-only correction does not claim that the prior version run passed.

The initial isolated setup source `9bbf8931` stops at explicit spec-first before
any test runs: the mixed version/test diff also requires the mapped architecture
and package chapters. Those chapters now describe the unchanged runtime/graph
and the existing immediate cleanup contract. The guard remains intact; its
failed setup receipt is retained under `version-preview/results`.

Corrected version source `130b80f6a31afba1e988b55d33e3407924e116ab` passes ten
independent cold exact Nested runs, all 16 Shell family cases, all 995 catalog/
accessibility cases, four strict surfaces with zero errors/warnings, the static
Storybook build and canonical checks. Reports remain under
`version-preview-r2/results`. Production/runtime, dependency and frozen-lock
bytes remain unchanged from the reviewed version candidate. The updated
version PR still requires fresh current-head hosted checks and a new approval
before merge and actual publication.

## Verified 0.7.3 publication

The preceding pending statements describe their historical checkpoints. Source
PR [#42](https://github.com/lapismd/design-core/pull/42) and version PR
[#45](https://github.com/lapismd/design-core/pull/45) are now merged. The complete
version diff is reviewed and formally approved at
`02bccb71aee8fe82101c0d95fb689bdd19302f1a`; CI
[`41194051276`](https://github.com/lapismd/design-core/actions/runs/41194051276)
passes all 11 checks, including all 995 interaction/accessibility cases and
153 Shadcn browser passes with the existing single platform skip. PR #45 merges
at `1ff36f37c165a3496be4826be48b048fc812e38e`, whose tree equals that reviewed
head. Main CI
[`41194948181`](https://github.com/lapismd/design-core/actions/runs/41194948181)
also passes all 11 checks.

Release workflow
[`41194948225`](https://github.com/lapismd/design-core/actions/runs/41194948225)
passes all five jobs: version planning, verified artifact, protected trusted
publication, clean registry install/signatures/provenance, and tag/release.
The downloaded manifest binds the artifact to that exact merged source.
Independent registry download equals the approved artifact byte for byte:

- Package: `@lapismd/design-core@0.7.3`.
- Tarball SHA-256:
  `4c07fdaa8fecc6d7f1ede2f03f89b5afb0728dae82b25dc0e55ec6ddda7ab6ca`.
- Registry integrity:
  `sha512-mXDhs+c6kdMZ8E3krwXTxzVavb/b4UVEVrNDlM3eQ6ILgfeOHeFiXfrP29QKZ2JXAIKwcqDPIS3WNElL94fH3w==`.
- Registry SHA-1: `57737d2537067cb532408db987b5039a86ee0311`.
- `npm audit signatures --json --include-attestations`: 44 verified packages,
  zero invalid and zero missing signatures. Core has both npm publish and SLSA
  v1 attestations. The decoded SLSA subject SHA-512, resolved source commit,
  canonical repository, `.github/workflows/release.yml` and invocation
  `41194948225/attempts/1` match the manifest and registry bytes.
- Public tag `design-core@0.7.3` and
  [GitHub release](https://github.com/lapismd/design-core/releases/tag/design-core%400.7.3)
  (`429885999`) target the exact merged source, with no draft/prerelease flag.

The first independent metadata probe returns 404 after the successful publish;
the full packument exposes a cached pre-publication snapshot with a 300-second
TTL. The unchanged bounded verifier subsequently succeeds. No rerun, retry
increase, assertion change or acceptance waiver is used to finish publication.
Receipts, original publish diagnostics, downloaded artifact, registry metadata/
tarball, decoded provenance and signature report remain under
`/tmp/lapis-core-073-published-receipt-20261031`.

The actual registry artifact contains `patches/bits-ui@2.20.2.patch` and
`patches/manifest.json`. The payload remains SHA-256
`debd3bc7d43917f0967f0cc1e212fc5c7721c751d3b92bf8f31030d1c96289ad`, with
all three qualified postimages. Each consumer still configures its own explicit
version-bound patch and frozen lock; dependency metadata does not propagate it.

The packed-consumer audit retains the existing six low propagation rows ending
solely in KaTeX GHSA-238p-pmpm-9mq7. The
[2026-10-11 acceptance](2026-10-11-known-katex-acceptance.md) and DC-PKG-009
remain unchanged: remove that Core-only packed-audit acceptance when upstream
math ranges admit patched KaTeX. It grants no exception to any consumer audit.
Full production-audit JSON remains alongside the release manifest.

Release preflight rechecks all 23 registered workspaces, including 14 available
roots. Other workspace heads remain unchanged; missing roots and the stale
read-only Linux checkout remain untouched. Open Dependabot count is zero.
The refreshed inventory is
`/tmp/lapis-core-version45-workspaces-20261031.json`.

## Remaining consumer and upstream acceptance

The actual release identities are handed to the Plugins/Desktop, Tasks and
Agent UI/Repository UI owners for their final registry cohorts. Those checks
remain governed by the owning consumer specifications and audits. Prepared
archives and Core's successful publication do not prove those consumers.
Removing the temporary Bits patch still requires a released upstream version
with all retained repairs plus the exact and complete unpatched source/public/
consumer checks. Deferred Canvas Table, icon-service API and independent
Notebook work remain outside this release.
