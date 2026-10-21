# Dark syntax defaults

Scope: DC-SHA-008 and DC-DIFF-003. Notes' new native history view exposed light
syntax colors on the dark unified-diff surface. Source work is isolated in the
`reusable-history` Jujutsu workspace at `fa174d7e`, matching its existing public
artifact and preserving unrelated transcript/avatar work in the default checkout.

The default syntax stylesheet defined only light colors. Changed diff rows
already use their separate readable foreground; unchanged Markdown headings
retain normal syntax colors and exposed the low-contrast light keyword.
The owning bundled stylesheet now rebinds the existing public tokens within
`.dark`. It preserves light defaults, host default overrides and explicit
`SyntaxTheme` values. No runtime style injection, new API, consumer override,
transport, data or authority is introduced.

## Exact regression

- Initial case-sensitive `-t 'Dark unchanged Markdown|Dark defaults preserve'`
  matched no generated test titles: 23 skipped. This is not acceptance evidence.
- `node scripts/with-storybook-env.mjs pnpm exec vitest run --project storybook
src/shared/diff/file-diff/FileDiff.stories.svelte
src/shared/shadcn/code-block/CodeBlock.stories.svelte -t Dark` before the fix:
  two failed, 21 skipped. Axe found the dark diff heading and default CodeBlock
  keyword/number unreadable. The CodeBlock keyword had 1.62:1 contrast and its
  number had 2.82:1 against `#1d293d`; Notes independently reproduced 1.85:1
  against `#1e1e1e`.
- The same exact command after the fix: two passed, 21 skipped, from a fresh
  test process. The plays retain syntax-color and explicit Dracula override
  assertions; accessibility rules and timeouts remain unchanged.
- All eight affected Storybook families: 86 passed. The exact command is the
  same wrapper and project with the directories `src/shared/shadcn/code-block`,
  `src/shared/forms/code-highlighter`, `src/shared/diff/file-diff`,
  `src/shared/diff/merge-editor`, `src/shared/chat/prompt-context`,
  `src/shared/chat/sent-context`, `src/shared/chat/transcript` and
  `src/shared/ai/tool-call-detail`, without a name filter.

The new stories carry `visual-pending` and public consumer source examples.
No baselines are created or updated. The isolated catalog base port is 9359.
Initial offline `pnpm install --frozen-lockfile --offline` succeeded without
tracked dependency changes. The first guide command failed before dependencies
existed; the repository's testing/layer guides pass after installation.

## Remaining qualification

The shared palette affects multiple independent component families, so the
required `pnpm checks` escalation covers specification, formatting, types,
units, all stories, pointer/browser and static catalog lanes. Then pack
the owning artifact and retry the Notes history family through public exports.
Record actual counts, failures, versions and archive provenance before commit.
This source repair cannot complete Desktop M13.2 or jj-store M33; native visible
history and durable conversations retain their original gates. Publication and
visual approval remain separate operator actions.

## Docs and source review

The initial full `pnpm checks` command passed: 821 unit cases in 131 files,
828 Storybook cases in 239 files, four clean Svelte/type-check profiles, static
catalog build, 16 workspace, 11 shell, three AI and 140 shadcn browser cases.
One existing WebKit-only preference case is skipped in Chromium. No screenshots
or visual baselines were updated by these functional lanes.

Review found that CodeBlock's authored Docs page did not expose the new dark
example, while the dark diff example used an inline Canvas. The two exact
`tests/shadcn/syntax-docs.spec.ts` browser regressions failed before the Docs
followup because neither dark iframe was present. Docs now renders the public
CodeBlock example, and both dark examples use isolated canvases. The primary
CodeBlock example also includes its complete public source rather than a local
fixture variable. DC-CAT-006 keeps the parent page's mode authoritative.

The exact cold Docs command is `node scripts/with-storybook-env.mjs pnpm exec
playwright test -c playwright.shadcn.config.ts tests/shadcn/syntax-docs.spec.ts
--project chromium`: two passed after the followup. The initial after attempts
exposed test-selector mistakes: Show code is a switch, the autoDocs page repeats
its primary story, and expanded source is connected through `aria-controls`.
The test now targets the named Canvas and its actual controlled source panel.
Dark-child/light-parent, visible syntax and complete public usage assertions
remain intact; no timeout or accessibility rule was relaxed.

All 23 CodeBlock/FileDiff stories pass after the catalog followup. A fresh full
check/static run is in progress. Production palette code is unchanged from the
first passing full pipeline. Raw logs remain under jj-store's ignored
`.local/reusable-conversations/history-dc-*`.

## Prepared downstream artifact

`pnpm package:local` passes. The built public archive has SHA256
`3132753a9449aa443eb3cc22f8b0823299eb38ba6c3a787a22a9422a40f8d530`;
its stylesheet preparation audits 253 files, compiles three inputs and retains
zero utility references. Its Diff exports point to public built JS/declarations
and its packaged syntax CSS includes the dark palette. This is an ignored local
validation artifact, not a published version.

Notes installs it through its existing ignored archive manifest. An initial
malformed local archive path fails before installation; correcting the manifest
allows `pnpm local:install` to verify all 14 public import routes with tracked
dependency files preserved. An exact browser attempt started before installation
finished fails to import its test module and runs no tests. After installation,
the cold desktop-dark `Unified Diff` regression passes, with 15 other stories
skipped. The subsequent `pnpm test:storybook
catalog/plugins/repository/History.stories.ts` passes all 16 scenarios in each
desktop/narrow and light/dark combination, 64 total. No consumer CSS workaround,
accessibility suppression or assertion relaxation is introduced.

The complete Notes desktop catalog is now running because public styles and
shared startup have consumers beyond the repository family. Its result and the
final source pipeline must be recorded before source qualification closes.

The followup full source pipeline passes its specification, types, 821 unit
cases, 828 stories, static build and workspace/shell/AI browser lanes. Its
Shadcn browser lane reports 141 passed, one failed and one existing skip. The
panel-toggle trace records a page reload at the exact time this record was
updated (00:26:43 local); that live reload resets the tested toggle. This is a
failed aggregate attempt, not a clean pass. Qualification now holds source
files fixed during browser checks and reruns the original target.

The complete Notes desktop-light lane reports 155 passed and 12 failed; its
remaining three configurations do not run. The exact Agent Trace and axe
failures identify earlier Tool Calls accessibility fixes missing from the 0.5
artifact. The compatibility carry-forward and fresh qualification are recorded
in `2026-10-18-tool-disclosure-compatibility.md`. Neither defect is concealed by
changing consumer assertions or disabling accessibility checks.

Versions: Design Core 0.5.1 source, pnpm 10.32.1, Node 26.9.0, Vitest 4.1.11,
Playwright 1.61.1, Storybook 10.6.1, macOS ARM64. Publication is deferred.

Final source qualification after both prerequisite repairs passes `pnpm checks`:
821 unit tests, 834 stories, static catalog, strict types and all 172 browser
cases, with one existing skip. The formerly failing panel toggle also passes its
cold exact retry. Source results and final public artifact provenance are in
`2026-10-18-message-status-contrast.md`; its complete current-app consumer gate
now passes all 692 checks. No failed attempt, native gate or visual status is replaced
by this source pass.
