# Reference provenance

The product research source is a logged-in Superlist application session,
captured on 2026-07-20. This package is a clean-room behavior reference and
fixture-driven implementation: it contains no source code, artwork, logos,
proprietary strings, account data, or exported data from that application.

Captured images use synthetic fixture task/list content. They document
interaction, information architecture, spacing, and responsive state only, and
feed Storybook Visual Delta via `referenceVisualDelta` — they are not Playwright
baselines.

## Primitive provenance

Tasks compositions import host shadcn families from `@stevejuma/ui/shadcn/*`
and `TaskDueCalendar` from `@stevejuma/ui/forms`. Tasks-specific styling stays
under `.tasks-theme` / `--tasks-*` tokens in `src/lib/tasks-theme.css`.
