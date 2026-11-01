# Native-control divider follow-up

During installed macOS Chrome qualification of Notes PR #66, the user identified
a missing lower divider beside the native controls when the left sidebar closed.
The overlay action correctly reserved geometry, but top-header children owned
the divider, leaving the header's new leading/trailing padding unpainted.

The top header now paints the shared divider behind its children. Child paint
retains the active tab's open lower contour. The change adds no element, inset,
pointer target or host-specific styling. DC-WS-084 owns this paint contract.

The unchanged native-controls functional story passes before the fix (one pass,
eleven filtered cases); that geometry/interaction result did not detect this
visual gap. The colocated story documents the collapsed-sidebar divider case.
Screenshot comparisons and baseline updates remain excluded by user instruction;
the story remains visual-pending. Source and consumer qualification follow.

Notes' existing CI run 41315755628 passed all eleven gates with Core 0.10.0.
Its temporary Worker serves the exact tested merge-candidate artifact. Native
overlay measurements and public tokens agree at both 1200x954 and 1728x1000;
the user manually confirmed window dragging and clickable controls. Production
cutover remains pending this patch's publication and consumer adoption.

## Qualification and release preflight

The focused native-controls story passes after the paint repair (one pass,
eleven filtered cases). Initial aggregate checks completed governance, quality,
units and static Storybook, but the interaction lane encountered the unrelated
View Header case at its 30-second timeout before the local tool processes were
interrupted. Its exact cold regression passes unchanged (one pass, 2.83 seconds).
The complete aggregate now passes unchanged: 1,123 units, 35 release and three
Turbo tests; all 1,035 catalog cases across 284 files; 16 workspace, 17 shell
and three AI browser cases; and 196 shared-component browser cases with the
existing single conditional skip. Types, formatting, static build and visual
metadata audit also pass. No assertion, timeout or coverage was changed. Fresh
protected CI remains a publication gate.

No Dependabot pull requests were open at preflight. Every other registered
workspace has the same head and status as the verified 0.10.0 publication
inventory. Their prior equivalence/deferment dispositions remain applicable;
the already-merged automation #56 is now included through main 4422bf31.
No workspace was overwritten, removed or updated merely for inventory.

## Protected source acceptance

[Source PR #59](https://github.com/lapismd/design-core/pull/59) merged at
`e75c98083bbd87accfb7ad04447e066ad4214fb0` after all eleven protected checks
passed in [CI 41321128326](https://github.com/lapismd/design-core/actions/runs/41321128326).
The 0.10.1 version PR contains the generated version/changelog, consumed
Changeset and this source receipt. Its protected checks and trusted publication
remain required before Notes adopts the patch.

| Workspace                      | Head               | Release disposition                                                                    |
| ------------------------------ | ------------------ | -------------------------------------------------------------------------------------- |
| catalog-package                | 7b90b0445bb4       | Missing historical root retained; previous release disposition unchanged.              |
| column-fit-contents-20261025   | 8943f1e3c285       | Missing historical root retained; previous release disposition unchanged.              |
| composer-lifetime              | 73f6ce620093       | Missing historical root retained; previous release disposition unchanged.              |
| composer-package-20261025      | c032a7cda146       | Missing historical root retained; previous release disposition unchanged.              |
| default                        | 9f969e5b1f7f       | Clean retained checkout; previously released or independently deferred work unchanged. |
| dependency-automation-20261101 | 68ce8632e6d5       | Equivalent automation merged in #56; included through current main 4422bf31.           |
| design-core-sv-bump            | 9957936d495b       | Clean retained checkout; previously released or independently deferred work unchanged. |
| desktop-composer               | 3a1d4b8ae0f6       | Clean retained checkout; previously released or independently deferred work unchanged. |
| docker-validation              | dd0470ee517c       | Missing historical root retained; previous release disposition unchanged.              |
| json-highlighting-20261030     | b3f5754f0f07       | Clean retained PR #42 source; required runtime repairs already in released main.       |
| linux-release-ro-20261031      | 1516969ccc7c       | Stale historical diagnostic checkout retained without update.                          |
| linux-ro-20261031              | 3a9202401e90       | Clean retained checkout; previously released or independently deferred work unchanged. |
| mira-012                       | 5b22758b1b06       | Clean retained checkout; previously released or independently deferred work unchanged. |
| notebook-release               | cc0526bf24e4       | Clean retained checkout; previously released or independently deferred work unchanged. |
| notebook-status                | 664295f46e39       | Clean retained independent follow-up; released runtime repairs retained in main.       |
| notebook-tables                | a78a5c41d56d       | Clean retained checkout; previously released or independently deferred work unchanged. |
| picker-contrast-20261026       | 36ae3e01290e       | Missing historical root retained; previous release disposition unchanged.              |
| plugin-file-icons              | c6c3772006a7       | Missing historical root retained; previous release disposition unchanged.              |
| pwa-cloudflare-20261101        | enclosing zovnsmvp | Current native-control divider repair included.                                        |
| release-metadata-20261030      | 3fe54b0e5ff3       | Clean retained cohort; independent dependency/Avatar intake remains separate.          |
| release-verify-20261030        | 5649ebb4f83c       | Clean retained checkout; previously released or independently deferred work unchanged. |
| reply-baseline-20261030        | de77e0d5ca62       | Clean retained checkout; previously released or independently deferred work unchanged. |
| required-release-20261031      | a860b3fab13b       | Clean retained checkout; previously released or independently deferred work unchanged. |
| swipe-lifetime-20261025        | f692cce4d942       | Missing historical root retained; previous release disposition unchanged.              |
| swipe-package-20261025         | f2971304d7e8       | Missing historical root retained; previous release disposition unchanged.              |
