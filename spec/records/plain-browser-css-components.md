# Plain browser CSS — slice 2

2026-10-15. Continuation of the reviewed compiler-independent archive slice in
`design-core-plain-css`, parent `bc75706b`. This slice repairs the deferred
component states and the conversion/source gates. Theme/font/reset splitting,
component import ownership, bundle measurement, PR/release and downstream
refresh remain separate slices.

## Changes

- Replace all owned classes in a compound selector together. Preserve multiple
  marker owners and reject unknown utility relationships before source emission.
- Replace 78 remaining references across Alert, Card, Checkbox, Field, Input
  Group, Label, Tabs and Toggle Group with semantic relationships. Remove
  equivalent duplicate selector branches, retaining their declarations.
- Keep compact card insets, icon alert alignment, disabled field/label states,
  vertical tab indicators and joined toggle geometry. Complete vertical joined
  outline geometry alongside the existing horizontal rules.
- Use `data-divided="true"` for Card Header/Footer and block Input Group Addon
  section dividers. Generator output includes the divider paint and inset.
- Extend the source gate to standalone CSS and Svelte style blocks. Local and
  release archive preparation both reject remaining utility selectors.
- Extend the compiler-free packed consumer to the eight component families in
  light and dark mode, in development and production.

## Focused evidence

Baseline source audit: 78 utility selector references. Two new remapper tests
failed alongside three passing tests. The six targeted story files had five
failures and ten passes: compact card, field, label, divided addons and vertical
joined toggles. Vertical tabs already worked through a semantic selector but
retained dead duplicate utility selectors.

After repair: nine remapper tests pass; all 57 stories across 19 files in the
eight affected families pass. The source utility-selector count is zero.

Commands/logs:

- `pnpm exec vitest run --project unit scripts/ui-generator/tests/selector-remapper.spec.ts`
  (`/tmp/dc-css2-remapper-before.log`, `/tmp/dc-css2-remapper-final.log`).
- `pnpm exec vitest run --project storybook src/shared/shadcn/alert src/shared/shadcn/card src/shared/shadcn/checkbox src/shared/shadcn/field src/shared/shadcn/input-group src/shared/shadcn/label src/shared/shadcn/tabs src/shared/shadcn/toggle-group`
  (`/tmp/dc-css2-families.log`; the initial six-file regression is in
  `/tmp/dc-css2-stories-before-final.log`).
- `pnpm check:no-tailwind`.

## Archive acceptance

`pnpm package:local` succeeds with three compiled roots, 207 audited stylesheets
or Svelte style blocks and zero utility references. The fresh archived consumer
passes type checking and cold development/production browser checks with no
Tailwind tooling installed. Both light and dark modes exercise compact cards,
dividers, disabled labels/checkboxes, vertical tabs, joined toggles and alert
icon alignment, alongside the existing editor/lifecycle checks.

The first consumer attempt had one new fixture selector error: Field Label
uses `data-ui-part="field-label"`, while its underlying Label retains
`data-slot="label"`. Correcting the fixture to the actual component marker
resolved it; no product contract or assertion was weakened. Final log:
`/tmp/dc-css2-consumer-final.log`.

## Wider verification

Formatting, specification governance, all four type-check lanes, 740 unit tests,
16 release/helper tests, three Turbo helper tests, the static Storybook build and
the visual metadata audit pass. The audit reports zero contract errors.

The initial `pnpm checks` aggregate stopped at one emoji-picker focus failure
(`NavigatesTheEmojiGrid`): 698 stories passed and one failed. A fresh focused run
passed all three EmojiPicker stories unchanged, followed by a fresh full catalog
run passing all 699 tests across 217 files. No product or test assertion changed
for that rerun. The original aggregate is not reported as passing.
Logs: `/tmp/dc-css2-checks.log`, `/tmp/dc-css2-emoji-rerun.log`,
`/tmp/dc-css2-stories-final.log`.

Fresh browser lanes pass: Workspace 15, Shell 11, AI 3 and primitives 56.
The primitive suite retains one existing Chromium skip for a WebKit-only case;
that case passes in WebKit. Logs: `/tmp/dc-css2-workspace.log`,
`/tmp/dc-css2-shell.log`, `/tmp/dc-css2-ai.log`, `/tmp/dc-css2-shadcn.log`.

Final archive: `.local/packages/lapismd-design-core-0.3.5-built.tgz`, SHA-256
`71124c0953e3fb43305a88d6661d1d76245ee888702a86da58c0e8befaf62c4c`.
All 2,332 runtime/declaration/asset and manifest files match the archive that
passed the fresh consumer acceptance; the final refresh includes documentation
and clears the old findings report to `[]`.

## Review boundary

Screenshot comparison could not start because the Docker daemon is unavailable.
All affected stories remain `visual-pending`. No baseline is updated. Main and
application dependencies remain untouched. Review this slice before proceeding
to theme/import restructuring.
