# Style rules

How `@stevejuma/ui` paints components: native CSS, public tokens, no Tailwind
utility classes in package sources.

Layer-specific contracts stay in [`FORMS.md`](./FORMS.md),
[`docs/agent/shadcn.md`](./docs/agent/shadcn.md),
[`packages/tasks/specs/styles.md`](./packages/tasks/specs/styles.md), and the
Storybook Guidance pages. This file is the shared styling policy.

## Principles

1. **Theme first** — global look comes from [`src/theme.css`](./src/theme.css)
   (`--background`, `--primary`, `--border`, `--radius`, …).
2. **Public tokens next** — each layer exposes overrideable `--ui-*` (or
   scoped `--tasks-*`) custom properties. Hosts restyle by setting those
   variables, not by merging utility classes.
3. **Colocated CSS paints** — component layout and chrome live in a sibling
   `.css` file (or family paint rules), reading tokens via `var(--…)`.
4. **Semantic hosts** — mark roots with `data-ui-component` / `data-ui-part`
   (and shadcn `data-slot` / axis attrs). Prefer semantic class names
   (`ui-form-add-button`, `cv-reference-row`) over utility strings.
5. **Reuse primitives** — use `@stevejuma/ui/shadcn/<family>` for generic
   Button, Input, Sheet, Popover, etc. Restyle nested hosts from the parent
   family’s CSS; do not pass Tailwind `class` strings to size or color them.
6. **No Tailwind in sources** — converted and shared component sources must
   not contain utility class strings (`flex`, `gap-2`, `text-muted-foreground`,
   `cn("…")` layout merges, `tv()` / `tailwind-variants`).

## Token layers

| Layer | Prefix | Defaults | Names / map |
| --- | --- | --- | --- |
| Theme | `--background`, `--primary`, … | [`src/theme.css`](./src/theme.css) | — |
| Shadcn family | `--ui-<family>-*` | `<family>.tokens.css` | `<family>.tokens.ts` |
| Forms package | `--ui-form-*` | [`form.tokens.css`](./src/shared/forms/form.tokens.css) | `formTokenNames` / `formTokenDefaults` |
| Filter / AI | `--ui-*` / `--ui-ai-*` | colocated CSS / `ai.tokens.ts` | layer maps as documented |
| Beancount app | `--ui-beancount-*` (+ local `--bc-*`) | app token CSS | app token map |
| Tasks companion | `--tasks-*` on `.tasks-theme` | `packages/tasks` theme CSS | [`packages/tasks/specs/styles.md`](./packages/tasks/specs/styles.md) |

### Override rules

- Set public `--ui-*` / `--ui-form-*` / `--tasks-*` on `:root`, a form/app
  ancestor, or the scoped theme host (e.g. `.ui-structured-form`,
  `.tasks-theme`).
- **Do not** rebind the same `--ui-*` names on the component host that consumes
  them (e.g. `[data-ui-component="button"]`). That blocks ancestor cascade.
  Defaults belong on `:root` (or the package/form ancestor), paint rules read
  `var(--ui-…, fallback)`.
- Add a new public token only when an existing one cannot express the paint.
  Prefer documenting the subset a component actually reads.

## Component CSS layout

```text
src/shared/<layer>/<family>/
  Component.svelte          # markup + behavior; import "./Component.css"
  Component.css             # paint; var(--ui-…) / var(--ui-form-…)
  Component.stories.svelte  # may use host Tailwind for demo layout only
  *.tokens.css / *.tokens.ts  # shadcn families (and similar maps)
```

### Markup

- Prefer `data-ui-component` + `data-ui-part` on the family host (and parts that
  need compound selectors).
- Drive variants with attributes (`data-variant`, `data-density`, `data-inset`)
  instead of concatenating utility classes in `class={…}`.
- When composing shadcn inside a form/app family, keep the shadcn
  `data-ui-component` intact. Style through descendants:

  ```css
  [data-ui-component="form-sheet"]
    :global([data-ui-component="button"].ui-form-sheet__icon-button) {
    width: 2rem;
    height: 2rem;
  }
  ```

- Form-specific chrome (dashed add CTA, title typography that is not a normal
  Input) may stay as semantic elements painted with `--ui-form-*`, same idea as
  `FormAddButton`.

### What not to do

- Do not ship Tailwind utilities in component `.svelte` sources.
- Do not use `cn()` / `class={[…]}` to assemble layout/paint utilities.
- Do not invent per-call-site utility props (`bodyClass="px-6 py-5"`). Prefer a
  density/variant prop or a `data-*` attribute backed by CSS.
- Do not copy upstream shadcn files by hand to bypass `pnpm ui:add`.

## Storybook and docs

- **Stories / examples** may use host Tailwind for demo page layout. That is
  intentional and excluded from the main gate.
- Beancount has a stricter story-inclusive check:
  `pnpm beancount:tailwind:check`.
- Forms Docs pages include a **Style** section: colocated CSS filename plus a
  **Token | Default** table for the `--ui-form-*` subset that file reads
  (`node scripts/generate-form-docs.mjs`). Full package table: [`FORMS.md`](./FORMS.md).
- Shadcn families document customization via `--ui-<family>-*` (see
  `Shadcn/Guidance`).

## Enforcement

`pnpm check:no-tailwind` (part of `pnpm checks`) fails if utility class strings
appear under these roots (stories and `examples/` excluded):

- `src/apps/beancount`
- `src/apps/cv`
- `src/shared/ai`
- `src/shared/filter`
- `src/shared/forms`
- `src/shared/shadcn`
- `packages/tasks`

Detector: [`scripts/lib/no-tailwind-utilities.ts`](./scripts/lib/no-tailwind-utilities.ts).
`sr-only` / `not-sr-only` and marker `cn-*` classes are allowed.

Also:

- `data-ui` pairing is covered by [`src/lib/data-ui-contract.ts`](./src/lib/data-ui-contract.ts).
- `ui:add` refuses leftover utilities after shadcn → native CSS conversion.

## Quick checklist for a new or touched component

1. Classify the layer ([`docs/agent/layers.md`](./docs/agent/layers.md) /
   `COMPONENT_AUDIT.md`).
2. Prefer an existing shadcn control for generic Button/Input/etc.
3. Add or update colocated `Component.css` using public tokens only.
4. Stamp `data-ui-component` / `data-ui-part` (keep shadcn hosts intact).
5. List used tokens in Docs (forms: Style table; shadcn: family token map).
6. Run `pnpm check:no-tailwind` and the usual story / `pnpm checks` path for
   the slice you changed.
