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
- `UI Forms/Guidance` is the catalog's high-level form decision guide. Link
  reusable form primitives back to it.
- Before adding a visual form export, classify it in `COMPONENT_AUDIT.md` as a
  shared primitive, app-specific component, or deferred item.
- `Shadcn/` is the UI-owned shadcn-svelte catalog. Source and stories live in
  `src/shared/shadcn`. Import a family from `@stevejuma/ui/shadcn/<family>`.
- Shared forms live under `src/shared/forms/<family>/`. Import from
  `@stevejuma/ui/forms` or `@stevejuma/ui/forms/core`.
- App-specific components belong under `src/apps/cv` or `src/apps/beancount`.
  They must receive props and callbacks rather than importing application
  routers or workspace context. Story titles for those surfaces: `Apps/CV/...`
  and `Apps/Beancount/...`.
- Interactive examples must be genuinely interactive. Play functions must
  exercise the real control flow and assert a visible or accessible result as
  well as any callback.

## Live reload

- Start the catalog with `pnpm storybook` (UI + Storybook Vitest watch) or
  `pnpm storybook:ui` for the UI only. Do not invoke `storybook dev` directly;
  package scripts enable polling so UI-owned source and colocated stories are
  detected reliably.
- Restart only after changing Storybook startup configuration such as
  `.storybook/main.ts`, addons, or the Vite configuration.

## Verification

- Run `pnpm checks` before committing UI work. It verifies formatting,
  `svelte-check` (including warnings), unit tests, Storybook Vitest tests, the
  static Storybook build, and Playwright visual comparison.
- `pnpm storybook:check` runs story tests + Storybook build + visual compare.
- Do not invent component props: verify them from the component source,
  TypeScript types, and existing stories.

## Visual regression baselines

Local Playwright screenshots live under
`tests/visual/storybook.spec.ts-snapshots/` and are committed.

- **Never** update visual baselines unless the user explicitly asks. Do not pass
  `--update-snapshots` from `storybook`, `test:storybook`, `storybook:check`,
  or `checks`.
- Treat `pnpm test:visual` failures as a possible unintended UI change. Inspect
  expected/actual/diff (or `pnpm test:visual:report`) before changing code or
  baselines.
- New visual components/stories may add first snapshots when the user asks for
  baseline generation via `pnpm test:visual:update`.
- Tag a story `skip-visual` (with a documented reason) only when pixel flake
  cannot be stabilized after disabling animations.
- v1 visual suite captures light mode only (Chromium 1280×900).

## Accessibility and theme

- Accessibility tests inherit `a11y.test: "error"`; resolve real violations in
  the component or story rather than weakening the global rules.
- `.cm-gutters` is the sole scoped exclusion for CodeMirror decorative gutters.
- Storybook disables the backgrounds addon. Use the catalog `theme` global
  instead; the decorator applies the same `.dark` class and shared UI tokens.
