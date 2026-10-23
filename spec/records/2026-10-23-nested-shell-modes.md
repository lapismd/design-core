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
