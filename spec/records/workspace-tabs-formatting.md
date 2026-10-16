# Workspace tab formatting qualification

While qualifying the transcript extraction, `pnpm checks` stopped in formatting:
WorkspaceTabs.css and WorkspaceTabs.stories.svelte both failed Prettier.
The exact two-file formatter check also failed in the unchanged default checkout
(/tmp/dc-transcript-parent-format-baseline.log). This isolated workspace normalizes
those two files only; DC-WS-030 interactions, CSS values, story assertions and
visual baseline metadata are unchanged. This is a separate prerequisite commit.

The original exact formatter target passes after normalization (2/2 files).
`pnpm test:storybook src/shared/workspace/tabs/WorkspaceTabs.stories.svelte`
passes 5/5 stories with zero failures. No screenshot baseline is updated.
