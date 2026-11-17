# Native canonical release-version preparation

DC-TOOL-006 and DC-PKG-009 retain strict canonical coverage on main. The genuine
Core0.13.5 version PR90, generated from merged source df9b0cf1, contains only
Changeset deletion, package version and changelog. Its bot PR Governance check
passes through the existing exemption. Independent non-exempt command
`pnpm spec:first --base df9b0cf1d98ac010cf1d895837348d733cee37af --head 940bf82c43eb14e4e90b65415259fa8241b54884`
fails with two missing mapped chapters: Architecture and Packages. This is not
main qualification, and the generated PR must not merge in that state.

The source-owned version recipe now refreshes a single declared current-package
version fact in each mapped chapter after the actual Changesets mutation. Both
pages are validated before any write; missing, duplicate or malformed markers,
wrong package identity, invalid version and symlinked files fail closed. Only
current facts change: historical release evidence and product requirements are
retained. Check mode is read-only and idempotent. Runtime qualification binds
the helper bytes with the exact command; no writer credential or new runtime is
introduced. The actual-source release tests also check current manifest/facts.

Focused helper regressions initially pass seven cases; release controls pass47
cases. The subsequently added actual-source invariant must also pass before
commit. Source spec-first passes four protected files/three canonical chapters.
Logs are `/tmp/core-canonical-version-{exact,release-controls,spec-first}.log`.
Full source checks, actual native pending-note recipe proof, source review,
generated-candidate strict canonical proof and publication remain pending.

The existing genuine reaction/contrast Changesets remain unconsumed on this
source branch; no release intent or additional package bump is fabricated.
All registered workspaces were inventoried for PR89: the default contains both
qualified source repairs; both clean foundation workspaces have ancestors already
included on main. Recheck workspace/dependency disposition before release.
