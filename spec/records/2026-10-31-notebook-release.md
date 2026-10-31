# Notebook support release preflight

The user authorizes push, merge and publication on 2026-10-31. The candidate
combines the verified Notebook status/Explorer source with fetched main
`43c4b5d6`, retaining the released 0.7.1 metadata. It includes the inherited
Button foreground repair and completes its nested-column fit repair without
new public APIs. One patch Changeset records the consumer behavior.

The unrelated patch PR #42 currently fails its AppShell browser gate. Its active
release-metadata workspace also has uncommitted dependency/registry/acceptance
work with outstanding Emoji Picker failures. Those changes and the independent
Canvas Table feature remain preserved and outside this candidate. Only the
already-committed fit helper and its two owning regressions are reused from
`5bafb97e`; that bounded traversal fixes hidden/inert and transparent wrappers.

## Focused evidence

- Status/Explorer families: 22 passed on the combined main integration.
- The first aggregate stops at one missing mapped layout chapter; its quality
  and unit jobs are cancelled, so it is not a qualification pass. Exact
  `pnpm spec:first` fails once, then passes after the fit contract is recorded.
- The pre-fit-completion aggregate is intentionally interrupted before changing
  its browser inputs; no completion result is claimed.
- Exact `pnpm test:storybook src/shared/shadcn/column-canvas/ColumnCanvasFit.stories.svelte -t 'Transparent|Dense'`: one failure/one pass before, two passes after.
  The same count, hidden-subtree and retained-identity assertions remain.
- Complete family, source, browser and package qualification follow separately.

The combined candidate passes all 32 affected-family stories and full
`pnpm checks`: 917 unit tests, 981 interaction/accessibility stories, strict
quality/specification, static Storybook, 16 workspace browser checks, 17 shell
checks, three AI checks and 153 shadcn pointer/browser checks. One pre-existing
conditional browser skip remains; there are no failures. Exact logs are
`/tmp/core-notebook-release-families.log` and
`/tmp/core-notebook-release-complete.log`; package-consumer qualification follows
in `/tmp/core-notebook-release-packs.log`.

That exact package command fails once at the existing packed production audit:
the declared Minimatch 10 range resolves below the patched 11.0.1 boundary for
`GHSA-g3hv-75wg-m249`. Cold development/production browser acceptance passes
before the audit failure. Upgrade the owning declared range to `^11.0.3` and
repeat the exact editor-registry, full source and packed-consumer gates; retain
the existing audit policy. The sole browser skip is the WebKit-only overlay
preference scenario in a Chromium run.

The installed patched major removes `makeRe`. The unchanged exact registry
suite reports one failure/one pass, and the expanded basename/path/brace/literal
regression reports two failures/one pass before adapting compilation. Validate
the constructor's public pattern set instead; preserve fail-closed exceptions,
oversized-pattern rejection and all matching/specificity assertions.

The repaired exact matcher target passes all three cases. The original
`pnpm packages:pack` now passes its clean consumer, cold development/production
browser acceptance and unchanged advisory-specific audit policy. The complete
post-upgrade `pnpm checks` repeats with 918 unit tests, 981 interaction/axe
stories and all 189 browser checks passing, plus the same WebKit-only skip.
Final logs: `/tmp/core-notebook-minimatch-fixed.log`,
`/tmp/core-notebook-patched-packages-pack.log` and
`/tmp/core-notebook-patched-checks.log`. No new advisory exception is introduced.

## Workspace inventory

All registered heads and available physical workspaces are inspected. Roots
without recorded paths, missing roots and stale diagnostic workspaces retain
unknown uncommitted state and are preserved. The complete head/status/comparison
inventory lives in `.local/release-preflight/notebook-20261031/`.

| Workspace                    | Disposition                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------- |
| canvas-table                 | Independent feature/API; clean, preserved and excluded.                                     |
| catalog-package              | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| column-fit-contents-20261025 | Legacy transparent-fit behavior superseded by the combined helper; other history preserved. |
| composer-lifetime            | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| composer-package-20261025    | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| default                      | Required source ancestry included; available root remains clean.                            |
| design-core-sv-bump          | Required source ancestry included; available root remains clean.                            |
| desktop-composer             | Required source ancestry included; available root remains clean.                            |
| docker-validation            | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| json-highlighting-20261030   | Independent PR #42 candidate; only its qualified fit helper/tests reused.                   |
| linux-release-ro-20261031    | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| linux-ro-20261031            | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| mira-012                     | Required source ancestry included; available root remains clean.                            |
| notebook-release             | Active isolated release candidate.                                                          |
| notebook-status              | Required source ancestry included; available root remains clean.                            |
| picker-contrast-20261026     | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| plugin-file-icons            | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| release-metadata-20261030    | Uncommitted independent release repair; preserved and excluded.                             |
| release-verify-20261030      | Required source ancestry included; available root remains clean.                            |
| reply-baseline-20261030      | Required source ancestry included; available root remains clean.                            |
| swipe-lifetime-20261025      | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |
| swipe-package-20261025       | Independent/superseded history; preserved, excluded; unavailable/stale state not modified.  |

Fresh Dependabot queries return zero for Design Core. No empty dependency PR
is created. No workspace, visual baseline, security requirement or unrelated
source is removed or weakened. Hosted checks and verified registry publication
remain release gates.
