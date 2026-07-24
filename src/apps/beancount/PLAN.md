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

| Check                     | Status | Evidence / next action                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Matrix integrity          | ✅     | `pnpm beancount:screens:verify` finds 15 stories and PNGs                                                                                                                                                                                                                                                                                                                                   |
| Reference provenance      | ✅     | 2026-07-23 capture: Studio `191dae81…`, sample fixture digest, 15 image digests                                                                                                                                                                                                                                                                                                             |
| Loaded route capture      | 🟡     | Records has a deterministic catalog queue, but its Fava reference remains empty; Rules has a deterministic body but no reference run history; Import Accounts remains static                                                                                                                                                                                                                |
| Fava overwrite guard      | ✅     | Normal visual updater and Playwright snapshot updates reject reference-tagged stories                                                                                                                                                                                                                                                                                                       |
| Screen story health       | ✅     | The shared Studio shell now exposes Fava's controlled 220–520px resize rail and 48px collapsed project rail; Holdings and Statistics share `PresetQueryReport`; Settings queries are unambiguous; Dashboard uses one top-level main landmark. Interactive source, account, rule, and record stories restore their captured initial state and clear focus before end-of-play visual capture. |
| Component regression PNGs | 🟡     | The 2026-07-24 compare-only full run reached real screenshots (136 passed); 208 catalog stories failed because their committed PNG is absent, including the 94 Beancount candidates. This is baseline coverage, not an approved pixel delta. Establish reviewed family batches before using this lane as a parity gate.                                                                     |

## Screen tracker

Legend: `⬜` not started, `🟡` composing/reviewing, `✅` near-pixel approved.
Promotion requires a genuine screen body, passing Storybook/a11y checks, and
Visual Delta at or below 0.1% before removing `skip-visual`.

| Screen           | Reference      | Story composition       | Next alignment slice                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------- | -------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor           | ✅             | 🟡 source preview body  | Fava File/Edit dropdown chrome, including nested Open source and Find commands, collapse/save controls, and a tokenized display-only ledger body now compose. Its fixture keeps `## Options` as source-comment text while later labels remain editor folding headings. The controlled menu contract carries source selection, format-on-save, and editor command callbacks; AI requests and CodeMirror remain host-owned. Bind those callbacks from the future `fava-beta` adapter, then review Visual Delta ≤0.1%. |
| Dashboard        | ✅             | 🟡 partial              | Fava metrics, cash-flow, outflows, balance-sheet, net-worth display models, and host callbacks complete. The Fava category palette, positive cash-flow colour, and foreground Net Worth value with a positive comparison are now explicit normalized display roles; align remaining data density and review Visual Delta ≤0.1%.                                                                                                                                                                                     |
| Journal          | ✅             | 🟡 partial              | Fava date-group cards with separate balance-description and summary-disclosure controls, nested record surfaces that remain visible when their summary is collapsed, account-derived posting avatars, timeframe control, record-open callback, controlled pagination/page sizes, cross-page selection scope, and deterministic Upcoming lane complete; align production data adapter and review Visual Delta ≤0.1%                                                                                                  |
| Income statement | ✅             | 🟡 partial              | Fava toolbar, unframed historical stacked bars with adapter-supplied extent/ticks and responsive label cadence, bottom perspective tabs, and a separate Income hierarchy with optional account identities compose; align production data adapter, remaining statement sections, then review Visual Delta ≤0.1%.                                                                                                                                                                                                     |
| Balance sheet    | ✅             | 🟡 partial              | Fava toolbar, unframed stepped net-worth history with adapter-supplied report axis and semiannual cadence, bottom perspective tabs, and an Assets hierarchy with optional account identities compose; align production data adapter, liabilities/equity sections, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                   |
| Trial balance    | ✅             | 🟡 partial              | Fava toolbar, unframed Fava-height treemap with a normalized report palette, bottom perspective tabs, and a separate contribution ledger compose; align production data adapter and lower table section, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                                                            |
| Account detail   | ✅             | 🟡 partial              | Fava breadcrumb, stepped balance history with adapter-supplied report axis, bottom chart-history perspectives, separate account-table tabs, and account-activity fixture complete; align activity density and full account history, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                                 |
| Holdings         | ✅             | 🟡 partial              | Controlled `PresetQueryReport` now matches Fava's shared perspective → Query → table composition. Its paged holdings fixture is complete; align table density and any valuation/result controls, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                                                                    |
| Statistics       | ✅             | 🟡 partial              | Controlled `PresetQueryReport` now carries Fava's end-aligned Query action, perspectives, posting counts, and paged account statistics fixture; align other statistic display models and review Visual Delta ≤0.1%.                                                                                                                                                                                                                                                                                                 |
| Query            | ✅             | 🟡 partial              | The Fava-reference screen holds its blank BQL-entry state with the zero-ledger sidebar fixture. Controlled `QueryWorkspace` now composes the command, host error, and saved-query disclosure; BQL execution, history persistence, route selection, and result rendering stay in the adapter. Add that production adapter, then review Visual Delta ≤0.1%.                                                                                                                                                           |
| Errors           | ✅             | 🟡 partial              | Fava no-records panel, parent-ledger navigation state, deterministic validation-failure composition, and editor-navigation callback complete; align the production error adapter, then review Visual Delta ≤0.1%                                                                                                                                                                                                                                                                                                    |
| Records          | ✅ empty queue | 🟡 partial              | Fava empty panel, header callbacks, and deterministic loaded queue complete. Its interaction test clears the Open Accounts focus state before capture; await approved populated Fava capture and production adapters.                                                                                                                                                                                                                                                                                               |
| Sources          | ✅             | 🟡 expanded details     | Fava connected/available source cards, controlled expanded setup/field details, source toolbar, and host callbacks compose. Its interaction test returns to the collapsed, YAML-off reference state before capture; add live sync adapters, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                         |
| Import accounts  | ✅ loaded      | 🟡 expanded details     | Fava source-account and unassigned rows, controlled expanded account groups, Sync all, and host actions compose. Its interaction test returns the source card to the collapsed reference state before capture; add production setup adapters, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                       |
| Rules            | ✅ loaded      | 🟡 collection + history | Fava sortable rule collection, header apply/add callbacks, active callback, host menu, and run-history model compose. Its interaction test restores the active rule state before capture; add production adapters, then review Visual Delta ≤0.1%.                                                                                                                                                                                                                                                                  |

## Component inventory

The detailed component-to-Fava inventory and destination classification lives in
[`COMPONENT_AUDIT.md`](../../../COMPONENT_AUDIT.md); this plan tracks its gates
and screen-level alignment status.

| Inventory lane  | Current evidence                                                                                                                           | Exit condition                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| Catalog surface | 72 Beancount components and 59 colocated story modules                                                                                     | Every promoted surface has a display-model contract and a tested story                    |
| Fava mapping    | Reusable presentation components map to the catalog; route, persistence, CodeMirror, and ingestion adapters stay in Fava until `fava-beta` | `fava-beta` adapters consume the catalog without changing `packages/fava`                 |
| Styling         | `pnpm beancount:tailwind:check` passes across all Beancount sources and stories                                                            | Keep the guard green for every slice; no Tailwind utility strings may enter the app layer |

## Styling migration inventory

The first audit found **971** class attributes across **102 of 105** Beancount
Svelte files. They are existing Tailwind utility strings, not shared shadcn
token selectors. This table is a removal checklist; every row must reach zero
Tailwind utilities before a `fava-beta` adapter consumes the app layer.

| Area         | Class attributes | Shared control decision                                                                 | Status                                                                                      |
| ------------ | ---------------: | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `charts`     |               73 | Chart containers and legends remain app-specific; use normalized chart/surface tokens   | ✅ all source + stories semantic; guard passes                                              |
| `dashboard`  |              149 | Reuse Card, Button, Badge, and Table; keep financial layout app-specific                | ✅ all source + stories use semantic roles (including Fava dashboard palette); guard passes |
| `feedback`   |              205 | Replace hand-built loading, status, and empty states with Skeleton, Alert, Empty, Badge | ✅ primitives + skeletons; guard passes                                                     |
| `layout`     |               81 | Reuse ScrollArea, Resizable, Separator, and shared shell controls                       | ✅ semantic selectors + focused story tests                                                 |
| `navigation` |              124 | Reuse Button, Tabs, Tooltip, Sidebar/ScrollArea where suitable                          | ✅ all source + stories semantic; focused tests                                             |
| `pickers`    |               50 | Reuse Input, Popover, Command, Avatar, and Button                                       | ✅ all source + stories semantic; guard passes                                              |
| `screens`    |               24 | Compose shell and report bodies with semantic screen selectors                          | ✅ all source + stories semantic; bodies pending                                            |
| `tables`     |              265 | Reuse shared Table, Button, Badge, Checkbox, and semantic table-state tokens            | ✅ all source + stories semantic; guard passes                                              |

### Styling exit criteria

1. Add an app-level normalized token module for surfaces, typography, spacing,
   chart semantics, and financial status; do not duplicate raw theme values.
2. Replace every Tailwind utility class in components **and stories** with a
   shared shadcn component or component-local semantic selector.
3. ✅ `pnpm beancount:tailwind:check [family]` rejects utility strings in
   components and stories. `pnpm beancount:tailwind:check` now passes for the
   complete app; `pnpm beancount:tokens:check [family]` rejects raw shared
   theme variables outside the documented role and local-value namespaces.
   As of 2026-07-24, Beancount source and stories have no raw
   `var(--chart-*)` references; generic chart aliases live only in the app
   token module. Screen-body parity remains tracked separately above.
4. Retake reviewed component baselines only after each family passes its story
   and a11y tests; Fava reference PNGs remain untouched.

### Normalized-token audit

The Tailwind guard covers utility classes. A second audit tracks app files that
still use raw shared-theme variables directly rather than the
`--ui-beancount-*` role layer. File counts are the initial inventory; the
token definition file itself is intentionally exempt because it supplies the
aliases. Component-owned display values use the distinct `--bc-*` prefix and
are not shared-theme variables; typography, radius, and chart primitives remain
explicit exceptions.

| Area         | Initial files | Remaining files | Status                           |
| ------------ | ------------: | --------------: | -------------------------------- |
| `charts`     |            10 |               0 | ✅ semantic chart roles          |
| `dashboard`  |            10 |               0 | ✅ semantic dashboard roles      |
| `feedback`   |            13 |               0 | ✅ semantic feedback roles       |
| `layout`     |             7 |               0 | ✅ semantic shell roles          |
| `navigation` |             5 |               0 | ✅ semantic navigation roles     |
| `pickers`    |             2 |               0 | ✅ semantic picker roles         |
| `rules`      |             1 |               0 | ✅ semantic status/surface roles |
| `sources`    |             2 |               0 | ✅ semantic source-brand roles   |
| `tables`     |             9 |               0 | ✅ semantic table roles          |

## Delivery order

1. **Reference safety and health** — deterministic loaded-state fixture,
   existing Storybook failures, and provenance guard maintenance.
2. **Token and primitive migration** — ✅ normalized tokens are in place and
   the all-app Tailwind guard passes. Continue to use the guard for every new
   Beancount source or story while completing visual parity.
3. **Shared shell** — `ScreenFrame`, `StudioWorkspaceShell`, project header,
   ledger navigation, and deterministic sample-ledger fixtures. The candidate
   now composes Fava's full five-ledger fixture (including Example with budgets),
   default 256px sidebar, controlled search-sidebar launch affordance,
   controlled 220–520px resize rail, and 48px collapsed project rail across all
   15 screen frames; the host owns
   persisted width preferences. The first Visual Delta review remains
   intentionally non-approved because Fava's fixture tree and every screen body
   still differ. Recheck all 15 overlays after each shell adjustment.
4. **Core reports** — Journal; the three statements; Dashboard and Account
   detail; then Query, Errors, Holdings, and Statistics.
5. **Workflow screens** — Records, Sources, Import accounts, Rules, and
   Editor chrome. Use shared forms/filter primitives with app-owned callbacks;
   do not copy Fava forms or CodeMirror integration.
6. **Regression coverage** — establish component baselines in reviewed family
   batches. The 2026-07-24 full compare demonstrated that the runner is
   functional but lacks the required PNGs; completion requires every
   non-skipped Beancount story to have one.
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
pnpm beancount:tailwind:check
pnpm beancount:tokens:check

# Catalog iteration
pnpm storybook
# Wait for the production build to finish and emit storybook-static/iframe.html
# (the command wrapper can return before the child Vite build completes).
pnpm build-storybook
pnpm test:visual
pnpm checks
```

Use Storybook’s Visual Delta panel for review. Never use
`pnpm test:visual:update` on a `fava-reference-visual` story.
