# PWA window-controls qualification

The browser host owns OS/browser detection and supplies full-window leading and
trailing exclusions plus native title-bar height. Design Core computes local
header intersections, preserving drag regions and interactive controls. This
extends DC-WS-083 without application policy in the shared package.

Source base: `919364b910ce` (published 0.9.1). The minor Changeset requests 0.10.0.
Consumer publication/adoption is recorded separately in Lapis Notes.

## Validation

- Focused overlap geometry: 3 passed; App Shell native-controls interaction passed.
- `pnpm checks`: governance, formatting, types, 1,123 unit tests / 156 files,
  35 release tests, 3 Turbo tests, static catalog and audit passed.
- Complete Storybook interaction/accessibility: 1,035 passed / 284 files.
- Workspace pointer: first cold run had one notification startup timeout; exact
  reproduction passed, then all 16 passed in the complete lane.
- Shell pointer: first run had one startup timeout (16 passed); exact cold
  reproduction passed. Next complete run had two Docs skeleton timeouts
  (15 passed); exact complete MDX family then passed all 6 without code changes.
- Public archive checks passed with the pinned toolchain: explicit Bits patch,
  clean consumer typecheck, cold development/production browser acceptance,
  and zero-finding packed production audit. Complete shell pointer: 17 passed. AI browser: 3 passed. Component browser: 195 passed, one pre-existing conditional case skipped and one composer-selection failure during a page navigation; the exact cold reproduction and complete eight-case family passed unchanged.
- Screenshot comparisons and visual baseline updates were excluded by request;
  the new story remains `visual-pending`.
- Local archive acceptance first used the system pnpm 12 in its temporary
  consumer and failed the existing Bits patch hash assertion. Repeating with
  the repository's pinned pnpm 10.32.1 and Node 24.15.0 is recorded separately;
  the assertion and patch metadata remain unchanged. A concurrent pack/browser
  startup attempt also exhausted the existing 120-second server-start timeout;
  the complete shell lane passed when run serially with the pinned toolchain.

The reduced-zoom review found a real ribbon regression: at 75% shell zoom,
native controls ended at viewport y=38 while the first action began at y=36.
The new native-controls story assertion failed once before the repair and
passed once afterward. Ribbon spacing now uses the shared intersection action's
zoom-compensated height, matching tab/header geometry. Post-repair governance,
formatting, types, 1,123 units, 35 release tests, 3 Turbo tests, all 13 affected
shell/ribbon stories and all 1,035 catalog interactions/accessibility cases
passed. The final static catalog/audit and clean packed-consumer checks also passed.
The source PR must pass every protected CI lane before publication.

## Workspace and dependency disposition

The HTTPS remote was fetched. Open Dependabot PR count was zero; there is no
empty dependency consolidation PR. Recheck before each push. Historical retained
work is described in the existing required-reader/swipe and later release records.
This PWA release includes only the new overlay contract and its qualification.
No workspace was removed or overwritten.

| Workspace                      | Head               | Available | Disposition                                                                            |
| ------------------------------ | ------------------ | --------- | -------------------------------------------------------------------------------------- |
| catalog-package                | 7b90b0445bb4       | No        | Missing historical root retained; previous release disposition unchanged.              |
| column-fit-contents-20261025   | 8943f1e3c285       | No        | Missing historical root retained; previous release disposition unchanged.              |
| composer-lifetime              | 73f6ce620093       | No        | Missing historical root retained; previous release disposition unchanged.              |
| composer-package-20261025      | c032a7cda146       | No        | Missing historical root retained; previous release disposition unchanged.              |
| default                        | 9f969e5b1f7f       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| dependency-automation-20261101 | 68ce8632e6d5       | Yes       | Clean independent open PR #56; excluded from PWA release.                              |
| design-core-sv-bump            | 9957936d495b       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| desktop-composer               | 3a1d4b8ae0f6       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| docker-validation              | dd0470ee517c       | No        | Missing historical root retained; previous release disposition unchanged.              |
| json-highlighting-20261030     | b3f5754f0f07       | Yes       | Clean retained PR #42 source; required runtime repairs already in released main.       |
| linux-release-ro-20261031      | 1516969ccc7c       | Yes       | Stale historical diagnostic checkout retained without update.                          |
| linux-ro-20261031              | 3a9202401e90       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| mira-012                       | 5b22758b1b06       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| notebook-release               | cc0526bf24e4       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| notebook-status                | 664295f46e39       | Yes       | Clean retained independent follow-up; released runtime repairs retained in main.       |
| notebook-tables                | a78a5c41d56d       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| picker-contrast-20261026       | 36ae3e01290e       | No        | Missing historical root retained; previous release disposition unchanged.              |
| plugin-file-icons              | c6c3772006a7       | No        | Missing historical root retained; previous release disposition unchanged.              |
| pwa-cloudflare-20261101        | enclosing tpnwypyp | Yes       | Current overlay candidate included.                                                    |
| release-metadata-20261030      | 3fe54b0e5ff3       | Yes       | Clean retained cohort; independent dependency/Avatar intake remains separate.          |
| release-verify-20261030        | 5649ebb4f83c       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| reply-baseline-20261030        | de77e0d5ca62       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| required-release-20261031      | a860b3fab13b       | Yes       | Clean retained checkout; previously released or independently deferred work unchanged. |
| swipe-lifetime-20261025        | f692cce4d942       | No        | Missing historical root retained; previous release disposition unchanged.              |
| swipe-package-20261025         | f2971304d7e8       | No        | Missing historical root retained; previous release disposition unchanged.              |

## Protected source acceptance

[PR #57](https://github.com/lapismd/design-core/pull/57) merged at
`a95cf238b9593147d754e2a595c84f6619848a84` after all eleven protected checks
passed in [CI 41310008196](https://github.com/lapismd/design-core/actions/runs/41310008196).
The complete component browser lane passed 196 cases with the existing
conditional WebKit case skipped; there were no flaky or failed cases in that
run. This resolves the earlier local navigation failure without altering its
assertion. The generated 0.10.0 version PR contains only version/changelog and
consumed Changeset metadata plus this source receipt; it must pass its own
protected checks before trusted publication.
