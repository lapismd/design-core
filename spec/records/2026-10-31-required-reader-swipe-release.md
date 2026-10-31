# Required reader and Swipe lifecycle release

## Released state and scope

Core 0.7.2 is available on npm from `3ee2b016e453f159b376a69a19e0f5680dda3f65`
through [Version Packages #44](https://github.com/lapismd/design-core/pull/44).
[Release run 41170101119](https://github.com/lapismd/design-core/actions/runs/41170101119)
passed trusted publication, installed package/provenance verification and the
package tag/release jobs. Its downloaded registry tarball has SHA-256
`ab766825688cab8760a2ebca0dca8432e819ff7b25538719a482dcc7120f5f51`.

That release retains the legacy captured JSON grammar and pre-repair Swipe Item
callbacks. The actual registry-only Tasks cohort fails `LiveEditMutations` once
with a destroyed-derived read through `SwipeItemState.close`; its strict types,
unit/native, build and audit lanes pass. Consumer receipt:
`lapis-tasks-run-8902a8ec-97d3-4338-b742-250078a9a3a6`.

This change ports only the required captured JSON and Swipe lifecycle owner
repairs from the retained PR #42 source. It preserves released main's Notebook,
Explorer, Button, column-fit, status and patched Minimatch behavior. Package
manifests, dependency ranges and the frozen registry lock remain unchanged.
The Changeset requests the next Core patch, expected 0.7.3.

DC-CHAT-006 retains exact immutable source and UTF-16 coordinates. DC-SHA-004
retains consumer-owned actions, handler-first ordering, default prevention and
close-on-select control. No public API, styling or visual baseline changes.

The Bits identical-container FocusScope guard now has an upstream contribution,
but no fixed npm release. Its dependency-floor intake remains pending and blocks
this candidate's required Linux acceptance. Prepared owner archives remain
diagnostic evidence only. Actual downstream qualification still blocks each
consumer's own release. Independent catalog readiness exposed by qualification
is included below without changing dependency versions.

## Exact source regression

The new workspace starts at the actual released main above. The regression
fixtures are copied unchanged from the earlier verified owner change; production
remains released main for the before runs.

```sh
pnpm test:unit src/shared/chat/transcript/captured-json.spec.ts
CI=true pnpm test:storybook src/shared/shadcn/swipe-item/SwipeItemLifecycle.stories.svelte --maxWorkers=2 --no-file-parallelism
```

On macOS ARM64, Node 24.10.0 and pnpm 10.32.1, before repair JSON has two
failures and Swipe has four failures/five passes. After restoring only
`captured-code.ts`, `swipe-item-action.svelte` and `swipe-item-context.svelte.ts`,
the same commands pass two and nine cases respectively, with zero failures.
Each browser invocation owns a fresh Vitest/browser process. No diagnostic,
assertion, timeout or retry is weakened.

An initial extra `--` separator widened the unit dispatch: 918 cases passed and
the same two JSON cases failed. Its broader Storybook dispatch was interrupted
and is not qualification evidence. The exact corrected targets above supply the
before/after counts.

## Cold full-suite readiness

Fresh Linux source `3534f0a4123e39429c641fa583eaf5d3791a6681` passes the exact
JSON/Swipe cases, all 920 units, four strict type surfaces with zero diagnostics
and the static build. Its complete catalog reports 990 passes and four failures:
FilterQueryAutocomplete, NestedProjectAndFileSidebars, RestrictedReactions and
NavigatesTheEmojiGrid. The failed aggregate is retained in
`/tmp/lapis-core-required-validation-20261031/r2/results`; it is not waived.

The exact four cases pass unchanged in a fresh native run, with 28 deliberately
filtered cases. The next candidate ports the already verified measured Filter
hit-target wait and experimental Emoji focus/portal completion from the retained
source, and waits for the owned Shell toggle to regain pointer events after the
project selector closes. The prior listbox accessibility query could complete
before the exit transition released pointer admission. Keyboard navigation uses
the already focused input, and complete portal absence is checked against the
owner document. All original focus, geometry, closing and mutation assertions
remain; no delays, retry changes or diagnostic exceptions are added.

The exact four cases remain green, and the four complete affected story families
pass all 32 cases in a fresh native process. The same actual registry Bits
2.19.5 dependency remains installed. A new complete cold Linux aggregate is
required before source commit or push.

The next fresh Linux candidate `65cf6b237112d1523528200c8b400989983c24f6`
passes JSON and Swipe again, then reports 31 passes/one failure in the 32-case
family boundary. Only public RestrictedReactions still loses focus. Its story
dispatched a click/type sequence as soon as the input existed, before verifying
the first result or initial focus, contrary to the existing DC-SHA-054 catalog
procedure. The new candidate waits for that result and asserts initial search
focus, dispatches keyboard navigation without another click and retains the
immediate first-option focus assertion. It also requires physical removal of
the captured input and restored trigger focus after selection. Native exact
acceptance passes once with eight intentionally filtered cases; the complete
four-family boundary passes 32/32. Fresh Linux proof remains required.

Fresh Linux source `db99fd7ea4c6480af9c0a8a11f9c0b9432fc3149` repeats the exact
JSON and Swipe passes, then still reports 31 passes and one RestrictedReactions
failure at the same 32-case boundary. The input initially owns focus, but focus
returns to it after moving to the first option. The immediate option-focus
assertion is retained. Full aggregate, browser and public-package phases did not
run after that boundary failed. Reports remain under
`/tmp/lapis-core-required-validation-20261031/r4/results`; this is a failed
candidate, not complete release qualification.

## Upstream dependency handoff

[Bits UI PR #2264](https://github.com/huntabyte/bits-ui/pull/2264) contains owner
source `692fbdf5095941464561189fd81ffc2cb4b81c6c`. FocusScope ignores an unchanged
mounted container, preserving option focus and callback counts; a genuine
unmount still restores trigger focus. Its exact regression changes from one
failure to one pass. All 152 owner units, build/publint, lint, root check and
1,491 canonical Chromium cases pass, with retries disabled and two existing
skips/one todo. Hosted Svelte, lint, unit, Chromium and preview-build checks pass;
the contribution is ready for maintainer review.

Additional native two-browser qualification remains red: baseline has 2,956
passes/26 failures; candidate has 2,957 passes/25 failures. Twenty-one failure
identities overlap, four candidate-only cases pass a narrow rerun and narrow
WebKit LinkPreview reproduces on both revisions. These limits remain in the
upstream PR and do not constitute complete cross-browser qualification.

Latest npm Bits remains 2.20.2. Maintainer merge and a legitimate npm patch are
external prerequisites. No maintained fork package or consumer substitution is
introduced. After publication, consume the normal released range, retain the
immediate focus assertion and rerun the exact Linux boundary before full Core
qualification, protected source/version PRs, publication and consumer refresh.

Fresh production and full pnpm audits both exit zero with zero advisory records;
production reports zero vulnerabilities. Full metadata retains one existing low
count under the unchanged repository audit policy. Raw JSON receipts are retained
in `/tmp/lapis-core-required-audit-{prod,full}-20261031.json`. No exception is
introduced.

## Qualification gates

Full uncached Linux Core qualification, clean public package acceptance and
current-base protected PR checks remain pending. The final source record must
retain the exact source, normal registry graph, commands/counts and all failures.
After green source checks and merge, review the generated patch version PR,
merge only after its required checks, monitor the trusted publication and verify
the exact registry version/provenance/tag before refreshing consumers.

Publication follows the protected trusted-publisher workflow. Registry
publication and consumer refresh remain separate from local source acceptance.

## Workspace and dependency preflight

The release HTTPS remote was fetched. The original SSH fetch could not sign its
key; the existing public repository was fetched through HTTPS without changing
credentials or the SSH origin. Open Dependabot query returns zero; recheck
immediately before each push. No empty dependency PR is needed.

All 23 registered heads and available checkout statuses were inspected. Missing
roots stay untouched. The stale Linux diagnostic checkout is not updated; its
three protected runtime files still match its registered head. Every available
checkout's three protected files matches its recorded revision. Detailed local
receipt: `/tmp/lapis-core-required-workspaces-20261031.json`.

| Workspace                    | Registered head    | Disposition                                                                                               |
| ---------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| default                      | bb601d59           | Clean; Button and column fitting are already represented by released main.                                |
| notebook-release             | b638631b           | Clean; its qualified Notebook/security release is already in 0.7.2.                                       |
| notebook-status              | 1d7d25dc           | Clean; independent retained follow-up remains outside this owner repair.                                  |
| required-release-20261031    | enclosing lokzorzo | Current source candidate; the two required owner fixes and their unchanged regressions are included.      |
| json-highlighting-20261030   | b3f5754f           | Clean retained PR #42 source; required JSON and Swipe runtime fixes are included here.                    |
| release-metadata-20261030    | 3fe54b0e           | Clean prepared cohort; remaining Bits floor/role and Avatar intake stays separate.                        |
| canvas-table                 | 95f604dd           | Clean working change over independent unfinished Canvas Table feature/API work; deferred.                 |
| design-core-sv-bump          | 9957936d           | Clean; released validator update is already represented.                                                  |
| desktop-composer             | 3a1d4b8a           | Clean frozen source; released composer work is retained.                                                  |
| mira-012                     | 5b22758b           | Clean; main's released Mira intake is retained.                                                           |
| release-verify-20261030      | 5649ebb4           | Clean; registry propagation/verification repair is already released.                                      |
| reply-baseline-20261030      | de77e0d5           | Clean historical diagnostic input; retained.                                                              |
| linux-ro-20261031            | 3a920240           | Clean historical diagnostic input; retained.                                                              |
| linux-release-ro-20261031    | 1516969c           | Stale historical diagnostic checkout; retained without update, protected files match its registered head. |
| column-fit-contents-20261025 | 8943f1e3           | Missing root; qualified production fitting is already represented by main.                                |
| swipe-lifetime-20261025      | f692cce4           | Missing root; callback lifetime repair and regression fixtures are included.                              |
| swipe-package-20261025       | f2971304           | Missing root; earlier equivalent qualification stays historical.                                          |
| picker-contrast-20261026     | 36ae3e01           | Missing root; released picker behavior is retained.                                                       |
| plugin-file-icons            | c6c37720           | Missing root; independent public icon-service extension remains separate.                                 |
| composer-lifetime            | 73f6ce62           | Missing root; released lifetime repairs supersede old source; unrelated tooling stays separate.           |
| composer-package-20261025    | c032a7cd           | Missing root; historical package qualification stays retained.                                            |
| catalog-package              | 7b90b044           | Missing root; unrelated host-stat/editing/tooling features remain separate.                               |
| docker-validation            | dd0470ee           | Missing root; divergent feature/tooling history remains retained.                                         |

No source workspace is overwritten, removed or silently included. The final
pre-push inventory and open dependency query remain required after qualification.
