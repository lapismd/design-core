# Released Mira minimum and zero-finding packed audits

This DC-PKG-009, DC-ARCH-005 and DC-GOV-010 slice starts from current main
`8e9b3f295ab151fb2f44661a55ccaa0527f3e524` after verified Core 0.7.3 publication.
It consumes the released Mira math repair through normal npm resolution and
removes the Core packed-audit exception that the repair makes obsolete.

## Published source prerequisite

Mira source PR #26 and bot Version Packages PR #27 are merged. The bot PR was
reviewed in full and formally approved at exact head
`13539eabd01992f6296b2fc7d2d9c5ac68705582`; all three required jobs passed before
the checked merge. Merged source
`6658fe563b6ff725a931d339abca727c10263420` then passed main CI and production
release run `41205035585`, including clean installation, signature/provenance
verification and automatic tag/GitHub release creation.

`@lapismd/mira@0.1.4` is actually available on npm as `latest`. Its registry
tarball is byte-identical to the verified immutable artifact: 356854 bytes,
SHA-256 `d2c16137900f9512527c699206a5294a3a7ad593f1f59e0f7b7347bd3053ed3e`.
Independent Sigstore verification binds the package to that exact source,
`.github/workflows/release.yml@refs/heads/main` and run `41205035585`.
A fresh registry install reports zero vulnerabilities; signature verification
reports zero invalid and zero missing signatures and confirms Mira's SLSA
provenance. Tag `mira@0.1.4` points to that exact source.

## Policy and regression

The Core manifest requires `~0.1.4`. Mira's public math behavior and imports are
unchanged; its adapters are private and patched KaTeX 0.18.10 remains explicit.
Core's packed production graph must now contain zero findings. The former
`GHSA-238p-pmpm-9mq7` propagation chain is rejected at every package version.
Mira's distinct Mermaid 11/layout-ELK cohort acceptance does not transfer here.
Raw audit reports, invalid-response checks, count consistency and failed-command
checks remain blocking. No consumer override, copied adapter or dependency
source edit is introduced.

Before the policy repair:

```sh
node --test --test-name-pattern='rejects the former KaTeX exception' scripts/packed-audit-policy.test.mjs
```

One exact regression fails with `Missing expected exception`, because the old
policy still accepts the low-severity KaTeX chain. The original log remains at
`/tmp/lapis-core-fixed-mira-validation-20261031/former-exception-source-before.log`.
The same exact target, all audit-policy guards, complete nonvisual checks and
cold public-package qualification remain required after the change.

After the repair, that exact target passes one case and the complete audit
policy passes all seven cases. All 17 policy, local-archive and release guards
pass. The first specification gate identifies the missing mapped Tooling
chapter; updating its current audit contract repairs that one governance
failure. Canonical validation, mdBook and spec-first then pass all three lanes.
Original logs remain retained. The registry lock resolves Mira 0.1.4 with the
same independently verified SRI and removes the external math-adapter graph.

The first immutable Linux source `b4673208` passes the frozen registry install,
all Bits postimages, all 17 release/policy guards, explicit spec-first and all
32 cases in the unchanged four story families. Its full aggregate then finds
919 passing units and one stale editor-boundary expectation that still permits
Mira 0.1.2. The exact named unit reproduces that one failure before editing.
The strengthened guard now rejects 0.1.2 and 0.1.3, accepts 0.1.4 and a compatible
0.1.5, and preserves all existing public-package/no-sibling/no-aggregate checks.
That exact named unit passes after the change. The original worker and narrow
logs remain retained; the full combined suite and package gate must run again.

## Preservation and remaining gates

The release remote is fetched. All 23 registered workspaces and 14 available
roots retain their prior inclusion, equivalence or deferral dispositions;
independent Canvas Table, public icon-service and Notebook work remains separate.
Other registered heads and protected runtime files are unchanged. The stale
diagnostic checkout and missing roots are preserved. Open Dependabot count is
zero. The retained pre-edit receipt is
`/tmp/lapis-core-fixed-mira-validation-20261031/pre-edit-workspaces.json`;
pre-push and pre-release checks must be refreshed.

The checksum-bound Bits UI 2.20.2 patch is unchanged at
`debd3bc7d43917f0967f0cc1e212fc5c7721c751d3b92bf8f31030d1c96289ad`.
Qualification must verify every installed postimage, the unchanged four-family
32-case boundary, full `pnpm checks` and `pnpm packages:pack` against the frozen
registry graph. First-party compiler warnings and all browser runtime
diagnostics remain fatal. Source/version PR checks and actual publication are
separate pending gates; no archive-only result satisfies downstream acceptance.

## Paused at the user's request

On October 31 the user requested a pause after saving pending source and the
tracker. The second immutable run at
`5c328c129f04995e3b2a2bcf8bb9820a4c962f4e` is intentionally stopped during the
four-family Storybook phase. The owned container
`codex-core-fixed-mira-5c328c129f04` exits with signal status 143 at
13:35:16 UTC; it is stopped, retained and not a passing qualification.

Before that stop, the new frozen registry install, all Bits postimages, 17
release/policy guards, the exact editor-minimum regression, all four editor
boundary units, browser provisioning and explicit spec-first pass. The first
source's 32-case family pass remains evidence for its stated earlier input;
the corrected combined source still needs the complete family, `pnpm checks`
and `pnpm packages:pack`. Neither source/version PR merge nor Core publication
has occurred. The original failed run and interrupted second run are retained
separately under `/tmp/lapis-core-fixed-mira-validation-20261031/` and
`/tmp/lapis-core-fixed-mira-validation-20261031-r2/`. The interrupted raw result
still says `running` because SIGTERM prevented finalization; the container exit
and driver log record the explicit user-requested stop.

Pending source is saved on a dedicated WIP branch. Resume only when requested:
fetch current main, recheck workspace/dependency disposition, start a new owned
immutable run with a new output directory, finish the required qualification,
then use the normal reviewed source and bot-version PRs before exact-source
publication. The published Mira 0.1.4 prerequisite is complete.
