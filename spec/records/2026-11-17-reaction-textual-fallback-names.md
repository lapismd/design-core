# Textual reaction fallback names

## Owner, reproduction and contract

Design Core owns ReactionBar; jj-store consumes its released public exports.
The integrity-verified0.13.4 archive and clean local source are identical. Its
archive SHA256 is936d2bca9002998fbcc5d249ef5f953f01c3c3e09e23d6bbdd4f8d35e10439cb.
A displayed textual fallback such as lapis followed by count1 is omitted from
the accessible name when actor/context text separates the same words. Default
labels also reverse the displayed fallback/count order. This is independent of
jj-store's separately repaired missing custom-image model adapter.

DC-CHAT-004 and the compatible DC-AI-018 surface now explicitly retain visible textual fallbacks/counts in supplied
and default names. The two source-owned Storybook regressions fail before the
component edit, with the existing Unicode story unselected. After the repair,
both regressions pass and the complete ReactionBar family passes3/3 in fresh
browser runs. Supplied actor/context text remains intact; ordinary Unicode-only
names and string/custom-record callback compatibility remain unchanged. No
consumer patch, alias, wrapper or accessibility/baseline exception participates.

Jujutsu change swolpwus owns the patch and canonical evidence, based on
mainc06db73f. New stories remain visual-pending with public, highlighted consumer
examples. No baseline is created or updated. The normal patch Changeset records
genuine public-package release intent; no version is published during this
source qualification.

## Workspace and dependency scope

Release-remote origin is fetched. The default workspace is clean before the
regressions and contains only this owned repair afterward. Both registered
foundation-auth-base workspaces are clean: /tmp/lapismd-foundation-core-auth-base
at2e528b66 and .foundation-core-auth-base at71c0dd29, each on parentc1e19ba1.
Their committed parents are already ancestors of current main; no ready unmerged
work is omitted or unrelated work integrated. Recheck before publication.
Open Dependabot disposition must be freshly queried before each push and the
release candidate finalized only after any applicable consolidation is merged.
No dependency, tool cohort, registry scope, credential or workflow policy changes.

## Actual verification and remaining gates

- QMD semantic discovery locates DC-CHAT-004; doctor wiring is checked before
  specification qualification. The workspace uses the reviewed Deno-free
  specification validator0.2.1.
- Exact custom-label regression:1 failed/one unselected before editing product.
- Expanded custom/default regressions:2 failed/one unselected before;2 passed/
  one unselected after. Commands and logs are retained outside source as
  /tmp/core-reaction-{before,labels-before,labels-after}.log.
- Complete owning family: `pnpm test:storybook src/shared/ai/experimental/reaction-bar/ReactionBar.stories.svelte`
  passes3/3; /tmp/core-reaction-family-after.log.
- Full `pnpm checks`, canonical/specification checks, source package qualification
  and affected consumer acceptance remain required. A local focused pass alone
  is not a release or complete UI qualification claim.

The first full check stops at spec-first with one missing mapped AI chapter;
validation and book building pass, while parallel quality/unit tasks are
cancelled rather than counted as completed. Update the existing DC-AI-018
acceptance statement too, preserving every source and functional gate. Doctor
reports10 passes and one existing repository script-alias warning.

The next aggregate passes governance and units but reports14 type errors in the
story: embedded script-tag documentation strings confuse the Svelte type
transform. Move the public examples into the colocated example-sources module,
following the repository convention; preserve the same highlighted examples,
regressions and product source. Rerun exact types before broader acceptance.

Release preparation/publication, installation from the registry and the original
jj-store interaction/accessibility regression remain open. Source correctness,
consumer adoption and unrelated jj-store failures are separate gates.

## Final source and cold qualification progress

The external-examples repair passes all four type lanes with zero errors or
warnings, and the complete ReactionBar family passes three cases again. Native
aggregate qualification passes governance, quality, 1,133 source unit cases,
40 release controls, the static catalog build and its metadata audit. Its first
complete interaction run passes all 1,064 cases. The workspace pointer lane
then exposes the separate preview-bootstrap failure recorded in
[the launcher record](2026-11-17-storybook-loopback-startup.md).

After the launcher repair, the exact Kanban target passes and the complete
workspace lane passes 27 cases. Two subsequent native aggregate attempts retain
browser module-fetch failures in different files: 1,060 and 1,040 cases pass,
respectively, but neither is a complete passing aggregate. The first affected
FormPlaceholder/ButtonGroup files pass unchanged in an exact two-case rerun.
The cause of those local module-fetch failures is not proven; no retry, timeout,
assertion, accessibility rule or dependency setting is relaxed.

Cold replacement browser qualification uses the existing reviewed Playwright
1.64.1 Linux image
`mcr.microsoft.com/playwright@sha256:2f05f8a734509a7b3f26a912639488ee08f58a7b292d14d62271bcff9038768f`,
verified Node 24.15.0, pnpm 10.32.1 and a fresh frozen installation. The public
tracked source snapshot is `6291172eec7029c814a3df0352cfe32da1ea8c41`, archive
SHA256 `5cd421508e9d3cc46f10b8844cbdc0fecaeeca9faaafc90f589ec6cbf49b1a9c`.
It receives no host dependency tree, credentials or Docker socket. mdBook 0.5.4's
official musl archive is independently checked against its release asset digest.

The first container attempt passes the exact stories and Kanban reproduction,
then cannot run VCS-dependent governance from a history-free source export.
That failed attempt is retained, not called a product failure or passing check.
Native governance remains authoritative for the actual Jujutsu range. The next
supported run repeats the exact reproductions and passes all 1,064 interaction
and accessibility cases, Workspace 27, Shell 17 and AI 3. Remaining Shadcn browser
and clean packed-consumer gates are still pending at this checkpoint. Logs,
source digest and terminal receipts are retained in
`~/.cache/core-reaction-supported-20261117{,b}/`.

Fresh release preflight fetches origin without a remote change. All three
registered workspaces retain the disposition above: the default owns this
repair; both foundation workspaces are clean and their c1e19ba1 parents are
included in main c06db73f. A fresh open Dependabot query returns no entries;
no empty dependency-consolidation PR is manufactured. It must be refreshed
again before the push. Native release configuration checks pass. Doctor retains
10 passing checks and its existing custom-wrapper alias warning.

## Completed local qualification

The supported run passes all 196 Shadcn cases with its one existing skip,
completing 243 browser cases in addition to all 1,064 Storybook cases. Its
package check then correctly rejects an unpatched dependency in the generated
consumer, despite a zero-finding production audit. The independent runtime
probe proves that missing fixture package-manager metadata selects pnpm 12.21.0
outside the pnpm 10.32.1 owner. This is repaired at the owning cold-consumer
boundary, with the retained failure and exact before/after evidence in
[the package-manager record](2026-11-17-cold-consumer-pnpm-binding.md).

After that private fixture repair, the exact cold `pnpm packages:pack` command
passes: owner-bound pnpm, all retained patch-byte guards, strict types,
development/production browser acceptance and zero-finding production audit.
All 40 release controls pass in both native and supported environments, and
native canonical validation passes all three lanes. The complete tested
product/browser input tree is compared with current source and is unchanged;
only the separately qualified package-validation helper and canonical/evidence
pages differ from the complete browser snapshot. No test, host-security,
accessibility, audit or baseline gate is waived. Native aggregate failures
remain recorded as failed attempts rather than converted into passing exits.

This is completed local source/package qualification. The source PR, hosted
checks, genuine patch versioning/publication and original jj-store registry
consumer acceptance remain open.
