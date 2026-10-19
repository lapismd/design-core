# Await completed catalog interactions

2026-10-19; enclosing Jujutsu change.

The main-workspace footer/menu qualification runs the complete current catalog
with Storybook 10.6.1 and file-serial Chromium. It exposes two timing assumptions
in existing interaction fixtures. Product behavior is unchanged under
DC-CHAT-002, DC-AI-011 and DC-SHA-046; geometry, icon alignment, disabled editing,
submenu actions and accessible interaction remain required.

- The attachment-drawer case measures 68px immediately after collapse against
  its 36px limit. An exact fresh run passes, but a full `--bail=1` run reproduces
  the failure after 380 passes (one failed case). Await the unchanged 36px
  assertion with the existing `waitFor` deadline; the exact repair passes.
- A subsequent full run passes 693 cases, then the submenu alignment story
  attempts its first click while the previous action menu still suppresses body
  pointer events. Its exact two-case file passes in isolation, confirming the
  timing dependence. Both action stories now await menu closure and normal body
  pointer events before completing. No DOM removal, style reset, forced click,
  timeout increase or assertion removal is used.

Exact commands:
`pnpm exec vitest run --project storybook --browser.fileParallelism=false`
with `src/shared/chat/markdown-composer/MarkdownComposer.drawer.stories.svelte`
or `src/shared/shadcn/dropdown-menu/DropdownMenuConsumer.stories.svelte`.
The combined exact after run includes both files. Complete serial qualification
uses the same command without file filters and with `--bail=1`.

Logs under `.local/verification/footer/`: `drawer-exact-{before,after}.log`,
`dropdown-exact-before.log`, `overlay-drawer-exact-after.log`,
`followup-storybook-final.log`, `followup-storybook-complete.log` and
`followup-storybook-qualified.log`. The first broad run was stopped after its
observed failure; the next two bail results are incomplete catalog results,
not full-suite passes.

`pnpm spec:search 'Dropdown Menu'` cannot find the repository-local QMD binary;
the advertised `rg` fallback locates the canonical DC-SHA-046 chapter. The
official shadcn-svelte Markdown reference is read without installing or
regenerating a component.

Milestone review: existing component contracts remain Implemented. These
fixture-only changes make their original completion conditions explicit during
the footer/main-body integration. Final broad counts, packing and desktop
handoff remain in the footer follow-up records; no visual baseline or product
gate is promoted.

The combined exact after run passes all three cases in both files. The first
spec-first run rejects missing mapped chapter changes for the two fixture
edits; the owning chapters now state the same interaction-completion guidance
alongside the unchanged product contracts. No public prop or component CSS
changes. Logs retain that failed governance attempt before the corrected run.

The corrected three-lane spec check and source type check pass. The user then
requests minimal remaining testing; the final broad catalog attempt is stopped
without another observed failure or a full-suite claim. Its completion is
explicitly deferred. The focused three-case after result qualifies both fixture
repairs under that final scope instruction.
