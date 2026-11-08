# Embedded Kanban landmark

The Bases registry Kanban story embeds a real board inside the workspace main.
Released Core 0.12.1 nests another main and fails two axe rules in one story:
landmark-main-is-top-level and landmark-no-duplicate-main. Consumer receipt:
`lapis-plugins-validation-de07f8b4-625a-4734-97c8-91355a94a14c`.

The owner regression adds EmbeddedBoard with a real host main and verifies one
main plus the labelled board region. Its initial run fails that case (1 failure, 1,055 other stories passing);
receipt `design-core-validation-23251f60-0f66-4c69-8ac3-064464e24491`.
The narrow `pnpm exec vitest run --project storybook src/shared/workspace/kanban/KanbanBoard.stories.svelte -t EmbeddedBoard`
passes after the fix: one case, twenty filtered out, receipt
`design-core-validation-5098c86a-bb7a-4cd6-b0b8-bafa447e9b5a`. The
repair changes only the board element to a labelled section, preserving its
existing layout, data markers, aria label and callbacks. No public prop changes.

Full `pnpm checks` and `pnpm package:local` pass on remote Docker (omarchy,
four CPUs/12 GiB), source `9cdfb49edad2c26281b4d97d81599a2a012a4693`, receipt
`design-core-validation-68de925c-2300-46dc-86ee-f35934aedff9`: 1,128 units,
1,056 stories, 17 Workspace and 17 Shell pointer cases, 3 AI cases, and 196
Shadcn pointer cases with the existing single skip. Specs, formatting, all
consumer type checks, static Storybook and visual metadata audit pass.

The prepared 0.12.1 candidate has SHA-256
`c93b6a7cd742092c7e048b43f03471327b325f5faa61352fe8fd7d3ceaa7fc4c`.
It is an explicitly temporary validation archive, not a registry replacement.
The release preflight inventories 27 JJ workspaces, inspects all 14 available
roots, preserves 13 unavailable legacy checkpoints, and includes only this
repair. No Dependabot PRs were open at preflight.

Packed consumer acceptance and publication are pending. The source receipt-only
update follows qualification; hosted CI must qualify the pushed head.
Visual baselines are unchanged.
