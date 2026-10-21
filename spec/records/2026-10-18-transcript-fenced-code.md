# Fenced code uses the existing captured reader

The user reports that fenced Markdown code looks and behaves differently from
captured code/patches. The initial rich widget has language/copy chrome and
cursor selection, but comments appear after the entire fence and it has no
middle fold. DC-CHAT-006 now requires the existing captured-reader behavior.

RichCodeBlock composes ChatTextBlock rather than a second code implementation.
A private source-range adapter maps exact full-capture anchors into the code
slice while preserving original block/revision/quotes for comment publication.
The same comment widgets render below referenced lines, and the same fold
policy supplies Show N more lines/Show less while keeping anchored hidden
content visible. Repeated identical fences cannot share anchors. The frame has
one background and body inset with a compact language/copy header. Immutable
reads, editor ownership, source navigation and comment drafts remain retained.
DC-CSS-001's spacing ownership is unchanged; no consumer CSS workaround.

Initial source family: 25/26 pass. The new test's Ctrl+Home fallback is unsupported
by user-event on structured contenteditable content; use supported cursor keys.
Next exact run: one pass/one fail because CodeMirror virtualizes the final
line outside the visible range. The test now verifies an expanded middle line,
exact comment quote and retained comment after re-folding, rather than requiring
all off-screen lines to stay mounted. Initial strict types report four story
Element-vs-HTMLElement query errors; correctly typed source scopes fix them.
The complete Transcript family then passes 26 interaction/axe cases. Source and
three public consumer type profiles pass with no errors/warnings. Five unit
files pass 34 tests, including repeated fences and hidden comment fold policy.

Commands: `pnpm exec vitest run --project storybook
src/shared/chat/transcript/Transcript.stories.svelte`, exact
`-t 'FencedCode|CodeAndTable'`; `pnpm check:types`;
`pnpm exec vitest run --project unit
src/shared/chat/transcript/reader-source.spec.ts
src/shared/chat/transcript/rich-source.spec.ts
src/shared/chat/transcript/controller.spec.ts
src/shared/chat/transcript/comment-edit.spec.ts
src/shared/chat/transcript/anchors.spec.ts`.
Logs: `/tmp/lapis-ai-fenced-code-*`. Pack and cold Notes acceptance are recorded
in E-AI-039. The user also requests the same Design Core recorded demo as a
separate Notes story; its fixture snapshot and public composition are
catalog-only. Original milestone/native persistence/visual gates remain open.

After the final frame-spacing change the exact rich code/table cases pass two
checks (24 others excluded). Spec-first passes 10 protected files/two chapters;
validation passes eight validators/31 chapters/299 requirements. Importing the
same recorded demo into Notes also exposes its three fixed footer labels under
axe 4.14: visible selected values were missing from accessible names. The source
fixture and copied consumer controls now include those values; pixels are
unchanged. No accessibility rule is waived. Its first cold consumer pass also
hits a stale optimized icon runtime; a fresh dependency pass reaches interactions
and the concrete label failures. Final cold public-package acceptance remains
in E-AI-039.
