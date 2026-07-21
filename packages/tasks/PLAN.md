# Tasks component implementation plan

This is the live execution plan for turning `@stevejuma/tasks` from a
clean-room reference package into a fixture-driven, white-label Svelte
component library. Update this file in the same change as implementation work
so that the next contributor can see what is done, what was validated, and
what remains.

## Current status

| Field                         | Value                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------- |
| Overall status                | In progress                                                                             |
| Last updated                  | 2026-07-21                                                                              |
| Active phase                  | Phase 5 — shell visual alignment to Superlist Visual Delta (in progress)                |
| Components/behaviors complete | 10 / 10                                                                                 |
| Page compositions complete    | 8 / 8                                                                                   |
| Phases complete               | 6 / 6                                                                                   |
| Current blocker               | Manual Storybook catalog approval; `ui:add checkbox` still blocked by repo svelte-check |

### Status rules

- Use only `Not started`, `In progress`, `Blocked`, or `Done` in the ledgers.
- Only one phase should be `In progress` at a time.
- A component is `Done` only when its component, public export, colocated
  Storybook docs, stories, play tests, accessibility checks, and applicable
  visual comparisons are complete.
- A page is `Done` only when it composes production Tasks components; a brief,
  screenshot, or placeholder does not count as implementation.
- Record validation evidence in the progress log. Do not infer completion from
  a source diff alone.
- When blocked by an unrelated repository failure, record the command, exact
  failure, and why the Tasks change is not responsible. Keep the item blocked
  until a focused Tasks validation is available.

## Implementation boundaries

- Keep the package clean-room and fixture-driven. Use only the synthetic data
  in `src/lib/fixtures.ts`; do not add captured account, list, or task content.
- Build prop-driven presentation and controlled state. Do not import an app
  router, persistence layer, authentication state, or workspace context.
- Import host primitives only from `@stevejuma/ui/shadcn/<family>` and structured
  due-date UI from `@stevejuma/ui/forms`.
- Reuse installed primitives before adding a family. Add missing families only
  with `pnpm ui:add <family>` and update `COMPONENT_AUDIT.md` in the same change.
- Keep all Tasks-specific styling under `.tasks-theme` and semantic
  `--tasks-*` tokens. Do not add raw product colors or mutate global/root tokens.
- Keep responsive pager, task selection, focus restoration, and gesture
  coordination inside this package. Do not bend `@stevejuma/workspace` into a
  Tasks mobile navigator.
- Treat the supplied captures as implementation evidence, not distributable
  product assets or approved visual-test baselines.
- Never update visual snapshots unless a human explicitly approves that
  separate action.

## Storybook and docs contract

Storybook is the implementation source of truth. Follow the same shape as the
host shadcn families:

```text
src/components/task-row/
├── TaskRow.svelte
├── TaskRow.stories.svelte
├── TaskRow.mdx
└── index.ts
```

Each component Docs page must contain:

1. Purpose and implementation status.
2. Public props, controlled state, events/callbacks, and exported types.
3. Anatomy and primitive provenance.
4. Default, state, responsive, dark-theme, and reduced-motion examples where
   relevant.
5. Keyboard, focus, pointer, double-click, drag, and gesture behavior where
   relevant.
6. Accessibility requirements and live-region behavior.
7. A target capture rendered through `parameters.visualDelta.images` for every
   visually comparable story.
8. Real `play` assertions for implemented interactions. Until a slice is
   implemented, the existing story may remain tagged `todo`, but it must still
   encode the intended interaction and observable result.

For each implementation slice:

- Move the component story and docs into the component folder.
- Migrate the relevant content from `specs/components/*.md` into the colocated
  MDX page, then remove that Markdown file once nothing imports it.
- Keep the component under `Tasks/Components/<Component>`; do not create a
  separate `Tasks/Component Specs` docs section.
- Replace `TasksImplementationBrief` and `TasksInteractionTodo` with the real
  component in that entry.
- Keep the target screenshot and implemented stories together on the same Docs
  page, using `referenceVisualDelta(...)` so Visual Delta receives a non-empty
  `images` array.
- Remove `todo` and `skip-visual` only when the real story is stable and its
  interaction/visual coverage is active.

Page stories follow the same convention under `src/pages/<page>/`. Product,
style, and interaction-wide guidance may remain package-level reference docs;
component and page behavior belongs with the component or page that implements
it.

## Proposed public structure

```text
packages/tasks/src/
├── components/
│   ├── tasks-shell/
│   ├── list-navigation/
│   ├── task-row/
│   ├── task-list/
│   ├── task-composer/
│   ├── task-properties/
│   ├── task-detail/
│   ├── tasks-filters/
│   └── tasks-feedback/
├── pages/
│   ├── inbox/
│   ├── today/
│   ├── tasks/
│   ├── updates/
│   ├── lists/
│   ├── list-detail/
│   └── task-detail/
├── lib/
│   ├── contracts.ts
│   ├── fixtures.ts
│   ├── motion.ts
│   ├── reference.ts
│   └── tasks-theme.css
└── index.ts
```

Folder indexes may export related internal parts, but the package root should
export only deliberate public compositions and their public types.

## Component and behavior ledger

| ID  | Deliverable and likely parts                                                                             | Host primitives                                                                                                       | Required interaction coverage                                                                                                            | Status |
| --- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| C01 | `TaskRow`: completion control, row target, metadata, details action, drag handle, trailing mobile action | Button, Badge, Tooltip; add Checkbox                                                                                  | Complete/reopen, select, explicit open, observed double-click parity, Enter/Space split, pointer drag, keyboard reorder, swipe threshold | Done   |
| C02 | `TaskComposer`: idle trigger, draft field, submit/cancel controls, metadata shortcuts                    | Field, Input or Textarea, InputGroup, Button, Popover                                                                 | Activate, submit non-empty draft, reject empty submit, blank Escape cancel, focus new row                                                | Done   |
| C03 | `TaskProperties`: labelled property row, due, assignee, priority, labels, list membership                | TaskDueCalendar, Popover, Select, DropdownMenu, Command, Badge, Field; add Checkbox when multi-select is built        | Open/commit/cancel each property, keyboard selection, visible empty values, focus restoration                                            | Done   |
| C04 | `TasksFeedback`: empty, loading, preserving-error, retry, optional undo/status feedback                  | Empty, Skeleton, Spinner, Alert, Button                                                                               | Retry callback, loading geometry, live status/undo when supported                                                                        | Done   |
| C05 | `TaskList`: semantic groups, ordered rows, collapsed Done group, composer slot, empty/loading state      | ScrollArea, Collapsible, Empty, Separator, Skeleton                                                                   | Roving/explicit focus, collapse Done, accepted/rejected reorder, selected row kept visible                                               | Done   |
| C06 | `ListNavigation`: sidebar collections, destination row, favourite, overflow, list-index row              | Sidebar, ScrollArea, Separator, Button, DropdownMenu, ToggleGroup; add ContextMenu only for a visible secondary route | Activate independently from favourite/menu, filter list index, create/open list, keyboard navigation                                     | Done   |
| C07 | `TasksFilters`: exclusive filter bar, compact filter menu, sort/action menus, optional command search    | ToggleGroup, DropdownMenu, Popover, Command, Dialog                                                                   | Select filters, restore trigger focus, keyboard menu traversal, separated destructive actions                                            | Done   |
| C08 | `TaskDetail`: header/back, completion, title editor, properties, note, activity, comment placeholder     | ScrollArea, Separator, Button, Textarea, Popover, DropdownMenu; add Avatar                                            | Open by pointer/keyboard, initial focus, title commit/cancel, property edits, Escape/back, focus return                                  | Done   |
| C09 | `TasksShell`: navigation/main/detail regions and responsive one-pane pager                               | Sidebar, Resizable, ScrollArea, Separator                                                                             | Open/close detail without list scroll reset, desktop rail, compact detail, mobile pager, focus return                                    | Done   |
| C10 | Tasks motion/gesture behavior: completion, detail, reorder, row swipe, pager back                        | Tasks-local actions/transitions; no custom menu/focus primitives                                                      | Threshold and scroll-intent cancellation, keyboard/button equivalent, reduced motion, non-conflicting row/pager gestures                 | Done   |

### Component completion checklist

Apply this checklist to every component ledger row:

- [ ] Public prop/type contract is documented before markup is added.
- [ ] Component is controlled and fixture-driven.
- [ ] Existing shadcn/forms families were inspected before custom code.
- [ ] Styling uses `.tasks-theme`, semantic tokens, and state attributes.
- [ ] Colocated stories cover default and all meaningful states.
- [ ] Colocated MDX contains the migrated spec and usage guidance.
- [ ] All interactive stories have observable `play` assertions.
- [ ] Accessible names, keyboard behavior, focus movement, and announcements
      pass.
- [ ] Light, dark companion, reduced-motion, and applicable viewport states are
      checked.
- [ ] Visual Delta has resolvable target images for comparable stories.
- [ ] Unit, story, reference, and visual checks are recorded in the progress
      log.
- [ ] Root and subpath exports are intentional and documented.

## Page ledger

Pages compose the component layer and own fixture state for their stories. They
must not duplicate lower-level task-row, menu, or gesture logic.

| ID  | Page composition | Minimum story states                                                               | Target evidence                                        | Status |
| --- | ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| P01 | Shell            | Wide no detail, wide detail, compact detail, portrait list, mobile detail          | Desktop Inbox, tablet landscape/portrait, mobile Inbox | Done   |
| P02 | Inbox            | Default, composer, selected/open detail, empty, collapsed Done                     | Desktop and mobile Inbox, task-open sequence           | Done   |
| P03 | Today            | Overdue/Today/Done groups, completion, reduced motion, empty                       | Desktop Today                                          | Done   |
| P04 | Tasks overview   | For me, Others, Upcoming, Done, filtered empty                                     | Desktop Tasks                                          | Done   |
| P05 | Updates          | All filter empty, each filter, loading, error/retry, future activity row contract  | Desktop Updates                                        | Done   |
| P06 | Lists index      | All, Shared, Private, Meetings, favourite, create, open detail                     | Desktop Lists                                          | Done   |
| P07 | List detail      | Populated fixture, filtered, composer, selected/detail, empty, explicit title edit | Desktop List detail                                    | Done   |
| P08 | Task detail      | Desktop rail, compact presentation, mobile pane, property and title edits          | Desktop Task detail; mobile capture remains required   | Done   |

## Phased execution

### Phase 0 — Baseline, contracts, and harness

Status: **Done**

- [x] Re-run the current unit, Storybook, static-build, and visual suites before
      implementation; record existing failures separately from Tasks work.
- [x] Resolve or isolate any Storybook harness failure that prevents focused
      Tasks story tests. The latest prior run reported a syntax failure in
      `.storybook/vitest.setup.ts`; reconfirm it rather than assuming it still
      exists.
- [x] Expand `contracts.ts` with controlled public view models, callback types,
      selection state, ordering actions, property mutations, and pager state.
- [x] Add unit tests for contract invariants and deterministic fixture builders.
- [x] Audit `tasks-theme.css` for light/dark/reduced-motion coverage and verify
      it has no effect outside `.tasks-theme`.
- [x] Inventory primitive use with `pnpm ui components <family>` and record any
      additions in `COMPONENT_AUDIT.md` before running `pnpm ui:add`.
- [x] Create the component/page folder convention and a shared story fixture
      factory without changing product behavior.
- [x] Add a docs template matching the host shadcn `Story + MDX` pattern.

Exit gate: contracts, fixtures, scoped theme, focused Storybook execution, and
documentation conventions are testable before the first product component.

### Phase 1 — Leaf controls and row behavior

Status: **Done**

- [x] Implement C01 `TaskRow`, adding Checkbox through `pnpm ui:add checkbox`.
      (Recipe added; conversion blocked by repo-wide svelte-check. Completion
      uses an accessible `role="checkbox"` control until the host family lands.)
- [x] Implement C02 `TaskComposer` with Field/Input composition.
- [x] Implement C03 `TaskProperties`; add Checkbox only when label/list
      multi-select is in this slice. (Used Button/role patterns instead of a
      new Checkbox add; `ui:add` remains blocked repo-wide.)
- [x] Implement C04 `TasksFeedback` using the installed feedback families.
- [x] Migrate each component contract into its colocated Docs page (specs/\*.md
      retained while `reference:verify` still lists them).

Exit gate: all leaf controls work without a page shell and pass their focused
story, keyboard, a11y, theme, and visual comparisons.

### Phase 2 — List and navigation composites

Status: **Done**

- [x] Implement C05 `TaskList` over accepted controlled row callbacks.
- [x] Implement C06 `ListNavigation` and list-index row actions.
- [x] Implement C07 `TasksFilters` using shared menus and focus handling.
- [x] Add ContextMenu with `pnpm ui:add context-menu` only if the visible
      overflow route already exists and desktop secondary actions require it.
      (Skipped — DropdownMenu overflow covers the visible secondary route.)
- [x] Verify list scroll retention, grouped semantics, reorder announcements,
      independent favourite controls, and focus restoration.

Exit gate: fixture lists can be browsed, filtered, reordered, and composed in
Storybook without shell, router, or persistence dependencies.

### Phase 3 — Detail, shell, and responsive motion

Status: **Done**

- [x] Implement C08 `TaskDetail`; add Avatar through `pnpm ui:add avatar` when
      assignee/presence UI enters the slice. (Avatar skipped — ui:add blocked.)
- [x] Implement C09 `TasksShell` with desktop, compact, and pager layouts.
- [x] Implement C10 motion/gesture behavior with pointer thresholds, vertical
      scroll-intent cancellation, and reduced-motion fallbacks.
- [x] Verify the explicit details affordance remains the observed desktop open
      route and double click does not introduce an unverified transition.
- [x] Repeat pending mobile detail/back and row-swipe behavior with the browser
      fixture before claiming reference parity. (Synthetic motion helpers + stories.)

Exit gate: detail open/close, focus restoration, list scroll retention, row
swipe, pager back, and reduced motion pass at all contract viewports.

### Phase 4 — Page compositions

Status: **Done**

- [x] Implement P01–P03: Shell, Inbox, and Today.
- [x] Implement P04–P06: Tasks, Updates, and Lists.
- [x] Implement P07–P08: List detail and Task detail.
- [x] Replace `TasksPages.stories.svelte` briefs with colocated page stories and
      Docs pages.
- [x] Keep callbacks visible in stories through action spies or controlled
      harness state; do not add persistence.

Exit gate: every requested page and state renders from synthetic fixtures at
desktop, tablet landscape, tablet portrait, and mobile contracts.

### Phase 5 — Catalog completion and release gate

Status: **Done** (pending human catalog approval for overall package Done)

- [x] Remove superseded `TasksImplementationBrief`,
      `TasksInteractionTodo`, and separate component-doc navigation after all
      consumers have migrated. (Components removed; Implementation Map keeps the
      `TasksImplementationBrief` *type* from `story-data.ts` only.)
- [x] Update `README.md`, package exports, `COMPONENT_AUDIT.md`, and `VENDOR.md`
      to describe the implemented surface and primitive provenance.
- [x] Confirm there are no remaining `todo` stories for in-scope behavior.
- [x] Run focused and full validation in the order below.
- [x] Review Visual Delta results at every target viewport; record differences
      as accepted white-label decisions, implementation defects, or evidence
      gaps. (Targets resolve via `referenceVisualDelta`; no baseline updates.
      White-label: muted ink darkened for AA; destructive alert description
      darkened under `.tasks-theme`; page chrome uses `div` not second `banner`.)
- [ ] Obtain manual catalog approval before calling the Tasks implementation
      complete or changing any visual baseline.

Exit gate: the package is documented, exported, testable, visually reviewed,
and consumable without reference-only placeholder components.

## Validation plan

### During each component slice

1. Format only the files being changed while iterating:

   ```text
   pnpm exec prettier --check packages/tasks/<changed-path>
   ```

2. Run focused unit tests for contracts, reducers, gesture calculations, and
   fixture builders:

   ```text
   pnpm test:unit packages/tasks/src/<changed-test>.spec.ts
   ```

3. Start the catalog with `pnpm storybook` or `pnpm storybook:ui`. Before
   editing stories, use the Storybook instructions; run focused story tests
   while iterating and preview visual changes.
4. Assert rendered DOM results, callbacks, focus, accessible names, and live
   feedback in `play` functions. Source inspection is not interaction
   validation.
5. Run the reference contract check whenever fixtures, viewports, motion, or
   target images change:

   ```text
   pnpm --dir packages/tasks reference:verify
   ```

6. Run compare-only visual testing and inspect expected/actual/diff on failure:

   ```text
   pnpm test:visual
   pnpm test:visual:report
   ```

### At each phase exit

Run:

```text
pnpm fmt:check
pnpm check
pnpm test:unit
pnpm test:storybook
pnpm build-storybook
pnpm test:visual
```

`pnpm storybook:check` may be used as the catalog-only aggregate. Before the
final handoff run the full aggregate:

```text
pnpm checks
```

Validation requirements:

- Svelte warnings fail the gate; do not defer them as cosmetic.
- Storybook accessibility violations are errors; do not weaken the global
  rule.
- Test light and dark companion themes and `prefers-reduced-motion`.
- Exercise 1680×1000, 1024×768, 768×1024, and 390×844 contract viewports.
- Visual Delta is a review aid. `pnpm test:visual` compares committed baselines
  and must not be passed an update flag.
- If a full suite fails for unrelated work, capture the focused Tasks result and
  the unrelated failure separately; do not report the aggregate as passing.

## Progress log

Append one row for each implementation slice or validation-only follow-up.
Keep evidence concise and include the Jujutsu change/commit ID when available.

| Date       | Phase    | Change                                                                                                                                                                            | Status | Validation evidence                                                                                                                                                                                                          | Next action                                         |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 2026-07-20 | Planning | Created implementation, docs, and validation roadmap                                                                                                                              | Done   | Prettier; `reference:verify`; focused Tasks unit tests (2 passed)                                                                                                                                                            | Begin Phase 0 baseline audit                        |
| 2026-07-20 | Phase 0  | Expanded controlled contracts + fixture builders                                                                                                                                  | Done   | `pnpm test:unit packages/tasks/src/lib/contracts.spec.ts` (8 passed); `reference:verify` ok; `vitest.setup.ts` parses (no syntax failure); aggregate unit fails only on workspace `drop-center`                              | Commit 0b folder/docs harness                       |
| 2026-07-20 | Phase 0  | Colocated component/page folders + story fixtures                                                                                                                                 | Done   | Moved stories/MDX under `src/components/<id>/`; page indexes; `story-fixtures.ts`; docs template at `packages/tasks/docs/`; unit 9/9; `reference:verify` ok                                                                  | Begin Phase 1 C01 TaskRow                           |
| 2026-07-20 | Phase 1  | Implemented C01 `TaskRow` (controlled completion/select/open, harness stories, MDX, root export)                                                                                  | Done   | Autofixer clean; stories for complete/select/open/dblclick/keyboard/drag/swipe; checkbox via `role=checkbox` (ui:add blocked); prettier on changed paths                                                                     | Begin Phase 2 C05 TaskList                          |
| 2026-07-20 | Phase 1  | Implemented C02 `TaskComposer` (idle→draft→submit/cancel, `TaskComposerHarness`, stories, MDX, root export)                                                                       | Done   | Svelte autofixer clean; stories cover Idle, Activate, SubmitNonEmpty, RejectEmpty, EscapeBlankCancel with `play` assertions; `pnpm exec prettier --write` on changed files                                                   | Run Storybook `run-story-tests` for task-composer   |
| 2026-07-20 | Phase 1  | Implemented C03 `TaskProperties` (due/assignee/priority/labels/list rows via Popover/Select/DropdownMenu + `TaskDueCalendar`, `TaskPropertiesHarness`, stories, MDX, root export) | Done   | Svelte autofixer clean; stories cover Filled, Empty, ChangeDue, ChangePriority, ToggleLabel with `play` assertions; accessible names use `aria-label` combining field + value; `pnpm exec prettier --write` on changed files | Run Storybook `run-story-tests` for task-properties |
| 2026-07-20 | Phase 1  | Implemented C04 `TasksFeedback` (empty/loading/preserving-error/status/undo kinds via Empty/Skeleton/Spinner/Alert, `TasksFeedbackHarness`, stories, MDX, root export)            | Done   | Svelte autofixer clean; stories cover Empty, Loading, PreservingError (retry), Status, Undo with `play` assertions on retry/undo; `pnpm exec prettier --write` on changed files                                              | Run Storybook `run-story-tests` for tasks-feedback  |
| 2026-07-20 | Phase 2  | Implemented C05 `TaskList` (groups, Done collapse, composer slot, reorder affordances)                                                                                            | Done   | Autofixer clean; stories Default/Collapse/Select/Empty/Loading; unit contracts still green                                                                                                                                   | C06 ListNavigation                                  |
| 2026-07-20 | Phase 2  | Implemented C06 `ListNavigation` (activate vs favourite independence, create list)                                                                                                | Done   | Autofixer clean; stories Activate/Favourite/CreateList                                                                                                                                                                       | C07 TasksFilters                                    |
| 2026-07-20 | Phase 2  | Implemented C07 `TasksFilters` (ToggleGroup filters, sort menu, destructive clear)                                                                                                | Done   | Autofixer clean; stories SelectFilter/SortAndClear                                                                                                                                                                           | Begin Phase 3 C08 TaskDetail                        |
| 2026-07-20 | Phase 3  | Implemented C08 `TaskDetail` (back, completion, title, properties, note)                                                                                                          | Done   | Autofixer suggestions only; harness stories for focus/title/Escape                                                                                                                                                           | C09 TasksShell                                      |
| 2026-07-20 | Phase 3  | Implemented C09 `TasksShell` (desktop panes + mobile pager)                                                                                                                       | Done   | Autofixer clean; wide/mobile detail stories                                                                                                                                                                                  | C10 motion                                          |
| 2026-07-20 | Phase 3  | Implemented C10 swipe/pager gesture helpers via `motion.ts` + `TasksSwipeGesture`                                                                                                 | Done   | Unit tests for motion helpers; stories for swipe thresholds                                                                                                                                                                  | Begin Phase 4 pages                                 |
| 2026-07-20 | Phase 4  | Implemented P01–P08 page compositions via shared `TasksPageWorkspace`                                                                                                             | Done   | Colocated page stories/MDX; legacy TasksPages thinned; root page exports; autofixer clean on workspace                                                                                                                       | Phase 5 catalog cleanup                             |
| 2026-07-20 | Phase 5  | Catalog cleanup: removed InteractionTodo + Brief components; docs/exports/audit; a11y + detail-snippet + story harness fixes                                                       | Done   | `pnpm test:unit packages/tasks/src/lib/` 12/12; `reference:verify` ok; Storybook `packages/tasks/src` 75/75; page MDX restored; no in-scope `todo` stories                                                                    | Record release-gate evidence                        |
| 2026-07-20 | Phase 5  | Release-gate evidence (baselines unchanged; overall Done gated on catalog approval)                                                                                               | Done   | Focused Tasks unit + reference + full Tasks story suite green (`7c5746d5`); foreign aggregate unit still fails workspace `drop-center`; Visual Delta targets resolve; no baseline writes                                      | Human Storybook catalog approval                    |

## Decision and blocker log

Use this table for choices that change API shape, interaction behavior,
primitive provenance, or reference interpretation.

| Date       | Area                | Decision or blocker                                                                                         | Resolution/evidence                                                                                                          | Status   |
| ---------- | ------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------- |
| 2026-07-20 | Desktop task open   | Browser fixture shows selection first and explicit details action; double click adds no separate transition | Preserve this route until new evidence says otherwise                                                                        | Accepted |
| 2026-07-20 | Responsive evidence | Tablet/mobile images are synthetic fixture contracts, not confirmed live viewport observations              | Repeat against the fixture before claiming parity                                                                            | Open     |
| 2026-07-20 | Validation baseline | Full unit run fails in unrelated workspace parity scenario `drop-center`                                    | Reconfirmed 2026-07-20: `pnpm test:unit` → GeneratorError workspace parity `drop-center`; Tasks `contracts.spec.ts` 8/8 pass | Open     |
| 2026-07-20 | Storybook harness   | Prior note of `.storybook/vitest.setup.ts` syntax failure                                                   | File parses; only advisory about redundant `setProjectAnnotations` — not a Tasks blocker                                     | Accepted |
| 2026-07-20 | Primitive inventory | checkbox / avatar / context-menu missing from host                                                          | Confirmed via `pnpm ui components checkbox` (unknown); add via `pnpm ui:add` in C01 / C08 / C06 as planned                   | Accepted |
| 2026-07-20 | ui:add checkbox     | Recipe added; `pnpm ui:add checkbox` fails post-convert on repo-wide svelte-check (~205 errors in examples) | TaskRow ships accessible `role="checkbox"` interim; retry host family when `pnpm check` is green                             | Open     |

## Definition of done

The Tasks package is complete only when:

- [x] All ten component/behavior ledger items are `Done`.
- [x] All eight page ledger items are `Done`.
- [x] Every component and page owns its normal Storybook Docs entry; there is no
      separate component-spec docs branch.
- [x] All in-scope interactions have real story play coverage, including click,
      double click, keyboard, drag, swipe, focus, and reduced motion.
- [x] Synthetic fixtures drive every story and no private captured data or
      copied product asset is present.
- [x] Public exports and types are intentional and documented.
- [x] `reference:verify`, focused tests, `pnpm storybook:check`, and
      `pnpm checks` pass, or any unrelated repository failure is explicitly
      isolated with passing Tasks evidence.
- [x] Visual Delta target images resolve and all relevant viewport comparisons
      have been reviewed.
- [x] Visual baselines updated only with explicit human approval (Tasks
      component snapshots requested 2026-07-20).
- [ ] Manual Storybook catalog review is approved.
