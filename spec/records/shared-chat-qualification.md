# Shared chat source qualification

Enclosing change uurqlmls, parent cea38ac5; DC-AI-015 and DC-DIFF-003.
Updated 2026-10-08. No publication, baseline updates or installed service changes.

## Focused source and consumer evidence

- The three ToolCalls source families pass 10/10; FileDiff passes 11/11.
- jj-store's focused chat/group/rich units pass 23/23 and the directly affected
  story families pass 17/17. Its final two-family width/icon rerun passes 11/11.
- Live saved-session tools measure 798/798px, with all five disclosure icons
  14x14px and 8px inside each trigger's hover surface.

## Wider source checks

`TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=1 pnpm checks` passed formatting,
full types/consumers/governance and 722 unit tests. The initial static Storybook
build/metadata audit passed. Storybook interactions returned 672 passed / 2
failed: InteractiveSampleCV and ControllerOwnedWorkspaceSettings each exceeded
30 seconds. Log: `/tmp/design-core-tool-layout-checks.log`.

The exact unchanged rerun was:

```sh
VITEST_MAX_WORKERS=1 pnpm exec vitest run --project storybook src/shared/forms/complete-cv-form/CompleteCvForm.stories.svelte src/shared/workspace/settings/WorkspaceSettings.stories.svelte -t 'InteractiveSampleCV|ControllerOwnedWorkspaceSettings' --maxWorkers 1
```

Workspace settings passed; CV timed out again. The exact CV test on untouched
parent cea38ac5 also failed 1/1 at Target Roles. The disposable workspace is
`/private/tmp/design-core-chat-baseline-01a117ad`, change yvouvunp; its frozen
dependencies were installed offline without scripts. Its log is
`/tmp/design-core-tool-layout-cv-parent-real.log`. The earlier dependency-symlink
import refusal is not baseline proof. Owner: CompleteCvForm story/interaction
readiness in Design Core, outside the changed ToolCalls/FileDiff families.

After the final FileDiff story visual-pending tag, this fresh command passed:

```sh
TURBO_CONCURRENCY=1 VITEST_MAX_WORKERS=1 pnpm exec node --env-file-if-exists=.env scripts/run-turbo.mjs ci:storybook-static --summarize
```

Build and audit: 2 successful tasks, 133 workspace stories, 93 visual-pending,
34 approved, 6 skipped, 0 contract errors and 0 orphan baselines. Log:
`/tmp/design-core-tool-layout-static-tags.log`. Final focused formatting passed
before this evidence refresh; the refreshed records require another formatter
check.

## Remaining lanes

The sequential browser command stopped at workspace acceptance, returning
6 passed / 9 failed. Eight pointer cases and notification readiness timed out;
the bottom-panel failure screenshot remains a Storybook loading spinner.
Artifacts are retained in `/tmp/design-core-chat-workspace-failures`, and the
log is `/tmp/design-core-tool-layout-browser-rest.log`. The same workspace lane
is running on the untouched parent to establish each failure's baseline status.

The shell lane completed with 1 passed / 10 failed (loading/readiness timeouts
in mobile pointer and Docs/MDX cases). Those failures are not yet individually
qualified on the parent. Owner: Design Core browser/Storybook readiness. The
unchanged parent workspace lane finishes with 3 passed / 12 failed, repeating
all nine original failures and three additional timing failures under the same
machine load. Log: `/tmp/design-core-chat-workspace-parent-final.log`. Owner:
Design Core workspace browser/Storybook loading readiness.

AI finishes with 0 passed / 3 failed: navigation to composer and reasoning
stories exceeds 30 seconds, and Layout's visual-readiness wait exceeds 15
seconds. These are not yet parent-qualified. Shadcn finishes with 36 passed /
12 failed / 1 skipped in 23.2 minutes. All 12 failures occur at Storybook
readiness waits: Chromium's fixed column canvas and four Swipe Item cases,
and WebKit's four Scroll Area preference and three overlay cases. These are
not parent-qualified and are not classified as proven baseline failures.
Owner: Design Core browser/Storybook readiness. Separate logs are retained under
`/tmp/design-core-chat-browser-*-final.log`, with all three lane exit codes (1)
in `/tmp/design-core-chat-browser-final-outcomes.json`. The orchestration exit
code 0 confirms collection only, not passing tests.

The final row-keyword contrast repair passes the strengthened FileDiff family
11/11. Its fresh static rebuild encountered ENOSPC while copying baselines;
`/tmp/design-core-chat-contrast-static-final.log`. The unchanged committed
baseline files were restaged into generated output only; no baseline changed.
The canonical static retry passes in 29m25s: 2 successful tasks, 133 workspace
stories, 93 visual-pending, 34 approved, 6 skipped, 0 contract errors and
0 orphan baselines; `/tmp/design-core-chat-contrast-static-retry.log`. This is
the final repaired output, not a substitution of the earlier static pass.

Canonical visual comparison is pending in the owned Docker capture runner;
`/tmp/design-core-tool-layout-visual.log`. It uses Simple and Expandable stories,
fresh capture, nested-import baseline paths, warn failure mode and no updates.

Source full checks are not qualified. The parent guide requires explicit user
acceptance before treating demonstrated unrelated pre-existing failures as
nonblocking. Acceptance was requested on 2026-10-08 for local landing with the
source qualification gaps retained as follow-up; no answer has been received. This source change
and the dependent jj-store integration remain uncommitted pending that review.

## Continued evidence checks

After the final browser outcomes were recorded, `pnpm spec:check` passed all
three lanes (validation, mdbook and spec-first);
`/tmp/design-core-chat-continued-spec.log`. The changed record was formatted with
`pnpm exec prettier --write spec/records/shared-chat-qualification.md`.
The final result text receives a focused formatting check before handoff.
These document passes do not waive the retained interaction/browser gaps.
