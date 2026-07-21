# Reference provenance

The product research source is a logged-in Superlist application session,
captured on 2026-07-20. This package is a clean-room behavior reference and
fixture-driven implementation: it contains no source code, artwork, logos, or
exported product data from that application.

Committed reference screenshots under
`reference/superlist/2026-07-20/screenshots/browser/` are browser captures of
the dedicated **Tasks UI Reference** fixture list. They may include ordinary
account chrome (avatar, nav favourites). Fixture task titles remain synthetic.
They document interaction, information architecture, spacing, and responsive
state, and feed Storybook Visual Delta via `referenceVisualDelta`.

Playwright visual baselines for Tasks **components** are separate: they live
under `tests/visual/storybook.spec.ts-snapshots/tasks/` (component-clipped,
same suite as shadcn). Do not confuse the two.

## Primitive provenance

Tasks compositions import host shadcn families from `@stevejuma/ui/shadcn/*`
and `TaskDueCalendar` from `@stevejuma/ui/forms`. Tasks-specific styling stays
under `.tasks-theme` / `--tasks-*` tokens in `src/lib/tasks-theme.css`.
