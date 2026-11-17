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

## Qualified local source and actual mutation

The verified source snapshot is8952b8e3703f5e2e71145c14f6c05bdaade25ac2; its
source/runtime/helper bytes are retained as an ancestor of this evidence update.
Eight focused helper tests and all48 release controls pass. The first combined
check catches three specification-shape errors, then one remaining prose-placement
error; canonical structure is corrected without changing the validator. The
final complete native invocation passes governance, four type lanes,1133 units,
48 release controls, static Storybook,1066 interaction/axe cases, Workspace27,
Shell17 and AI3 browser cases. Its Shadcn lane has189 passes/one existing skip
and seven unsupported-host WebKit launch failures; aggregate exit remains1.

Supported cold qualification uses the same immutable Playwright Linux image
`mcr.microsoft.com/playwright@sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f`,
official Node24.15.0, pnpm10.32.1 and checksum-verified mdBook0.5.4. All196
Shadcn cases pass with one existing skip; frozen install, all48 release controls
and current canonical-fact checks also pass. Container64b046c2 exits0 and is
removed. Its source archive SHA256 is
`4239254b9bf752994bd815315566f007e72ff612e953e1c85c9b93a4ed457109`.
The driver inherited two stale descriptive labels from the prior alert run;
`metadata-correction.json` preserves that mistake and independently confirms
all4420 archived entries match source8952b8e3, while the recorded sourceRevision
and archive digest were correct. Original manifests/results remain unchanged.

The shared actual-recipe runner correctly rejects an ordinary local checkout
outside its known hosted context; no context guard is bypassed. A separate
local disposable Jujutsu checkout runs the unchanged candidate command, with
Deno absent from PATH and existing CLI credentials used for changelog metadata
reads only. Initial no-token changelog generation stops before mutation; the
normal authenticated retry prepares the genuine0.13.4→0.13.5 release and consumes
both original notes. Only package version, changelog, consumed notes and the two
canonical facts change; lock and other manifest fields remain byte-equivalent.
The helper's check mode and strict non-exempt main-range spec-first now pass
(one protected manifest/two mapped canonical chapters). No package is published
and no writer App is minted. This is local mutation evidence, not hosted proof.

Logs: `/tmp/core-native-version-{release-final,full-checks-after2}.log`;
`/tmp/core-native-canonical-version-local-{command-authenticated,main-range-after}.log`.
Immutable supported receipts live under
`~/.cache/core-native-version-supported-20261117`; the disposable actual mutation
and exact six-file output receipt are under
`~/.cache/core-native-canonical-version-20261117`.
Hosted actual-recipe proof, source merge, genuine version-PR regeneration,
strict final-candidate coverage and registry publication remain required.
