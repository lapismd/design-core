# Nested AppShell responsive ownership

DC-SHELL-002: JJ Desktop's complete shared Agents screen resolves to mobile
inside a desktop application root. Ancestor desktop CSS flattened the inner
mobile lanes and hosts. Cards were translated beneath the outer navigation and
could not receive clicks. The desktop browser regression found four failures
and one narrow pass; this is a Design Core source defect.

Restrict mode, drag and minimum-main selectors to the root's own composition,
stage, track and lane children. Preserve the ordinary mobile main-host rule.
There is no consumer override or change to controller state, breakpoints, tokens
or public props. The two nested mode combinations are source stories with real
hit-testing, action and bounded-main assertions; they remain visual-pending.

Exact command:
`pnpm exec vitest run --project storybook src/shared/shell/app-shell/AppShellNested.stories.svelte`
first reports one failed/one passed; after the source fix both pass. The opposite
mode combination remains covered. Broader qualification and packed consumer
refresh are recorded below when complete. Visual baselines are unchanged.

Focused qualification: all 26 AppShell story interaction/axe cases pass. Two
cold pointer cases pass at 1280/760/420px with no runtime errors. The initial
aggregate attempt rejected a non-atomic two-sentence acceptance bullet; its
single-sentence correction passes spec validation/mdbook/spec-first. The current
aggregate has passed formatting, strict types/public consumers, all 914 unit
tests and tooling tests; static catalog and broader browser/story lanes are
still running. This slice is committed after focused verification under the
user's delivery plan, with aggregate qualification explicitly pending.

## Broader qualification and consumer refresh

`pnpm checks` passes governance, strict types/public consumers, formatting, 914
units/tooling, static Storybook/metadata audit, all 970 interaction/axe cases,
16 workspace browser cases and all 17 shell browser cases. Its AI browser server
initially times out starting; the exact `pnpm test:ai-chat-browser` rerun passes
all three cases with unchanged timeouts.

The remaining `pnpm test:shadcn:pointer` lane runs 154 cases: 142 pass, 11 fail,
one existing WebKit platform case skips. The `--last-failed` retry passes Topbar
geometry and Workspace bottom control without edits and reproduces nine failures:

- `app-component-promotion.spec.ts:158`: Markdown/narrow stylesheet readiness.
- `chat-composer-actions.spec.ts:8` and `:48`: composer presentation readiness.
- `transcript-review.spec.ts:44` and `:298`: busy/unknown queue interactions.
- `transcript-review.spec.ts:169`: quoted row height 23.09375px exceeds 22px.
- `transcript.spec.ts:99`, `:346` and `:406`: comment acknowledgement, Markdown
  inset and inspector close/focus interactions.

These remain owned by Design Core's catalog/chat boundaries and require separate
diagnosis; they are not waived or classified as pre-existing without proof.
The aggregate qualification remains failed/open. No assertions, readiness
timeouts or baselines were loosened. Logs and traces remain in ignored `.local`
and `test-results` outputs under the exact commands above.

The built source-inclusive public archive audits all 270 CSS files with zero
remaining utility selectors. Its source is `3c8d2733` and SHA-256 is
`1e855079a392524ce76edcb86f47fd7116b4564885e5b4d7896d9a229fd16044`.
JJ Desktop `23e0116d` consumes it through the verified archive workflow: all 33
browser/axe, 35 renderer units, 26 native tests and cold native acceptance pass.
Agent UI also refreshes that archive and restarts Storybook; its 40 focused
Agents story/axe cases, four cold browser cases and check lane pass. Its broad
light/desktop story mode passes 429 cases; the other mode runs remain deferred.
Neither package publication nor installed-app replacement occurs.
