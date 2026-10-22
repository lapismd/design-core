# Agent transcript presentation and shared controls — 2026-10-22

Requirements: DC-CHAT-001/002/006, DC-AI-007, DC-AI-025 and DC-AI-027.
The user explicitly authorized Design Core source fixes during the Agent UI
review. No downstream application/service, publication, deployment or visual
baseline changes belong to this slice.

## Owned changes

Context, handoff and rootless readers now inherit transcript prose typography,
including the font size on Mira's actual inner editor. Standalone MarkdownContent
keeps its existing generic default. Unavailable-source comment cards have an
explicit 0.5rem gap controlled by `--ui-transcript-stale-gap`.

Transcript message status composes the existing MessageMetadata row, with
host-labelled outcomes, timestamp and supplemental host actions below the body.
Error labels/details use a destructive/foreground mix that retains contrast on
Classic's tinted user-message surface in light and dark modes. The metadata
primitive accepts a host statusLabel and does not issue retries. MarkdownComposer
forwards an explicit top/bottom statusPosition rather than fixing it to top.
Agent UI separately composes refused-send metadata beneath its exact retained
Document draft; historical message outcomes remain a distinct supported input.

ContentViewToggle is the reusable public /chat and /ai/chat boundary for an
icon-only formatted/source switch. Code offers source and BookOpen offers
formatted output; host labels name the action and tooltip. It retains native
Button keyboard/disabled semantics and exposes its own root component marker
without replacing Button's marker. RichToolCallDetail consumes the same control
for formatted/raw mode. A consumer can keep exact envelope capture separate.
Colocated docs, examples, styling and meaningful stories accompany the public
contract, inventory and exact catalog coverage.

Following the user's composer-spacing correction, Document keeps the ordinary
jj-store document's trailing buffer after its inline draft: 4rem, or 3rem below
600px. `--ui-transcript-composer-trailing-space` controls the writing space;
Classic keeps its existing 1rem inset. This is an intentional source-owned
presentation refinement, not a claim that jj-store's current composer already
has that larger buffer.

## Before and after

- Initial prose/status regression stories: four failed, then four passed;
  attached warning coverage increased the focused source set to five passes.
- The trailing-space scenario adds a sixth passing source story, exercising
  desktop/narrow defaults, a token override and unchanged Classic spacing.
- ContentViewToggle and ToolCallDetail: one initial failure/nine passes, then
  13 passes after the native Button marker was retained under the new root.
- Data-component/catalog inventory: two initial failures, then 23 passes with
  an exact updated inventory and public import assertion.
- One strict type error in the new spacing story (missing onSubmit) was fixed;
  all four strict source/consumer check configurations pass without warnings.
- A duplicate DC-AI requirement identifier found during governance was corrected
  to DC-AI-027; no existing identifier was repurposed.

## Wider browser recovery

An earlier aggregate run passed formatting, types, units, static catalog,
Storybook interactions, 16 workspace and 11 shell browser tests. AI browser
startup timed out; an isolated cold retry passed all three tests.

The wider Shadcn/browser run had 145 passes, eight failures and one platform skip.
Seven failures waited for Visual Delta story readiness, while Tag List's live
lifecycle case waited for its overflow action. A separate Thread retry failed
server readiness before assertions. These are recorded as failed attempts,
not asserted to be pre-existing product defects.

A serialized cold rerun passed the exact message-actions, Thread Panel, Tag List,
nested transcript icon, Document/Classic identity and both WebKit scroll cases:
seven passes. The full three-case transcript-view file separately rechecks prose,
reader/draft/disclosure identity and IME deferral. No unrelated product/test
code, timeout, assertion, threshold or baseline was changed for those retries.
This is cumulative recovery evidence, not a claim of a later clean full Shadcn
aggregate run.

## Source and consumer qualification

| Command / exact boundary                                                                                     | Result                                                                       |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `pnpm exec vitest run --project storybook src/shared/chat/transcript/Transcript.status-prose.stories.svelte` | 6 passed, including trailing buffer and token override                       |
| ContentViewToggle + ToolCallDetail stories                                                                   | 13 passed                                                                    |
| Data-component and exact catalog inventory unit tests                                                        | 23 passed                                                                    |
| `pnpm check`                                                                                                 | All source/shell/filter/strict-consumer configurations: 0 errors, 0 warnings |
| `pnpm test:unit`                                                                                             | 859 passed, 137 files                                                        |
| `pnpm test:storybook`                                                                                        | 909 passed, 261 files, including axe                                         |
| Focused cold recovery command below                                                                          | 7 passed; IME is covered by the full file below                              |
| `STORYBOOK_PORT=9540 pnpm test:shadcn:pointer tests/shadcn/transcript-view.spec.ts`                          | 3 passed, including the eighth formerly failing IME case                     |
| `pnpm build-storybook`                                                                                       | Passed, fresh uncached static build                                          |
| `pnpm spec:check`                                                                                            | Validation, book and spec-first passed                                       |
| Prettier over every changed source/doc/test file                                                             | Passed                                                                       |

Focused recovery command (the final alternative originally matched no IME title;
the complete transcript-view file above covers it):

```sh
STORYBOOK_PORT=9540 pnpm test:shadcn:pointer --grep 'message actions reveal through keyboard|thread row hover|live updates, scrolling|nested file and thinking|document and classic share|view changes wait|keeps an imperative|keeps the File Explorer rail'
```

Ignored .local logs retain the full output. No visual baseline changed; user
visual review and real downstream/provider acceptance remain pending.

Agent UI uses an explicitly documented temporary archive through its ignored
pnpm hook; portable manifests/lockfiles retain registry ranges. The archive
contains built public dist exports and retained source for token auditing:

`.local/packages/lapismd-design-core-0.6.0-agent-draft-review.tgz`

SHA-256: `9a6070e295ed82caaba2b9ae55dea7adfae8f8949d6ce1608ebe11df8914972c`.

It was built after the runtime changes. The subsequent source-story-only
onSubmit type repair does not change its runtime exports. The archive is local,
unpublished and not committed. Agent UI's 11 cold browser tests pass, including
exact draft metadata placement, 64px/48px trailing space, unchanged Classic,
prose parity, stale comments, full ACP context and both shared icon toggles.
