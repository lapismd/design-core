# Cursor and comments inside rich Markdown

The user found that whole-block Markdown widgets prevented cursor placement and
selection in fenced code and tables. Block-level comments were insufficient for
the requested context workflow. DC-CHAT-006/007 now retain immutable nested Mira
readers for code bodies and GFM table cells.

Parser ranges map cells/code into the original block's UTF-16 coordinates; text
search is never used, including repeated Unicode cell values. Differing rendered
table topology receives no invented ranges. Comments retain the full original
block ID/revision/quote. Parent comment cards render after the rich block and
source navigation selects/focuses a still-mounted nested reader. Teardown removes
only owned readers. Typing/paste/IME opens a comment; transactions cannot edit
captured text.

The code frame adapts Mira's `preview/components/code.svelte` (Apache-2.0), using
its public language-label helper and MiraCodeEditor plus shared Button. It shows
the language and copy action with one owned background. This host comment
integration uses public exports; no dependency internals are imported or patched.
The reference revision is Mira `a95a541b`; its language/copy framing is adapted
because the default preview does not expose immutable comment-aware readers.

The new actual interaction story selects a code line and a table cell, opens
comments and checks both exact quotes and unchanged captured code. It initially
passes interactions but fails two contrast cases (4.47:1 code variable on the
muted code frame). The existing transcript code-token contrast recipe now also
applies to embedded code. The exact two rich scenarios then pass, and source
range/anchor/controller/edit unit cases pass 31 tests in four files.

The first strict type run reports nine captured-prop warnings. Widget lifetime
snapshots are now explicitly untracked; source and all three consumer type
profiles pass without warnings. Final family/spec/pack results and original
consumer failures remain in Notes E-AI-039. Broad provider/platform/release
checks and visual approval retain their original gates.

Final source acceptance: four complete directly affected families pass 32
interaction/axe cases. Spec-first passes 17 protected files/four chapters;
specification validation passes eight validators/31 chapters/299 requirements.
The built archive and Notes' cold browser acceptance are recorded in E-AI-039.

Commands: `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte -t 'Markdown|CodeAnd'`;
`pnpm exec vitest run --project unit src/shared/chat/transcript/rich-source.spec.ts src/shared/chat/transcript/controller.spec.ts src/shared/chat/transcript/comment-edit.spec.ts src/shared/chat/transcript/anchors.spec.ts`;
`pnpm check:types`. Logs: `/tmp/lapis-ai-rich-reader-*`.

Follow-up review found nested line gutters and 32px document-page padding in
every table cell (102.7px single-line rows). Nested readers now explicitly omit
gutters and set the public embedded-editor margin tokens on their own editor
host. The rich geometry story asserts a single-line cell below 48px and no
gutters in tables or code. The exact Markdown case passes; the complete
Transcript family passes 25 interaction/axe cases after correcting the new
comment story to target its inline comment group instead of the duplicate queue
editor. Earlier global-editor and incorrect-region queries failed and remain
recorded in Notes E-AI-039. Commands: `pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.stories.svelte -t 'Markdown|Code and table'`
(one pass/24 skipped; generated story names require the complete family), then
`pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.stories.svelte` (25 passes).
Logs: `/tmp/lapis-ai-rich-final-{exact,family,types}.log`.
