# Destructive dropdown actions on dark surfaces

2026-10-21; enclosing Jujutsu change; DC-SHA-046 and DC-CSS-004.

Desktop's new chat mode submenu exposed existing Delete Chat text at 3.13:1
contrast on the Lapis dark popover (#d92a3f on #262626). Fix the owning Content
styles: destructive text/icons blend the existing destructive colour with the
menu foreground. Focus backgrounds, actions, keyboard semantics, public tokens,
portal ownership and API contracts remain unchanged. No consumer CSS override.

The regression uses root Lapis dark globals, the actual Content/Item components
and normal axe error acceptance. An initial local dark wrapper passed because
root menu tokens still used the light surface; that was not a valid dark proof.
With root globals the exact target fails once for the same 3.13:1 contrast:

`pnpm test:storybook src/shared/shadcn/dropdown-menu/DropdownMenuContrast.stories.svelte`

Log: `.local/dropdown-contrast-before-root.log`. The first combined attempt
also fails before the CSS change (`dropdown-contrast-after.log`); an edit
precondition counted background-color declarations and stopped without edits.

Focused source verification, prepared public archive and Desktop acceptance are
recorded below after completion. Milestone review: this narrow accessibility
repair changes no API or workspace gate. Human visual baseline approval,
publication and broad unrelated package suites remain deferred under the user's
request to keep verification minimal and finish the usable Desktop feature.
No snapshots are updated and no packages are published.

Source checks: the exact dark regression plus existing action-only and leading
icon stories pass 3/3 in a cold browser process (`dropdown-contrast-fixed.log`).
`pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings` reports
zero errors and warnings (`dropdown-contrast-types.log`). Canonical validation
first rejected a multi-sentence acceptance bullet; it is now one atomic clause.
`pnpm spec:check` is rerun after that correction. Prepared public-archive
consumption and all four desktop theme/viewport lanes belong to Desktop E-AI-100.

Final `pnpm spec:check` passes all three lanes (validate, mdBook, spec-first);
log `.local/dropdown-contrast-spec-pass.log`. No baseline was updated.
