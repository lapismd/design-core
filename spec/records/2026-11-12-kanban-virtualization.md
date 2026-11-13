# Long Kanban lane rendering — 2026-11-12

## Observed problem and scope

Lapis Maintenance paints intermittently disappear in the user's wide Chromium
window while hovering or scrolling the long Activity lane. Collapsing that lane
restores rendering; constrained-width and embedded-browser layouts do not show
the failure. DOM and scroll geometry remain intact during missing paint.
The observed 1728 CSS-pixel, DPR-2 window contained roughly 26,198 pixels of
Activity content and 303 backdrop-filter elements. Paint/compositing pressure
is a working explanation; an engine-level cause is not established.

Temporary blur, hover-motion and containment probes did not resolve the failure
and were removed. The repair belongs in Design Core's Kanban lane renderer,
without consumer CSS overrides, package patches or new public API.

## Regression and implementation

The exact `KanbanVirtualization.stories.svelte` regression failed before the
implementation: 300 mounted cards, expected fewer than 30 (1 failure).
Lanes above 40 cards now use the existing TanStack virtualizer with measured
dynamic heights and bounded overscan. Stable identities retain selected,
focused and dragged cards. Counts and scroll extent cover the full data set;
refresh/prepend preserves the visible anchor and keyboard navigation brings
its target into view. Short lanes retain their original layout.

The exact story now passes 2/2, including scrolling to the last card, activation,
prepending, keyboard navigation and measured content expansion. All 24 Kanban
stories pass. Both real-pointer Kanban cases pass, including moving a virtual
card to another lane with full count and bounded mounted-card assertions.
Visual review remains visual-pending; no baselines were changed.

## Release scope preflight

The candidate is based on fetched main d8f34532 (0.13.0), after mobile PR #74,
Mira upgrade #73 and version PR #75 merged independently. Their source and
verification evidence are preserved; this patch changes only the lane renderer
and its regression evidence. No open Dependabot PRs remain.

The inventory below was refreshed against that base before publication. All 31
registered workspaces were inspected; unavailable and stale roots were retained
untouched, and no other available workspace had uncommitted Kanban changes.

| Workspace                      | Head         | Working-copy state                        | Disposition                                            |
| ------------------------------ | ------------ | ----------------------------------------- | ------------------------------------------------------ |
| activity-regression            | ca2c6cf32ace | Clean                                     | Included by main ancestry                              |
| bases-embeds                   | 54ef274709de | Stale; retained untouched                 | Included by main ancestry                              |
| catalog-package                | 7b90b0445bb4 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| column-fit-contents-20261025   | 8943f1e3c285 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| composer-lifetime              | 73f6ce620093 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| composer-package-20261025      | c032a7cda146 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| default                        | 024cd15bbc50 | Clean                                     | Already equivalent; mobile PR #74 merged               |
| dependency-automation-20261101 | e0a6c4078088 | Clean                                     | Included by main ancestry                              |
| design-core-sv-bump            | 9957936d495b | Clean                                     | Included by main ancestry                              |
| desktop-composer               | 3a1d4b8ae0f6 | Recorded empty; physical root not located | Included by main ancestry                              |
| docker-validation              | dd0470ee517c | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| json-highlighting-20261030     | b3f5754f0f07 | Clean                                     | Historical divergent work preserved outside this patch |
| kanban-alignment               | 9c8709825d6b | Clean                                     | Included by main ancestry                              |
| kanban-virtualization          | ee72f10be349 | Candidate changes                         | Current virtualization patch                           |
| linux-release-ro-20261031      | 1516969ccc7c | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| linux-ro-20261031              | 3a9202401e90 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| maintenance-kanban             | 56c59f3b72d1 | Clean                                     | Included by main ancestry                              |
| mira-012                       | 5b22758b1b06 | Clean                                     | Included by main ancestry                              |
| mobile-pr                      | e42cd77d5e9b | Clean                                     | Already equivalent; mobile PR #74 merged               |
| notebook-release               | cc0526bf24e4 | Clean                                     | Historical divergent work preserved outside this patch |
| notebook-status                | 664295f46e39 | Clean                                     | Historical divergent work preserved outside this patch |
| notebook-tables                | a78a5c41d56d | Clean                                     | Included by main ancestry                              |
| picker-contrast-20261026       | 36ae3e01290e | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| plugin-file-icons              | c6c3772006a7 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| pwa-cloudflare-20261101        | dda1c0e8e1a4 | Clean                                     | Included by main ancestry                              |
| release-metadata-20261030      | 3fe54b0e5ff3 | Clean                                     | Historical divergent work preserved outside this patch |
| release-verify-20261030        | 5649ebb4f83c | Clean                                     | Included by main ancestry                              |
| reply-baseline-20261030        | de77e0d5ca62 | Clean                                     | Included by main ancestry                              |
| required-release-20261031      | a860b3fab13b | Recorded empty; physical root not located | Included by main ancestry                              |
| swipe-lifetime-20261025        | f692cce4d942 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |
| swipe-package-20261025         | f2971304d7e8 | Recorded empty; physical root not located | Historical divergent work preserved outside this patch |

## Updated base after overnight interruption

The initial aggregate process was interrupted overnight after 216 Storybook
files. It had reported one failure in the independent shell story
`NestedProjectAndFileSidebars`; the exact case passed 1/1 in a fresh process
without code, timeout or assertion changes. The complete rerun remains required.

Fetched current main d8f34532 (version 0.13.0) before resuming: mobile PR #74,
Mira dependency PR #73 and version PR #75 are now merged with green hosted CI.
The virtualization change is rebased onto that main; their implementation and
verification evidence are preserved. Registry latest is still 0.12.4 because
the preceding release is waiting on its configured publication environment.
No open dependency PRs remain. Release run 43336450960 subsequently passed
publication, clean-install integrity/provenance verification and release notes
for the exact 0.13.0 artifact (SHA-256
`f0e3d65579c800fda4727e77e118afeeb5f9c83409bdb438c706ff0c898d65fe`).
The full combined source is requalified below.

## Verification

The complete source lanes and packed-consumer qualification are recorded below. The Maintenance test package is prepared
from this source by `pnpm package:local` and consumed through an override only
in an ignored `.local/virtualized-consumer` copy. Production manifests and the
registry-backed lockfile are not replaced by that temporary setup.

## Completed combined-source lanes

With Node 24.15.0 and pnpm 10.32.1, the resumed aggregate passed formatting,
all four type surfaces, the no-utility audit, 1,130 unit cases, 40 tooling cases,
canonical specification checks, the static catalog/metadata audit, 1,060
Storybook interaction/accessibility cases, 27 workspace pointer, 17 shell
pointer and three AI browser cases before a second host-session interruption.
The Shadcn run had reported two failures outside Kanban (comment-composer
readiness and quantity input). Both exact cases pass in a fresh serial run
without code, deadline or assertion changes; the final complete Shadcn lane,
package checks and deep-card consumer regression are recorded after completion.

The rebased public package preview passes both Maintenance fullscreen stories.
The temporary consumer now uses the archive as its direct dependency and keeps
Repository UI's ordinary transitive registry dependencies, matching the graph
that normal consumer adoption will install. No production dependency override,
source alias or archive reference is introduced.

## Final serial qualification — 2026-11-13

The complete Shadcn suite passes 196 cases with one existing platform skip.
Together with the completed aggregate lanes above, all required functional,
interaction and accessibility failures are zero. The cold exact retry and the
complete rerun retain the original assertions and deadlines.

`pnpm packages:pack` passes the explicit consumer-root Bits UI patch hash,
clean-consumer type checks, cold development/production CSS/fonts/focus/theme,
control and lifecycle acceptance, and a production audit with zero findings.
`pnpm release:check` passes. The packed Maintenance deep-card browser regression
passes 1/1; both rebased fullscreen stories pass 2/2. The final app test opens
the last item in a 100-card Activity lane, verifies bounded mounted cards and
retains the outer scroll/header geometry.

The installed latest spec-validator remains 0.2.0. Doctor passes eight checks
with the two QMD availability warnings and the existing wrapper-script warning;
search executes the documented rg fallback. Canonical specification and
formatting checks are repeated after this evidence update. Hosted CI and exact
registry artifact verification remain publication gates.
