# Transcript tables and avatar isolation

Notes' new transcript review exposed two shared presentation gaps: Message's
descendant `content` selector overrides nested Avatar grid centering, and the
immutable Markdown reader does not recognize GFM tables or present fenced code.
The user reported these
in the visible review. Fix these in Design Core; no consumer CSS overrides or
replacement Markdown implementation are introduced.

DC-AI-005 now isolates Message's direct content parts. DC-CHAT-006 recognizes
complete GFM table and fenced code nodes and renders those ranges through shared
MarkdownContent/Mira safe preview. The original CodeMirror source remains
unchanged, including its offsets and atomic source ranges. Incomplete captures
remain source and table examples inside fences remain literal code. Captured
text is never editable through a preview.
DC-AI-005/DC-CHAT-006 keep their existing milestone statuses.

Before: the new exact `MarkdownTablesAndCenteredAvatars` story fails because no
table is rendered. Browser computed styles show Avatar content changed from grid
to flex, with initials aligned to its top-left. A first human-name filter skipped
all 24 stories; the corrected Markdown filter ran the exact case and failed once.

The exact Markdown regression passes after the fix. Both complete directly
affected source families pass 26 interaction/accessibility cases. The first
after-run optimized @lezer/markdown mid-play; it still passed, and explicit
pre-optimization now keeps cold startup stable. Public archive/Notes acceptance
is recorded in Notes E-AI-039. Broad provider/platform/release and visual baseline checks remain
deferred under the approved visible-delivery scope.

The user's follow-up exposed unrendered code in the same AI response. The exact
Markdown story was extended with two fenced samples, including a literal table.
`pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.stories.svelte -t Markdown`
failed once before this fix (zero code blocks; two expected). The shared safe
MarkdownContent reader now renders complete fences alongside tables.

Final focused source evidence:

- The exact Markdown regression passes after rendering fences (one case).
- Both complete Transcript and AuthorCard families pass 26 interaction/axe
  cases, including the new code/table/avatar sample.
- `pnpm check:types` passes with zero errors/warnings in the source and all
  three public consumer type profiles. An initial optional `mount.context`
  error is fixed by omitting the absent field.
- `pnpm spec:validate` passes eight validators, 31 chapters, 299 requirements.
- `pnpm spec:first` passes nine protected files/five canonical chapters. An
  earlier attempt omitted the Storybook catalog chapter; that map is now updated.
- Changed source, stories and records pass Prettier. `pnpm package:local`
  produces the built public archive for isolated Notes acceptance; no publication.

Milestone review: DC-AI-005 remains Implemented; DC-CHAT-006 remains In progress.
Visual approval stays pending. This slice does not qualify the Notes native writer,
provider, persistence or restart. Final logs are
`/tmp/lapis-ai-transcript-source-{complete,types-complete,spec-complete,first-complete}.log`;
the exact fence before/after logs retain the initial failure.
