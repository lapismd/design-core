# AI transcript adoption qualification

The user approved ordinary Notes plugin adoption and resumed testing on
2026-10-19. This follows the previously paused composer, read-preview, task,
diff-fence and fixed-footer records. DC-CHAT-002/006/009/013 retain immutable
capture identities, host-owned dispatch and submission acknowledgement.

The public shared source feeds the live chat, import preview and saved-history
consumers. Qualification therefore widens from exact regressions to the full
source unit/Storybook suites, strict source and consumer checks, static build
and the repository's nonvisual gate. Visual baseline updates, publishing and
native provider/storage qualification remain separate.

## Completed source lanes

- Focused transcript/composer unit suite: 55/55 pass.
- Strict `pnpm check`, including specification validation and all three public
  consumer type checks: zero errors/warnings.
- Full `pnpm test:unit`: 829/829 pass across 134 files.
- Focused composer/task/fixed-footer/read-only Storybook: 17/17 pass.
- First full Storybook: 858 pass, one failure in the unchanged Avatar participant
  story. The expected AuthorCard name omitted its existing initials suffix.
  There was no Avatar/AuthorCard implementation diff. Both exact assertions now
  use `About Alex Morgan, AM`; production accessibility behavior is unchanged
  (DC-SHA-058 author identity contract in `shadcn/data-and-feedback.md`).
- Exact Avatar story after repair: 7/7 pass. Full Storybook rerun: 859/859 pass
  across 248 files, fresh Vitest/browser process.
- `pnpm build-storybook`: pass, including the complete static preview.

Logs: `.local/ai-integration-unit.log`, `ai-integration-check.log`,
`ai-integration-unit-all.log`, `ai-integration-stories.log`,
`ai-integration-stories-all.log`, `ai-integration-avatar-story*.log`,
`ai-integration-stories-qualified.log` and
`ai-integration-storybook-build.log` under `.local/`.

The nonvisual gate and final consumer acceptance follow. No release or visual
baseline approval is implied by these results.

The first nonvisual gate stops in spec-first: the existing governance map also
requires the AI Composer and Shadcn author-identity chapters for the status
component and Avatar story edits. Both mapped chapters now describe the same
standalone status/unchanged author-name behavior. Parallel unit/format tasks
are cancelled by that governance failure; the subsequent esbuild shutdown log
is cancellation fallout, not a separate source failure. Full gate retry follows.

## Inline interruption follow-up

The user corrected duplicate live feedback during qualification. A host-marked
TranscriptItem notice now renders one inline semantic warning instead of a
collapsible context. DC-CHAT-006 retains exact captured text; metadataSupplement
supplies the explicit host retry action at the far right. The warning uses the
status-banner tint with a red warning icon on a circular red-tinted background.
Notes suppresses the duplicate fixed composer error for that same interrupted
turn. Composer-only availability errors remain separate. Retry eligibility and
unknown-outcome fencing are unchanged; no implicit dispatch is introduced.

The first source story/type attempt fails on an unused scoped SVG selector.
After using the component-owned global descendant selector, the exact source
story passes 3/3. Strict source-consumer checking then finds an exact-optional
prop mismatch; the optional actions snippet now explicitly admits undefined.
The source-consumer rerun passes with zero warnings. Logs are
`.local/ai-inline-interruption-{stories,stories-2,types-2,source-types-3}.log`.
The consumer exact run initially passes the direct failure and finds one queued
failure still duplicated because its controller error was cleared before the
retained submission error. It now uses the latest visible message/error item;
2/2 consumer interruption cases pass. The current story is manually reloaded
and shows a 12px right inset, red circular icon and zero fixed-footer alerts.

The prepared consumer archive is source 846de7b0d51a3cdc9d855337955b3f39bfdfc15d,
SHA256 a7070630c11e12e74b00480a7ef3fe92a734006153b0e2f2181c1b59c249be73.
This archive precedes the bounded-toolbar repair below; the final archive
supersedes it.

The first nonvisual gate has passed units (829), Storybook (859), static build,
strict types, 16 Workspace pointer cases, 11 shell cases and 3 AI browser cases.
Its Shadcn pointer phase overlaps this requested follow-up and observes a
transient HMR compile error; it cannot qualify the final stable build. Its
failure log remains `.local/ai-integration-nonvisual-4.log`. The stable rerun
follows. A stale exact footer model selector is corrected to include its
existing accessible current-value suffix; product behavior is unchanged.

The stable pointer rerun has 23 passes and five failures. One cold topbar
readiness timeout passes in the subsequent quiet exact run without loosening
any timeout or geometry assertion. Four real expectations are corrected:
formatting must close before its mutually exclusive emoji controls appear;
expanded formatting must scroll within its own row at narrow widths; author
triggers include fallback initials while the details group uses the author
name; and the model button includes its current selection. The narrow toolbar
fix belongs in MarkdownComposer CSS and retains all actions and send controls.
The exact five affected pointer cases pass 5/5 in 1m from a fresh process
(`.local/ai-integration-pointer-exact-3.log`). The broader stable gate follows.

The stable aggregate initially stops on the new notice acceptance sentence
exceeding the atomic bullet limit; the notice detail moves into the governing
prose and the existing four acceptance bullets stay atomic. The CSS chapter
also records bounded formatting overflow. No product test failure is hidden by
the cancelled parallel tasks (`ai-integration-source-final-gate.log`).

## Final package and cold review

The final Notes archive captures source
33e8d58109bfe46521a70520198d1c3fe22d5ac5, SHA256
8d38f6cc7df800fba19307d1dc25de86d6eef08455a8b1bd0157737be570adce.
Only specification/evidence edits follow that code snapshot. Notes consumes its
public exports through the existing ignored archive overlay; tracked package
ranges remain portable. The ordinary Notes review application was rebuilt and
cold-opened with that archive. Existing local saved conversations and import
sources render through the new production inbox, without a new prompt dispatch.
The corrected Sending Error story shows one tinted inline interruption, its
circular warning icon and trailing icon-only Retry tooltip; the fixed hint has
no duplicate alert.

Two final `pnpm checks` attempts stall in the Storybook runner after 246/248
and 245/248 files complete, with no logged assertion failure. The browser
descendants are idle and the output stops advancing; both owned runs are
interrupted explicitly (exit 130). Logs remain
`.local/ai-integration-source-qualified-gate{,-2}.log`. The first pending CV
form/AppShell files pass 17/17 in a fresh exact process
(`pnpm test:storybook src/shared/forms/complete-cv-form/CompleteCvForm.stories.svelte src/shared/shell/app-shell/AppShell.stories.svelte`,
`.local/ai-integration-pending-exact.log`). The subsequent aggregate uses
`TURBO_ENV_MODE=loose VITEST_MAX_WORKERS=2 pnpm checks` to bound test-worker
concurrency without changing cases, assertions or timeouts. Its full result
follows in `.local/ai-integration-source-bounded-gate.log`.

The bounded aggregate completes with exit 0: governance, native CSS,
formatting, strict source and all three consumer checks pass; units pass
829/829, static Storybook and metadata audit pass, and all 860 Storybook cases
pass across 248 files. Browser acceptance passes 16 Workspace, 11 shell and
3 AI cases. The full Shadcn pointer suite passes 151 cases with one existing
conditional skip: Chromium skips the WebKit-only native overlay case, which
passes in the WebKit project. No assertion, timeout or baseline was weakened.
The final record-only follow-up uses formatting and specification validation;
the product source remains the packed snapshot above. Publication, reviewed
visual baselines, other consumers/platforms and native provider/storage gates
remain outside this qualification.
