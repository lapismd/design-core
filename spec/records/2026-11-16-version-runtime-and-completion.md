# Qualified version runtime and completion wake-ups

This source slice adopts existing reviewed shared contracts. It changes no
product code, package graph, Changeset, CLI major, Node/pnpm setup, frozen
install, Deno prerequisite, audit policy or publication approval.

## Actual whole-recipe qualification

[Hosted proof 43795242917](https://github.com/lapismd/lapis-ci/actions/runs/43795242917)
completed successfully on shared helper source
`6511f29ec5ecd5f5dd0bd90287e3f7761e6886a3`. Node24.15.0,
pnpm10.32.1 and CLI3.0.3 executed with Deno absent before and after the actual
recipe. No writer App was minted and nothing was published.

Core's genuine immutable pending source was
`1c5692bb840cce4e0541a29e5876838f483b6000`, with
`.changeset/responsive-shell-focus.md` SHA256
`86fc9149f91a595b37795fdddc2b7209f9e2185b286ccdfa3b65cc4ddff7a0fa`.
It prepared the actual public root package0.13.3→0.13.4, changed its changelog
and consumed the note. This is historical source proof, not a new release.

Current main `9cf94b7ce62d679aca77d6d5c65fe84405f086b9` has the same
lock, config, command, formatter and workspace-policy bytes. The root manifest
differs only in its own version0.13.3→0.13.4; all remaining parsed fields match.
Raw package SHA256 is `555d756b7e0347b55cf6bb73bba2aa5715deb88ce14a39522d3fd648016a3647`
at the proof source and
`c0e3b78d868269d5f1617bd48541d05b0d8521f14e6312264897fcb23ed4e133`
at current main. Lock SHA256 is
`ca42f7edc61718dd7a7646c93199d2d78164953d208018c186406bb911d588ba`
in both contexts. The exact command remains
`changeset version && pnpm install --lockfile-only && prettier package.json CHANGELOG.md --write`.

The downloaded receipt SHA256 is
`2cdd38919330cb37dc6f5cbd5020bca014d0c4c5cc8eec88c1309aa05ab05d71`.
It remains in local evidence outside the checkout, not tracked source.

## Adoption and authority

`.github/versioning-runtime.json` contains the exact successful receipt's
input bindings. The reviewed shared guard is pinned to that same helper source
and runs under the existing canonical-main push condition before writer App
minting. It retains CLI executable integrity, source config, exact command,
formatter and workspace-policy bindings. Unknown contexts fail for review;
the helper neither copies an implementation here nor substitutes a formatter.

The version job's read-only workflow token, credential-free checkout, sole
repository-scoped App credential, GitHub API commit recipe and disabled GitHub
release creation remain intact. Existing Changesets output/no-op behavior and
manual artifact qualification remain unchanged. Future real main execution is
separate evidence from the disposable whole-recipe proof.

## Completion caller

The thin `dependency-completed.yml` caller pins both reusable workflow and
`automation-ref` to reviewed coordinator source
`e3c91cb3bc19f19299842054a9309b0ca44da5b6`. Exact source workflow names
come from that source's completion-adoption inventory. Only successful completed
`workflow_run` events call it; permissions are contents/Actions/PR read and the
only forwarded secret is the named existing App key. There is no candidate
checkout, artifact/cache restore, inherited secret, recursion or concurrency
cancellation. The shared boundary checks actual current source metadata before
App minting and again before dispatch. Hints request an authoritative scan;
they grant no merge, publication, signing, deployment or activation authority.
Existing publication notifications and all original CI/gates remain unchanged.

## Before/after and remaining qualification

Local validation passes40/40 release/automation tests, the exact two new
integration targets, release configuration, three canonical spec lanes and
spec-first. Changed-file formatter and actionlint pass. Spec-validator0.2.0
is installed; current npm metadata confirms it remains the latest Deno-free
release. Doctor reports10 passes and the existing governed script-alias
warning; QMD semantic discovery succeeds.

`pnpm audit --json` exits0 under the existing unchanged
`GHSA-gcqx-w48m-w2h4` policy. Raw audit metadata retains1LOW; this is not a
zero-finding audit, new acceptance or transferred exception. No package/lock/
policy bytes changed. The pre-push Dependabot inventory is empty.

Read-only repository metadata confirms the named
`LAPIS_DEPENDENCY_APP_CLIENT_ID` variable and
`LAPIS_DEPENDENCY_APP_PRIVATE_KEY` secret are present. No value was read,
printed or changed. Full product/browser/package lanes remain preserved in the
applicable hosted CI and their current-head result is still required.

The new runtime integration regression failed1/1 before the guard existed and
passes1/1 after adoption. The parsed callback regression failed1/1 before its
file existed and passes1/1 afterward; it checks the complete event/name/read
permission/pin/ref/secret structure. Neither test pretends to analyze arbitrary
workflow security. Both are wired into the existing release-tooling test lane.

Full applicable hosted CI must pass on the actual PR head. Genuine post-merge
version-job and completion-callback execution, pre-App qualification and final
coordinator wake-up remain operational acceptance. No callback run is fabricated
and no unrelated source/publication workflow is rerun merely to create evidence.
