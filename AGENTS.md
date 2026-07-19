# Storybook catalog

When working on UI components, use the local Storybook catalog and its browser
tests to validate the change.

## Component documentation

- `@storybook/addon-docs` is enabled and the shared preview applies the
  `autodocs` tag. Stories are the living documentation.
- Add or update a colocated `ComponentName.stories.svelte` in the same change
  as every visual component. Point `defineMeta` at the actual component, give
  the story group a clear catalog title, and give each story a human-readable
  scenario name.
- Type every public prop and add short JSDoc to non-obvious props, events, and
  state.
- `UI Forms/Guidance` is the catalog's high-level form decision guide once forms
  land. Link reusable form primitives back to it.
- Before adding a visual form export, classify it in `COMPONENT_AUDIT.md` as a
  shared primitive, app-specific component, or deferred item.
- `Shadcn/` is the UI-owned shadcn-svelte catalog. Source and stories live in
  `src/components/shadcn`. Import a family from `@stevejuma/ui/shadcn/<family>`.
- App-specific components belong under `src/components/cv` or
  `src/components/beancount`. They must receive props and callbacks rather than
  importing application routers or workspace context.
- Interactive examples must be genuinely interactive. Play functions must
  exercise the real control flow and assert a visible or accessible result as
  well as any callback.

## Live reload

- Start the catalog with `pnpm storybook`; do not invoke `storybook dev`
  directly. The package script enables polling so UI-owned source and colocated
  stories are detected reliably.
- Restart only after changing Storybook startup configuration such as
  `.storybook/main.ts`, addons, or the Vite configuration.

## Verification

- Run `pnpm checks` before committing UI work. It verifies formatting,
  `svelte-check` (including warnings), Storybook Vitest tests, and the static
  Storybook build.
- Do not invent component props: verify them from the component source,
  TypeScript types, and existing stories.

## Accessibility and theme

- Accessibility tests inherit `a11y.test: "error"`; resolve real violations in
  the component or story rather than weakening the global rules.
- `.cm-gutters` is the sole scoped exclusion for CodeMirror decorative gutters.
- Storybook disables the backgrounds addon. Use the catalog `theme` global
  instead; the decorator applies the same `.dark` class and shared UI tokens.
