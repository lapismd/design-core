# Dropdown semantic colour priority

2026-10-21; enclosing Jujutsu change; DC-SHA-046 and DC-CSS-004.

The first contrast repair (47c5593a) passes isolated source acceptance. Desktop
still observes 3.13:1 because Mira and the Markdown plugin include an unlayered
generic data-slot destructive-colour rule. Browser CSSOM inspection identifies
those source-owned styles and confirms the repaired Design Core rule is present
but loses solely through CSS layer priority. No consumer override is added.

The source regression now includes that observed generic slot rule. The exact
`pnpm test:storybook src/shared/shadcn/dropdown-menu/DropdownMenuContrast.stories.svelte`
fails once before this second fix (`.local/dropdown-priority-before.log`). Move
the component's semantic destructive text rule out of the legacy utilities
layer so its explicit component/part/variant selector retains authority.
Existing hover/focus backgrounds, tokens, icon colours, API and actions remain.

Focused source/consumer results follow below. Milestone review retains original
package/release/visual gates; broad unrelated lanes and baselines remain
deferred under the user's explicit minimal-verification priority.

After: the exact regression and existing action-only/submenu consumer stories
pass 3/3 in a fresh browser (`.local/dropdown-priority-after.log`); canonical
validation, mdBook and spec-first pass (`dropdown-priority-spec.log`). Source
props/types are unchanged from the preceding zero-diagnostic check. The
prepared public package and Desktop acceptance are recorded in Desktop E-AI-100.
