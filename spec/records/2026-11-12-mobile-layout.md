# Live mobile layout and compact controls

DC-WS-091 through DC-WS-095 qualify the shared source behavior. Lapis host
configuration and App-owned actions are a separate consumer boundary.

The App Shell surface previously sampled its nullable root once during mount,
so an absent root left its width at Infinity. A reactive root effect now owns
ResizeObserver setup and disposal. Always/Never changes remain immediate and
Auto follows the actual root, including bounded containers and live breakpoint
changes. Explicit story display modes remain deterministic.

Mobile sidebar selection composes shared shadcn Select, and sidebar controls
compose PanelToggle. The compact Settings toolbar owns a close action beside
navigation; the desktop close action is hidden at the same container threshold.
Nested overlays retain their Escape handling.

The renderer exposes controller-owned transient mobile navigation and optional
consumer Search/creation actions. Editor selection stays separate from sidebar
selection, and the owning command palette receives the mobile action. Actual
view scroll events drive floating chrome without editor-private selectors.

## Reproduction and focused qualification

- `WORKSPACE_STORYBOOK_PORT=9009 pnpm test:workspace:pointer
tests/workspace/responsive-mode.spec.ts`: initial five cases, 1 pass and 4
  failures (Auto resize, breakpoint update, native selector, disabled palette).
- Two additional comment regressions failed before their fixes: a custom Browse
  sidebar button, and the narrow Settings toolbar intercepting close clicks.
- The final exact file has 9 passing tests. It covers Always/Never, Auto in both
  directions, breakpoint changes, bounded-root width, Select keyboard/focus and
  retained editor, real scrolling, palette, PanelToggle and close at 495/390px.
- Controller navigation units: 2 pass. Full units: 1,130 pass in 158 files.
- Initial full Storybook: 1,055 pass and 1 accessibility failure in the new
  scroll fixture. Unique region labels and a real keyboard link repaired that
  fixture; its exact story and all 1,056 interaction/accessibility cases pass.

## Broad-lane attempts

The nonvisual aggregate includes specification, format/types, units, static
Storybook, metadata and all browser lanes. No screenshots or baselines changed.
An early verification row was outside the Markdown table and was corrected.
One workspace run passed 25/26 and failed on Kanban artifact writing with
`ENOSPC`; two obsolete task-generated Turbo archives were removed. The exact
Kanban test then passed. A concurrent cold attempt hit catalog readiness
timeouts and was stopped; no assertion or timeout was weakened.

All required nonvisual lanes pass individually: format/types and canonical
specification checks; 1,130 units; static Storybook and metadata; 1,056
interaction/accessibility cases; 26 workspace, 17 shell and 3 AI browser cases;
and 196 shared-control browser cases with the existing single engine-specific
skip. Final browser commands use the checkout-owned 9009 catalog, for example
`WORKSPACE_STORYBOOK_PORT=9009 pnpm test:workspace:pointer`, with separate
artifact directories. Cold responsive coverage also passed against the fresh
9209 process in the earlier aggregate. Turbo's strict environment omitted the
one-off port variables during aggregate attempts; the same complete browser
lanes were therefore run through their package scripts directly. Aggregate
cold-start failures remain recorded above; no functional/accessibility failure
remains in the final required lanes.

## Consumer archive

The prepared public archive is Design Core 0.12.1 from change `qnmqnokq`, based
on `dffa9aea`. Its SHA-256 is
`a38ac37ced590599e00ea3b626aefeaae3b9ca5f85332aa340470c6d49046a54`.
It contains compiled public CSS and declarations and is used only through an
explicit ignored Notes validation overlay. Registry manifests and lockfiles
remain portable. Publication, deployment, Desktop intake and visual approval
are separate actions.
