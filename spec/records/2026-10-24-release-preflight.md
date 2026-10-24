# Design Core 0.7.0 release preflight

The user authorized guidance updates, dependency consolidation, source
integration and npm publication on 2026-10-24. The candidate starts at
`8a195a23`; GitHub main is `c82fcb71`. Changesets selects
`@lapismd/design-core@0.7.0`; npm currently reports 0.6.0.

## Workspace inventory

After fetching `codex-https`, `jj workspace list` reports only `default`.
Its head `0931f289` is a clean empty child of the candidate. There are no
secondary registered workspaces to merge. Historical `archive/*` bookmarks
are preserved and are not registered working copies. The default-workspace
changes still need integration into GitHub main.

## Dependency disposition

The GitHub open-PR query returned no open pull requests, including Dependabot.
No consolidation PR or bot closure is needed. Recheck before each push.
Release Mira 0.1.1 first, then raise the published Mira dependency minimum to
`~0.1.1` and refresh the registry lockfile before final qualification.

## Remaining release gates

Complete release-note coverage, full nonvisual checks, full and production
audits, package checks and cold affected-consumer acceptance on the final
candidate. The bootstrap `checks:release` lane alone is insufficient: retain
interaction, accessibility and pointer/browser coverage. Existing
`npm-production` protection requires the configured reviewer and a permitted
branch. Use verified immutable artifacts and verify registry integrity and
provenance after publication. Screenshot comparisons and baseline updates
remain outside this release.

## Guidance validation

The first `pnpm spec:check` reports one acceptance-shape failure for a wrapped
guidance bullet. Replacing it with one atomic statement preserves the policy
in `AGENTS.md`; the exact rerun passes all three lanes. Changed-file Prettier
also passes. This documentation slice does not change executable behavior.
