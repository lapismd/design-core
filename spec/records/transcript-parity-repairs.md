# Transcript parity repairs

17 October 2026. Repair change above `qsotnrqk` (`a007abd0`), preserving the
separate Transcript and Panel Toggle parents. Reference: jj-store `3be80ad2104f`,
Apache-2.0, LapisMD contributors. No consumer migration or release is included.

## Reviewed gaps

1. Reply context now has one padded, bordered surface.
2. Jump to end and its keyboard shortcut focus the enabled composer, falling
   back to the last item when there is no editable composer.
3. Classic uses the shared Message primitive with a 36px avatar, author/role
   header and hover surface. One mounted body retains readers across views.
4. The full conversation keeps multiline Enter in both views.
5. Host-authorized sent/replied comments can create versioned replacement drafts.
   The original remains current until publication acknowledgement; exact version
   matching protects newer host versions. Returned versions enable further edits.
6. Document formatting and emoji actions can be rendered in the fixed footer;
   Classic retains its inline toolbar. The live snippet is released on teardown.
7. Metadata includes valid full-date timestamps, edited state, reply participants,
   counts and host-owned navigation. The existing supplement remains supported.
8. Long queued messages use the compact chevron fold with a trailing divider.

The earlier review's 14px reply typography is preserved. The subsequent user
request restores the last nonempty current root comment per collapsed discussion,
matching jj-store; expansion restores earlier comments and agent responses stay
in their linked messages. Sent context precedes the message chrome so its height
does not displace the prompt from the avatar centre. Recordings remain unchanged;
metadata, comments, linked replies and queued messages are labelled demonstrations.

## Focused evidence

Commands use pinned pnpm 10.32.1. Browser commands use
`SHADCN_STORYBOOK_PORT=9609 SHADCN_VISUAL_SERVER_PORT=9610` unless stated otherwise.

| Target                                                                                                                                       | Before                                                       | After                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `pnpm test:unit src/shared/chat/transcript/controller.spec.ts`                                                                               | 18 passed                                                    | Included in family run                                                      |
| `pnpm test:unit src/shared/chat/transcript/comment-edit.spec.ts`                                                                             | 5 new regressions failed because editSent was absent         | 8 passed, including queue publication, version races and pending submission |
| `pnpm test:unit src/shared/chat/transcript`                                                                                                  | Existing controller baseline above                           | 42 passed                                                                   |
| `pnpm test:shadcn:pointer tests/shadcn/transcript-parity.spec.ts`                                                                            | 4 original browser regressions failed                        | All 6 cases pass in the final affected matrix                               |
| Added avatar-centre regression in that file                                                                                                  | Sent context and inline avatar baseline displaced the prompt | First visual line centres within 1px, including wrapped prompts             |
| `pnpm test:storybook src/shared/chat/transcript/Transcript.stories.svelte src/shared/chat/markdown-composer/MarkdownComposer.stories.svelte` | Prior focused baseline recorded separately                   | 30 passed                                                                   |

Logs: `/tmp/dc-parity-baseline-units.log`, `/tmp/dc-parity-edit-before.log`,
`/tmp/dc-parity-before.log`, `/tmp/dc-parity-after.log`,
`/tmp/dc-parity-regression.log`, `/tmp/dc-parity-units-final.log`,
`/tmp/dc-parity-stories.log`.

## Expanded evidence

`pnpm checks` passes canonical validation/mdBook/spec-first, full formatting,
all four type configurations (zero errors/warnings), the native-CSS audit,
796 unit tests, 3 Turbo helpers, 16 release helpers, the static Storybook build,
metadata audit (zero contract errors) and all 802 Storybook interaction/axe tests
across 232 files. Log: `/tmp/dc-parity-checks-verified.log`.

The directly affected native matrix covers `transcript-parity`, `transcript-view`,
`transcript`, `transcript-review`, `sent-context`, `chat-composer-actions` and
`comment-composer` in `tests/shadcn/`. The final fresh-server run passes 51/52:
one existing composer-position case times out in `waitForVisualStoryFinished`
before its assertions. That exact unchanged case passes 1/1 on port 9509
(`--grep 'composer text starts near'`). Logs: `/tmp/dc-parity-browser-final.log`
and `/tmp/dc-parity-cold-recheck.log`. This is not recorded as an aggregate pass.
Every new regression, source/quote retention, IME, view switching, reactions,
queue/footer, inspector lifecycle, typography and theme assertion passes.

Earlier overlapping build/package runs caused live catalog reloads from
`.local/package-stage-*/package/src/*`; the first mixed matrix was 44/52.
The quiet final rerun clears those failures. The sent-context test now checks
that context precedes the message rather than depending on its former inner
wrapper. The avatar assertion measures the first visual line, not an entire
wrapped CodeMirror logical line; its residual 1.9px baseline offset was fixed
by making the avatar wrapper flex. Neither assertion tolerance was loosened.

Public archive acceptance passes types plus cold development and production
runtime in both themes without Tailwind tooling, including versioned comment
replacement and docked toolbar teardown/remount (`/tmp/dc-parity-pack-verified.log`).
Two fixture repairs were needed: ES2022-compatible last-item selection replaced
`findLast`, and the XML fixture now supplies multiline Markdown to exercise a
real disclosure rather than expecting one for a compact inline tag. The final
archive/build refresh after the two-line avatar alignment adjustment passed
(`/tmp/dc-parity-pack-current.log`, `/tmp/dc-parity-build-current.log`). Both
source and distribution CSS in the archive contain the avatar flex adjustment.
These artifacts predate the final collapsed-comment refinement below.

## Collapsed-comment refinement

The user requested last-comment summaries after the parity fixes. The exact
native regression `collapsed files show the last comment and expansion restores
the discussion` initially failed: 3 cards rendered where 1 was expected
(`/tmp/dc-collapsed-last-before.log`). The refinement restores jj-store's
nonempty current root-comment selection in summary placement only. Earlier
comments return on expansion; queue, history and reply-context presentation
retain their existing filtering.

The exact regression passes 1/1 after the change
(`/tmp/dc-collapsed-last-after.log`). A fresh server on 9609 runs all four
Transcript browser files (`transcript-parity`, `transcript-review`,
`transcript-view`, `transcript`): 34 passed and one existing view-retention
assertion still expected three collapsed cards. Its expected count now reflects
the requested one-card summary and also checks the latest comment's text; reader,
draft, source and disclosure assertions are unchanged. The complete
`transcript-view.spec.ts` rerun passes 3/3. Logs:
`/tmp/dc-collapsed-last-browser.log`, `/tmp/dc-collapsed-last-view.log`.
This is recorded as a matrix plus a repaired-file rerun, not a single 35/35 run.

Final source passes `pnpm test:unit` (796/796), `pnpm check:types` (all four
configurations, zero errors/warnings), `pnpm check:no-tailwind`,
`pnpm fmt:check`, `pnpm spec:check` and `pnpm test:storybook` (802/802 across
232 files). `pnpm build-storybook`, `pnpm workspace:visual:audit` and
`pnpm packages:pack` also pass. Both source and distribution files in the final
archive contain the last-root-comment selection. Logs use the prefix
`/tmp/dc-collapsed-last-` with `units`, `types`, `css`, `fmt`, `spec`, `stories`,
`build`, `metadata` and `pack` suffixes followed by `.log`.

Manual review confirms the single comment and retained source/reply controls in
the full recorded conversation. Image: `/tmp/dc-transcript-last-comment.png`.

Manual review inspected Document and Classic with the same recorded conversation.
Images: `/tmp/dc-transcript-document-parity.png` and
`/tmp/dc-transcript-classic-parity.png`. Storybook stays on port 9509.

## Full-conversation footer state cycle

The user reported that stopping the full example did not restore idle and that
typing during a response should show the upward Queue arrow. The shared footer
already selects jj-store's paper-plane Send, upward Queue arrow and square Stop
from controlled runtime state. The full story only set `stopping = true` and
never simulated acknowledgement, leaving it permanently pending.

The full example now acknowledges its simulated stop by clearing busy/stopping,
and idle submission starts a new simulated response. Publication is chosen from
the pre-submission busy state so a new idle send is published, not reported as
queued. The separate pending-stop scenario still awaits host confirmation.
Consumer source documents and forwards host-owned runtime callbacks/state.

The exact regression `full document footer transitions between running, queueing
and acknowledged idle` failed 1/1 before the change because Send never appeared
after Stop. The same command passes 1/1 after the fix on port 9509:
`pnpm test:shadcn:pointer tests/shadcn/transcript-review.spec.ts --grep 'full document footer transitions'`.
Logs: `/tmp/dc-footer-cycle-before.log`, `/tmp/dc-footer-cycle-after.log`.
It checks the SVG icon and enabled state for every transition, queue submission,
acknowledged idle, new idle submission and typing during the next response.

Manual browser verification confirms the same cycle in the full recorded story.
Images: `/tmp/dc-footer-idle-final.png` and `/tmp/dc-footer-cycle-final.png`.

A fresh Storybook server on 9609 ran all four Transcript browser files
(`transcript-parity`, `transcript-review`, `transcript-view`, `transcript`):
34 passed and two failed before assertions in `waitForVisualStoryFinished`.
The affected cases are `sent comments edit through acknowledged versioned drafts
and expose message metadata` and `unknown queue outcomes remain visible after a
host review request`. The new footer state-cycle case passes in this cold run;
the entire matrix is not a pass. No readiness timeout or assertion was weakened.
Log: `/tmp/dc-footer-cycle-browser.log`; failure traces are retained under
`/tmp/dc-footer-cycle-browser/`.

Current source also passes all four type configurations with zero errors/warnings,
796 unit tests, the native-CSS audit, full formatting and canonical specification
checks. Logs: `/tmp/dc-footer-cycle-types.log`, `/tmp/dc-footer-cycle-units.log`,
`/tmp/dc-footer-cycle-css.log`, `/tmp/dc-footer-cycle-fmt.log` and
`/tmp/dc-footer-cycle-spec.log`.
All 802 Storybook interaction/accessibility tests pass across 232 files, including
the idle icon assertion (`/tmp/dc-footer-cycle-stories.log`).
The static Storybook build and visual metadata audit pass with zero contract
errors (`/tmp/dc-footer-cycle-build.log`, `/tmp/dc-footer-cycle-metadata.log`).
This footer correction changes catalog state, examples and regression evidence;
packaged runtime files are unchanged from the earlier packed-consumer acceptance.
No screenshot baselines were updated.

## Qualification boundary

The complete `pnpm checks` run stops at Workspace pointer acceptance: 8 passed,
7 failed, matching the earlier extraction's seven drag failures. The exact
centre/empty-sidebar cases were previously reproduced on unchanged main
`31b5d2e2`; see `transcript-extraction.md`. Owner: Workspace Tabs/drag. Subsequent
aggregate Shell, AI and Shadcn lanes are not reached by that command. Those
unwaived repository failures remain separate from the repaired Transcript cases.

At completion of validation, repair change `nnlworlu` remained uncommitted under
the repository's verified-slice policy. Its Transcript and Panel Toggle parents
were preserved. Changed stories remain `visual-pending` and no screenshot
baseline is updated.

Final status inspection also found concurrent history work in the separate
`community-components` workspace. It retained older revision `0406f7f1` of
`nnlworlu`, making the current `chat-transcript@` revision divergent. This
checkout's tested tree and parents remain intact. Neither revision was abandoned,
rebased or reconciled here; use the workspace-qualified revision when resuming.

## Local main-workspace integration

On 17 October 2026, after the qualification boundary was reported, the user
explicitly requested landing these changes in the main workspace. This local
integration preserves the recorded failures; it does not declare full
qualification or authorize publication.

The clean default workspace at `36dad148` had parent `31b5d2e2`, which is already
an ancestor of the reviewed Transcript stack. The main checkout can therefore
advance to that exact tested tree without merge resolution or runtime changes.
The formatting, Transcript extraction, Panel Toggle integration, footer/queue
presentation and review-repair commits remain separate. Other workspace heads
and the published `main` bookmark are preserved.

The runtime qualification above is reused because only this evidence record
changes during integration. Its formatter and canonical validators are rerun.
The main checkout's dependencies are refreshed from the frozen registry lockfile,
and its tracked tree is compared with the reviewed snapshot after advancement.
No push, release, consumer migration or visual-baseline update is included.
