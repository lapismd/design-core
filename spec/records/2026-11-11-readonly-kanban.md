# Read-only Kanban after host refresh — 2026-11-11

Lapis Maintenance CI exposed one failure in SharedChecks/Pull Request: Enter
started a drag instead of opening the inspector despite movesEnabled=false.
A CPU-throttled browser reproduced the card becoming aria-grabbed=true.

The dnd-kit reactive input effect resets disabled to false whenever host data
changes; mutating the instance from a separate effect does not retain authority.
Card and column now supply disabled through the public reactive input getter.
No public API or visual contract changes.

The source ReadOnlyMoves story replaces host card/column objects, asserts that
lifting remains disabled, activates the refreshed card with Enter and checks the
visible open-callback result while retaining its move/navigation assertions.
Before the source fix the exact ReadOnlyMoves target failed 1/1; afterward it
passed 1/1 in a fresh Vitest browser process. Wider qualification is recorded below.

Release preflight: fresh main is e83d2b9b (0.12.3), registry latest 0.12.3,
no open Dependabot PRs at initial inspection; workspace inventory recorded below.
Visual review remains visual-pending and no baselines are changed.

## Workspace preflight

The patch starts from the published 0.12.3 main revision after fetching
release-https; every registered working-copy head and each available reported
physical root was inspected without updating stale or unavailable roots.
Related Kanban/activity work is already in main ancestry; historical divergent
branches remain outside this narrow repair, as recorded in the prior
[release inventory](2026-10-31-canvas-filters-release.md).
No unrelated source or workspace is rewritten.

| Workspace                      | Head         | Working-copy state                                | Disposition                                               |
| ------------------------------ | ------------ | ------------------------------------------------- | --------------------------------------------------------- |
| activity-regression            | ca2c6cf32ace | Clean                                             | Included by main ancestry                                 |
| bases-embeds                   | 54ef274709de | Stale; physical state unknown, retained untouched | Included by main ancestry                                 |
| catalog-package                | 7b90b0445bb4 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| column-fit-contents-20261025   | 8943f1e3c285 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| composer-lifetime              | 73f6ce620093 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| composer-package-20261025      | c032a7cda146 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| default                        | 90dc3ec12fef | Clean primary checkout (inspected separately)     | Included by main ancestry                                 |
| dependency-automation-20261101 | e0a6c4078088 | Clean                                             | Included by main ancestry                                 |
| design-core-sv-bump            | 9957936d495b | Clean                                             | Included by main ancestry                                 |
| desktop-composer               | 3a1d4b8ae0f6 | Recorded empty; physical root not located         | Included by main ancestry                                 |
| docker-validation              | dd0470ee517c | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| json-highlighting-20261030     | b3f5754f0f07 | Clean                                             | Historical divergent branch preserved outside patch scope |
| kanban-alignment               | 9c8709825d6b | Clean                                             | Included by main ancestry                                 |
| linux-release-ro-20261031      | 1516969ccc7c | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| linux-ro-20261031              | 3a9202401e90 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| maintenance-kanban             | e11e9f9f21a8 | Candidate changes                                 | Current patch candidate                                   |
| mira-012                       | 5b22758b1b06 | Clean                                             | Included by main ancestry                                 |
| notebook-release               | cc0526bf24e4 | Clean                                             | Historical divergent branch preserved outside patch scope |
| notebook-status                | 664295f46e39 | Clean                                             | Historical divergent branch preserved outside patch scope |
| notebook-tables                | a78a5c41d56d | Clean                                             | Included by main ancestry                                 |
| picker-contrast-20261026       | 36ae3e01290e | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| plugin-file-icons              | c6c3772006a7 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| pwa-cloudflare-20261101        | dda1c0e8e1a4 | Clean                                             | Included by main ancestry                                 |
| release-metadata-20261030      | 3fe54b0e5ff3 | Clean                                             | Historical divergent branch preserved outside patch scope |
| release-verify-20261030        | 5649ebb4f83c | Clean                                             | Included by main ancestry                                 |
| reply-baseline-20261030        | de77e0d5ca62 | Clean                                             | Included by main ancestry                                 |
| required-release-20261031      | a860b3fab13b | Recorded empty; physical root not located         | Included by main ancestry                                 |
| swipe-lifetime-20261025        | f692cce4d942 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |
| swipe-package-20261025         | f2971304d7e8 | Recorded empty; physical root not located         | Historical divergent branch preserved outside patch scope |

## Source qualification

`STORYBOOK_DISABLE_TELEMETRY=1 STORYBOOK_PORT=9330 pnpm checks` exercised
all required lanes: governance, formatting, all type-consumer checks, 1,128 unit
cases, 40 tooling/release cases, the static catalog and metadata audit, 1,057
Storybook interactions/accessibility cases, 17 workspace pointer cases, 17 shell
cases and 3 AI browser cases passed. The Shadcn lane reported 194 passed,
1 intentional platform skip and 2 failures: composer story readiness and hover
popover opening, outside the Kanban call path.

The exact two failing tests were rerun with a fresh server, retaining all
assertions and deadlines:
`STORYBOOK_PORT=9410 pnpm test:shadcn:pointer tests/shadcn/chat-composer-actions.spec.ts tests/shadcn/hover-card-pointer.spec.ts --grep 'composer text starts|is the topmost'`.
Both passed (2/2), without a source, assertion, timeout or quarantine change.
The complete hosted suites remain a merge/publication gate.

Doctor passed 10 checks with the existing intentional script-alias warning for
the dependency-automation specification wrappers; real QMD semantic search ran.

The initial public-package check caught the system pnpm 12.6 being selected by
a temporary consumer without a packageManager field, leaving the required
Bits UI patch unapplied. The original unpatched file hash matched the patch
manifest's before hash. Requalification uses the repository's pnpm 10.32.1
executable first in PATH for both host and temporary consumer, preserving the
checksum assertion and all patch-policy code. With pnpm 10.32.1 pinned for the complete process tree, package requalification
passed: required patch hashes, clean-consumer types, cold development/production
CSS/fonts/focus/themes/controls and the zero-finding production audit.
`pnpm release:check` also passed; no package-policy assertion was changed.

## Activation follow-up before merge

Maintenance's full packed-consumer lane caught a second problem before the PR
merged: the correctly disabled drag adapter also declared the card button
aria-disabled=true, so Playwright's native click refused activation (one failed
SHA-bound merge browser case). Auto-merge was disabled while addressing it.
The source ReadOnlyMoves regression was strengthened to require enabled card
activation after host refresh and failed 1/1 against the getter-only repair.

Read-only cards and columns now omit the drag/drop attachment entirely while
retaining the reactive disabled input; this removes drag-only accessibility
attributes without disabling the independent card action. Default movable
boards keep their existing attachment and keyboard drag behavior. No consumer
force-click, wrapper or assertion bypass is introduced. The strengthened ReadOnlyMoves target passes 1/1 and all 22 Kanban stories
pass in fresh browser processes.

Final combined-source verification:
`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=2 STORYBOOK_PORT=9330 pnpm checks`
exits 0 with pinned pnpm 10.32.1/Node 24.15.0, including 1,128 unit, 40 tooling,
1,057 Storybook interaction/accessibility, 17 workspace, 17 shell, 3 AI and 196
Shadcn browser passes with 1 existing platform skip. Functional, interaction and
accessibility failures are all zero; the earlier composer/hover cases pass in
the complete suite without retries, quarantine or assertion changes.

The final archive also passes `pnpm packages:pack` with pinned tools: explicit
consumer-root patch verification, clean types, cold development/production
runtime acceptance and zero production audit findings. No dependency policy or
checksum check was altered.
