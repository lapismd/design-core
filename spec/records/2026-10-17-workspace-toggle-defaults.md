# Workspace toggle defaults

Work performed in the main workspace on 17 October 2026. No consumer migration,
release or screenshot-baseline update is included.

## Cause and change

Workspace's custom CSS grew sidebar and bottom-panel SVGs from 16px to 20px when
expanded, inside a fixed 36×28px button. Sidebar history traces this behavior to
`8da77c8e`; the shared-icon migration in `f4b01a3c` deliberately preserved it with
PanelToggle sizing tokens. Live browser measurements confirmed both dimensions.

Following review, both Workspace wrappers compose PanelToggle directly: its
default 28×24px ghost button, a standard 16×16px icon in both states, shared
hover/focus preview and reduced-motion behavior. The duplicated button CSS is
removed. The legacy `size` prop remains accepted; both values use the shared
default. Callbacks, labels, hints, drag exclusions and data-workspace markers
remain. The native host uses Button's styling identity, with Workspace identity
on `data-ui-part`; focus-mode selectors use the existing data-workspace marker.

## Verification

Focused regression command:

```sh
SHADCN_STORYBOOK_PORT=9210 SHADCN_VISUAL_SERVER_PORT=9211 pnpm test:shadcn:pointer tests/shadcn/panel-toggle-integration.spec.ts --grep 'Workspace .*default button styling' --output=/tmp/dc-workspace-toggle-before
```

Before implementation: 3 failures, covering left, right and bottom controls;
each retained the private Workspace styling host instead of the shared Button.
The matching live measurements showed the expanded SVG growth. Results after
implementation and wider qualification are recorded below when complete.

The previous avatar/Transcript aggregate was deliberately stopped for this new
review request after successful specification, formatting, four type
configurations, native-CSS audit, 821 unit tests, 3 Turbo helpers, 16 release
helpers, static build and 829 Storybook interaction/accessibility cases. Its
unfinished browser lanes are not claimed as passes. All affected lanes will
run against the final source. Changed stories remain `visual-pending`.

The exact three-case regression rerun passed 3/3. A first after-run had one
navigation timeout during catalog regeneration and two passes; the settled rerun
retained every assertion. Eleven focused Storybook cases and all four type
configurations pass with zero diagnostics, as does the native-CSS audit. The
expanded family run passed 13 cases and had one Sidebar readiness timeout before
any behavior assertion; that exact Sidebar target passed 1/1 on an unchanged
rerun. The family covers disabled controls, pointer/keyboard previews, reduced
motion, forced colors, compact Column Canvas behavior and standard edge geometry.

Live browser inspection of the full bottom-panel shell confirmed all four
rendered controls at 28×24px with 16×16px SVGs while expanded. Separate collapsed
and expanded measurements agree. Proof: `/tmp/dc-workspace-default-toggles.png`.
The packed fixture now imports the Workspace wrappers directly and checks all
three edges in both states, including the legacy small-size prop.

## Final qualification — 18 October 2026

`pnpm packages:pack` passes clean consumer typing and cold development/production
runtime checks in both themes, including all six fixed-size Workspace controls.
The existing approved low KaTeX exception remains unchanged.

The complete `pnpm checks` run passes with these environment overrides:

```sh
STORYBOOK_PORT=9210 WORKSPACE_STORYBOOK_PORT=9210 WORKSPACE_VISUAL_SERVER_PORT=9211 SHELL_STORYBOOK_PORT=9210 SHELL_VISUAL_SERVER_PORT=9211 SHADCN_STORYBOOK_PORT=9210 SHADCN_VISUAL_SERVER_PORT=9211 pnpm checks
```

Results: specification, formatting, native-CSS audit, four type configurations
with zero diagnostics, 821 unit tests, 3 Turbo and 16 release helpers, static
Storybook build, 829 Storybook interaction/accessibility cases, 16 Workspace,
11 Shell, 3 AI and 149 Shadcn browser passes with one existing platform skip.
There are zero functional, interaction or accessibility failures. The exact
left/right/bottom regressions and the Sidebar readiness rerun all pass in this
complete run. Logs: `/tmp/dc-workspace-toggle-final-checks.log` and
`/tmp/dc-workspace-toggle-pack.log`.
