# Reference provenance

The product research source is a logged-in Superlist application session.
This package is a clean-room behavior reference and fixture-driven
implementation: it contains no source code, artwork, logos, or exported product
data from that application.

Committed reference screenshots under
`reference/superlist/2026-07-20/screenshots/{pages,components}/` are browser
captures of the dedicated **Tasks UI Reference** fixture list at
**deviceScaleFactor 3**. Pages are full viewport; components are subject-clipped.
Avatar/banner placeholders are applied on live re-capture. Fixture task titles
remain synthetic.

These images feed Storybook Visual Delta via `visualDeltaForStory` /
`capture-matrix.json`. Playwright visual baselines for Tasks components live
separately under `tests/visual/storybook.spec.ts-snapshots/tasks/`.

## Primitive provenance

Tasks compositions import host shadcn families from `@stevejuma/ui/shadcn/*`
and `TaskDueCalendar` from `@stevejuma/ui/forms`. Tasks-specific styling stays
under `.tasks-theme` / `--tasks-*` tokens in `src/lib/tasks-theme.css`.
