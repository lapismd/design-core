# Hosted Shell preview qualification

Requirements: DC-SHELL-002, DC-WS-034, DC-WS-050, DC-TOOL-003.

Current-head Core PR #42 source `3faf01f7` reports 993 Storybook passes and one
failure in `AppShell.stories.svelte > NestedProjectAndFileSidebars` during CI
run `41188942555`, job `124501542538`. An inline-presentation assertion receives
`overlay`. The generated story source location does not identify which of the
three dismissal phases failed. Full diagnostics are retained in
`/tmp/lapis-core-pr42-storybook-failed-20261031.log`.

The candidate retains all original attributes, geometry, focus and timing
assertions and adds distinct assertion context for initial inline presentation,
edge departure, short-hover cancellation and selection-followed dismissal.
Exact cold Linux repetition and affected-family/catalog qualification remain
required before a repair can be committed and pushed. No failed hosted gate is
retried or waived, and the PR remains unmerged.

Read-only review identifies a missing final selection precondition: the story
schedules preview dismissal immediately after an option click/text change.
Sidebar's document `focusin` intentionally calls `keepPreview` for its owned
selector, cancelling a pending dismissal. Legitimate late Select focus
restoration can therefore cancel that scheduled timer. Before the unchanged
`schedulePreviewDismiss(0)`, the candidate requires physical option removal,
restored selector focus and completed pointer admission under the existing
default deadline. All original timers, focus/geometry and inline/overlay
assertions remain. Earlier edge and short-hover phases are unchanged; their
failure has not been reproduced.

## Problems quick-fix keyboard ownership

Five independent cold invocations of the original exact Shell target pass.
The context-only diagnostic source `e91d43a2` passes the exact Shell case and
all 16 App Shell stories, then its complete catalog reports 993 passes and one
failure in `WorkspaceProblems.stories.svelte > BottomPanel`. The quick-fix menu
remains open after Escape. Its trigger currently stops propagation for every
keydown, including Escape before focus moves into the menu. The old story
cleanup also manually removes dropdown nodes and clears document locks; those
mutations cannot qualify real dismissal.

The new exact `QuickFixEscapeFromTrigger` regression opens the real production
quick-fix with Enter, retains the no-row-navigation assertion, dispatches Escape
at its opening trigger and requires actual portal removal plus released pointer
admission. The before target must fail before the owning keyboard handler is
repaired. Source receipts remain under the `sidebar-diagnostic` results sibling.

Cold Linux before source `99c9bde5` fails that exact new regression once, with
six intentionally filtered cases: Escape leaves the real menu `data-state=open`
and physically mounted. The repair lets only Escape bubble from the trigger;
all other keyboard propagation and pointer/activation handling remain unchanged.
The shared Problems story helper now uses Escape, captured portal removal and
pointer-release assertions instead of mutating DOM or document locks. Exact
regression, all seven Problems stories, Shell family/catalog and complete owner
qualification remain required after this production correction.

## Corrected owner and host qualification

Immutable production source `c6ea034a668ae0c38d2c7b160217d2abe759bd3d` passes
the same exact Escape regression, all seven Problems stories, five independent
cold NestedProjectAndFileSidebars invocations and the complete 16-case Shell
family. Its uncached complete aggregate passes 920 units, 995 catalog/axe cases,
all four strict surfaces with zero errors/warnings, formatting/spec/static,
Workspace 16, Shell 17, AI three and Shadcn 153 browser cases with one existing
platform skip. The complete aggregate exits zero, with no cached lanes or
flaky/retried cases. The following exact public-package command also passes:
three installed patch postimages, clean strict types and cold development/
production runtime behavior in both themes have no Svelte diagnostics. The
existing advisory-specific low KaTeX acceptance remains explicit for six
affected packages; no new exception is introduced.

The retained-source prepared archive is kept separately from the earlier
candidate under `qualified-popup-artifact`, SHA-256
`fc8b527931d01efc94b64076689de52d9abb79c00c67e3eb32057a69f360bea9`.
Its pre-version manifest still says 0.7.2; these bytes are not npm 0.7.2 and do
not satisfy final registry consumption. Earlier candidate archives remain intact.

The regression additionally checks both tree and table production hosts at
source `3786f4e2b25f1bb318ec0baaac66a8c4ee02a6b7`. Only the excluded story
file changes from the production candidate: runtime source, manifests, frozen
lock and shared patch remain identical. That exact target, all seven Problems
stories, four strict checks, all 995 catalog/axe cases, static Storybook and
specification pass. This strengthens the host coverage without repeating
unrelated already-green runtime lanes. Receipts remain under
`/tmp/lapis-core-tracked-patch-validation-20261031/{popup-after,problems-hosts}/results`.

The popup-after driver's human-readable source description was copied from the
previous packaging worker. Its exact source commit, verified immutable bundle
and frozen graph identify the corrected production code above; the stale
description does not imply that the Problems runtime is unchanged from `97d`.
Original raw receipts remain intact. Protected current-head PR checks, version
review and actual publication remain separate gates.

Final pre-push HTTPS fetch leaves main at `3ee2b016`. All 23 registered
workspaces remain accounted for, with 14 available roots and no new
registrations or other changed heads. The retained stale Linux diagnostic
checkout stays untouched; its registered revision is read without updating the
working copy. Full inventory:
`/tmp/lapis-core-popup-final-workspaces-20261031.json`.
Open Dependabot count is zero. Fresh production/full pnpm audits both exit zero,
with zero advisory records; production has zero vulnerabilities, and full
metadata retains the existing low count under the unchanged policy. Raw audit
JSON remains in `/tmp/lapis-core-popup-audit-{prod,full}-20261031.json`.
