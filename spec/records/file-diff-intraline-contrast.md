# File Diff changed-row and intraline syntax contrast

Enclosing Jujutsu change uurqlmls. DC-DIFF-003 adds readable syntax foreground
on changed rows and stacked intraline washes. Public file bytes, tokens, diff models and slots
remain unchanged. No baselines were updated, package published or unrelated
services restarted.

Before: jj-store rich-tool recorded edit story failed Axe for numeric syntax
spans (2.37 and 2.89 contrast). Source FileDiff now selects the diff foreground
on changed rows/segments; unchanged rows retain the syntax palette. New exact
story and all FileDiff stories pass (11/11) in a fresh runner. Consumer uses its
existing documented local Design Core validation setup; manifests stay portable.

Commands: `pnpm exec vitest run --project storybook src/shared/diff/file-diff/FileDiff.stories.svelte` passed 11/11.
`pnpm checks` first refused the newly authored non-atomic spec paragraph;
converted it to its required acceptance bullet. The wider rerun and its
unresolved inherited interaction failures are recorded in
[shared chat qualification](shared-chat-qualification.md).
Visual comparison and baseline review remain separate.

The final cold consumer exposed keyword contrast of 3.76 on the added-row wash.
The repair now covers keywords outside intraline segments as well; the exact
source family rerun passes 11/11. The strengthened story asserts all four
changed-row keywords in addition to both changed numeric segments. Log:
`/tmp/design-core-chat-diff-row-contrast-final.log`.
