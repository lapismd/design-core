# Beancount / Fava alignment tracker

This is the source of truth for migrating reusable Fava presentation into
`@stevejuma/ui/apps/beancount` and proving the result against the live Fava
reference application.

## Non-negotiable boundaries

- `/Users/stevejuma/code/beancount-js-studio/packages/fava` is the immutable
  comparison application. Migration work must not change it.
- `src/apps/beancount` accepts display-ready props and callbacks only. Routing,
  stores, APIs, persistence, ledger derivation, and CodeMirror integration stay
  in the application adapter.
- `src/apps/beancount` must not contain Tailwind utility classes. Reuse shared
  shadcn controls, and express remaining domain layout through component-local
  semantic selectors backed by normalized `--ui-*` tokens.
- Fava captures are reference baselines. Only
  `FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture` may replace them;
  normal visual-baseline tooling must reject the `fava-reference-visual` tag.
- `packages/fava-beta` will be the separate integration target. It will link
  this package locally and leave `packages/fava` runnable for side-by-side
  comparison.

## Baseline lanes

| Lane               | Authority                                   | Storage                                                            | Update rule                                        |
| ------------------ | ------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| Fava reference     | Live `packages/fava` + sample ledger        | `tests/visual/storybook.spec.ts-snapshots/apps/beancount/screens/` | Capture command only, from a clean Studio checkout |
| Catalog regression | Reviewed Storybook components               | Normal nested Storybook snapshot paths                             | Explicit human approval only                       |
| Beta candidate     | Live `packages/fava-beta` comparison output | Test report artifacts                                              | Never committed over a Fava reference              |

Each reference capture writes `manifest.json` beside its PNGs. It records the
Studio revision, fixture digest, viewport, and per-image digest.

## Current baseline health

| Check                     | Status | Evidence / next action                                                                                                                                                    |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matrix integrity          | ✅     | `pnpm beancount:screens:verify` finds 15 stories and PNGs                                                                                                                 |
| Reference provenance      | ✅     | 2026-07-23 capture: Studio `191dae81…`, sample fixture digest, 15 image digests                                                                                           |
| Loaded route capture      | 🟡     | The unseeded sample project holds Records, Import accounts, and Rules in real loading states; add a deterministic ingestion/rules fixture before making loaded references |
| Fava overwrite guard      | ✅     | Normal visual updater and Playwright snapshot updates reject reference-tagged stories                                                                                     |
| Screen story health       | ✅     | Holdings, Statistics, Settings queries are unambiguous; Dashboard uses one top-level main landmark                                                                        |
| Component regression PNGs | ⬜     | 94 Beancount visual candidates still need reviewed, family-by-family baselines                                                                                            |

## Screen tracker

Legend: `⬜` not started, `🟡` composing/reviewing, `✅` near-pixel approved.
Promotion requires a genuine screen body, passing Storybook/a11y checks, and
Visual Delta at or below 0.1% before removing `skip-visual`.

| Screen           | Reference           | Story composition      | Next alignment slice                                                                                                |
| ---------------- | ------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Editor           | ✅                  | 🟡 shell + placeholder | Catalog editor chrome only                                                                                          |
| Dashboard        | ✅                  | 🟡 partial             | Fava metrics + cash-flow fixture complete; align outflows, balance sheet, net worth, then review Visual Delta ≤0.1% |
| Journal          | ✅                  | 🟡 partial             | Shell, ledger workspace data, activity controls                                                                     |
| Income statement | ✅                  | 🟡 partial             | Statement toolbar, hierarchy chart, table                                                                           |
| Balance sheet    | ✅                  | 🟡 partial             | Statement toolbar, hierarchy chart, table                                                                           |
| Trial balance    | ✅                  | 🟡 partial             | Statement toolbar, hierarchy chart, table                                                                           |
| Account detail   | ✅                  | 🟡 partial             | Account chart, tabs, activity table                                                                                 |
| Holdings         | ✅                  | 🟡 shell + placeholder | Query/chart composition                                                                                             |
| Statistics       | ✅                  | 🟡 shell + placeholder | Statistics display model and charts                                                                                 |
| Query            | ✅                  | 🟡 partial             | Query editor chrome, results and controls                                                                           |
| Errors           | ✅                  | 🟡 partial             | Error table fixtures and shell                                                                                      |
| Records          | 🟡 recapture loaded | 🟡 empty-only          | Ingestion review states and actions                                                                                 |
| Sources          | ✅                  | 🟡 shell + placeholder | Source connection display adapters                                                                                  |
| Import accounts  | 🟡 recapture loaded | 🟡 shell + placeholder | Account setup display adapters                                                                                      |
| Rules            | 🟡 recapture loaded | 🟡 shell + placeholder | Rules list and run-history adapters                                                                                 |

## Styling migration inventory

The first audit found **971** class attributes across **102 of 105** Beancount
Svelte files. They are existing Tailwind utility strings, not shared shadcn
token selectors. This table is a removal checklist; every row must reach zero
Tailwind utilities before a `fava-beta` adapter consumes the app layer.

| Area         | Class attributes | Shared control decision                                                                 | Status                                           |
| ------------ | ---------------: | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `charts`     |               73 | Chart containers and legends remain app-specific; use normalized chart/surface tokens   | ✅ all source + stories semantic; guard passes   |
| `dashboard`  |              149 | Reuse Card, Button, Badge, and Table; keep financial layout app-specific                | ✅ all source + stories semantic; guard passes   |
| `feedback`   |              205 | Replace hand-built loading, status, and empty states with Skeleton, Alert, Empty, Badge | ✅ primitives + skeletons; guard passes          |
| `layout`     |               81 | Reuse ScrollArea, Resizable, Separator, and shared shell controls                       | ✅ semantic selectors + focused story tests      |
| `navigation` |              124 | Reuse Button, Tabs, Tooltip, Sidebar/ScrollArea where suitable                          | ✅ all source + stories semantic; focused tests  |
| `pickers`    |               50 | Reuse Input, Popover, Command, Avatar, and Button                                       | ✅ all source + stories semantic; guard passes   |
| `screens`    |               24 | Compose shell and report bodies with semantic screen selectors                          | ✅ all source + stories semantic; bodies pending |
| `tables`     |              265 | Reuse shared Table, Button, Badge, Checkbox, and semantic table-state tokens            | ✅ all source + stories semantic; guard passes   |

### Styling exit criteria

1. Add an app-level normalized token module for surfaces, typography, spacing,
   chart semantics, and financial status; do not duplicate raw theme values.
2. Replace every Tailwind utility class in components **and stories** with a
   shared shadcn component or component-local semantic selector.
3. ✅ `pnpm beancount:tailwind:check [family]` rejects utility strings in
   components and stories. `pnpm beancount:tailwind:check` now passes for the
   complete app; screen-body parity remains tracked separately above.
4. Retake reviewed component baselines only after each family passes its story
   and a11y tests; Fava reference PNGs remain untouched.

## Delivery order

1. **Reference safety and health** — deterministic loaded-state fixture,
   existing Storybook failures, and provenance guard maintenance.
2. **Token and primitive migration** — ✅ normalized tokens are in place and
   the all-app Tailwind guard passes. Continue to use the guard for every new
   Beancount source or story while completing visual parity.
3. **Shared shell** — `ScreenFrame`, `StudioWorkspaceShell`, project header,
   ledger navigation, and deterministic sample-ledger fixtures. The candidate
   now composes the actual project header and ledger navigation against all 15
   screen frames; the first Visual Delta review remains intentionally
   non-approved because Fava's fixture tree and every screen body still differ.
   Recheck all 15 overlays after each shell adjustment.
4. **Core reports** — Journal; the three statements; Dashboard and Account
   detail; then Query, Errors, Holdings, and Statistics.
5. **Workflow screens** — Records, Sources, Import accounts, Rules, and
   Editor chrome. Use shared forms/filter primitives with app-owned callbacks;
   do not copy Fava forms or CodeMirror integration.
6. **Regression coverage** — establish component baselines in reviewed family
   batches. Completion requires every non-skipped Beancount story to have one.
7. **`fava-beta`** — clone a clean Fava revision into
   `packages/fava-beta`, name it `@beancount-js/fava-beta`, and link
   `@stevejuma/ui` using `link:../../../../ui`. Configure Vite/Tailwind for the
   linked source, migrate beta adapters in the same order, and compare live
   beta screenshots to the Fava references without modifying them.

## Verification

```bash
# Fava reference capture and integrity
FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture
pnpm beancount:screens:verify

# Catalog iteration
pnpm storybook
pnpm test:visual
pnpm checks
```

Use Storybook’s Visual Delta panel for review. Never use
`pnpm test:visual:update` on a `fava-reference-visual` story.
