# Transcript extraction from jj-store

Reference: jj-store `496045ad`, Apache-2.0, Copyright LapisMD contributors.
The new isolated chat-transcript workspace starts above Design Core `31b5d2e2`.
Reference files: web/src/lib/ui/store-agent-chat-body; source CSS/reader/fold/
comment/navigation implementations are adapted, preserving their geometry.
Community and native API models, identity resolution, runtime controls and durable
publication policy remain outside the shared package. External syntax and file
navigation use host hooks. Raw captures are supplied as exact strings.

Before implementation, the exact CommentComposer, MarkdownContent and ToolCallDetail
Storybook command passed 20/20 tests across three families with zero failures
(/tmp/dc-transcript-baseline.log). This record tracks DC-CHAT-006/007/008.
New stories remain visual-pending. No screenshot baseline or consumer changed.
Qualification is pending; do not infer completion from source extraction.

## Implementation and focused evidence

The shared `/chat` surface now exports Transcript, HistoryEdge, CommentQueue,
TranscriptController and neutral capture/comment/submission models. Rootless
TranscriptContent and TranscriptToolContent compose host-owned inspectors. No
native, Community, identity-resolution, provider-adapter or delivery transport
models were imported. Submission snapshots are independent and runtime-frozen;
only exact acknowledged snapshots change delivery state or clear a message.

The adapted tests cover exact UTF-16 quotes, integer offsets, captured line-number
mapping, middle folds, retained reader identity, streaming/prepend scroll anchors,
selection/typing/paste, synthetic composition events, source/reply navigation,
raw/rich switching, unknown/rejected outcomes and host asynchronous replacement.
Synthetic composition coverage does not claim real OS input-method testing.

| Focused regression                                                                      | Before                                     | After                                                   |
| --------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| Noninteger anchors                                                                      | 1 failed unit assertion                    | Rejected without changing captured text                 |
| Initial typing caret                                                                    | `eview thisR` instead of `Review this`     | Exact typing and paste browser target passes            |
| Missing comment during rejection, queued recovery, batch identity and mutable snapshots | 4 failed controller tests                  | Controller set passes after guards and frozen copies    |
| Disabled existing draft                                                                 | 1 failed controller test                   | Draft retained; editing/submission blocked              |
| Chat catalog discovery                                                                  | 1 failed, 772 passed in full unit lane     | Explicit inventory extended; 773/773 pass               |
| Rendered Markdown inset                                                                 | 1 failed browser test: wrapper padding 8px | 0px inset with jj-store typography; exact target passes |

The initial controller/capture unit set had 27 passing tests. Earlier focused
Storybook qualification passed 34/34 across existing/new Chat boundaries; the
expanded new Transcript catalog subsequently passed 14/14 stories. A fresh
catalog passed all nine initial transcript browser cases. Source navigation,
reply destinations and updated custom sections also passed focused browser runs.
The final broader counts are recorded with the integration qualification below.

## Markdown parity refinement

The 17 October review rechecked jj-store `4605a422`'s
`community-markdown-content/CommunityMarkdownContent.svelte` and
`store-agent-chat-body/comment-card.css`. jj-store uses zero preview inset,
0.45rem paragraph spacing, no first/last margins, inherited text size and 1.55
rendered line height. Transcript now supplies those same values through shared
Markdown tokens. Standalone MarkdownContent keeps its configurable small outer
inset. Its compact selectors retain their spacing when Mira's published surface
CSS arrives late. Bare CommentComposer presentation avoids a second editor card
inside the transcript's existing avatar/comment card; standalone cards retain
their default chrome. No Mira internals were copied or dependency files edited.

The final focused native-browser run passed 13/13 cases
(`SHADCN_STORYBOOK_PORT=9509 SHADCN_VISUAL_SERVER_PORT=9510 pnpm test:shadcn:pointer tests/shadcn/transcript.spec.ts`,
`/tmp/dc-transcript-browser-lifecycle-final.log`). This includes a failing-before,
passing-after spacing regression, the actual published Mira surface CSS loading
late, bare editor chrome and zero-inset rootless inspector Markdown.

An overlapping inspector/source-reader lifecycle regression initially failed two
controller tests (16 passed): unmounting one reader lost navigation to a still
mounted reader, and disabling comments incorrectly blocked ordinary messages.
Private stacked reader registrations now restore surviving readers under either
teardown order. Comment permissions still block comment editing/submission and
reply controls, while an ordinary message with no pending comments can be sent.
All 30 focused transcript unit tests pass (`pnpm test:unit src/shared/chat/transcript`,
`/tmp/dc-transcript-reader-after.log`). The native inspector test opens and closes
the duplicate reader and proves queued source navigation returns focus to the
mounted main transcript. Reader identity and captured source stay unchanged.

## Broader qualification boundary

`pnpm checks` completed specification, formatting, all four type configurations,
the native-CSS audit, 773 unit tests, 3 Turbo helpers, 16 release helpers, static
Storybook build and metadata (zero contract errors), and 781 Storybook tests
before the last padding/integration refinements. It then failed 7 of 15 existing
Workspace drag/drop browser cases; 8 passed. Two exact failures reproduce in the
clean unchanged main checkout at `31b5d2e2` using isolated ports 11009/11010:
centre drop and empty-sidebar drop. Their overlays never appear. The compact
inactive `Plan` title trigger measures zero width at this revision; its icon/menu
and native drag hit targets need a separate Workspace Tabs qualification.
The owning boundary is Workspace Tabs/drag, not Transcript or Mira.

The full aggregate remains failed, and those failures are not waived. The new
components are review candidates, not release-qualified changes. No consumer or
published dependency was changed. Full post-refinement evidence follows when
available. Overlapping catalog runs that produced failed dynamic-module loads
were interrupted; those runs are not used as passing evidence.

## Post-refinement checks

With the repository-pinned pnpm 10.32.1 on PATH, the final reader/Markdown source
passes `pnpm spec:check` (all three lanes), `pnpm check:types` (all four
configurations, zero errors/warnings), `pnpm check:no-tailwind`, targeted Prettier
checks and `pnpm test:unit` (776/776). The directly affected Transcript,
MarkdownContent and CommentComposer catalogs pass 26/26 Storybook tests using
`pnpm test:storybook src/shared/chat/transcript/Transcript.stories.svelte src/shared/chat/markdown-content/MarkdownContent.stories.svelte src/shared/chat/comment-composer/CommentComposer.stories.svelte --maxWorkers=1 --no-file-parallelism`.
Logs: `/tmp/dc-transcript-{spec,types,css,format,units,stories}-latest.log`.

Before the final reader refinement, a full serial Storybook run passed 782 of
783 stories and failed the existing EmojiPicker RestrictedReactions focus test
(`/tmp/dc-promotion-stories-serial.log`). Its unchanged focused recheck passed
both matching stories (`/tmp/dc-promotion-emoji-focus-recheck.log`). This does
not turn the aggregate failure into a pass. The expanded Shadcn browser lane
passed 106 cases with one platform skip; Shell passed 11 and AI passed 3.
Workspace remained at 8 passed / 7 failed as described above. Those broader
failures still require explicit acceptance or separate repair before finalizing.

`pnpm packages:pack` also passes after the final source/CSS changes
(`/tmp/dc-transcript-pack-latest.log`): the clean archived consumer passes types,
cold development and production runtime checks with component-owned CSS and no
Tailwind tooling, including exact transcript comments, teardown/retained drafts
and explicit acknowledgement. The archive SHA-256 is
`98e184c0e6882df8e4a05031b2f7cedcc8990f708a3ed2ebc95cf3c561e96d60`.
The existing approved low-severity KaTeX exception is unchanged. Packing is local
acceptance only; no package was published.

The final `pnpm build-storybook` passes
(`/tmp/dc-transcript-build-latest.log`) and
`pnpm workspace:visual:audit -- --index=storybook-static/index.json` reports
zero contract errors (`/tmp/dc-transcript-metadata-latest.log`). No screenshot
baselines were written.

After stopping only this workspace's catalog for packing and the static build,
a fresh Storybook process on 9509 passes all 13 transcript native-browser cases
again (`/tmp/dc-transcript-browser-cold-latest.log`). The spacing case also
asserts zero padding on the main immutable Markdown reader and its first line.
The rebuilt review catalog remains running on 9509.
