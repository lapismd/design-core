# File Path Input composite focus

The main Design Core workspace started clean at `6c04ce2f`. FilePathInput
composed the shared Input and Button in a ButtonGroup, leaving the input's
focus ring around only the editable portion. The owning DC-FORM-049 contract
now requires a single focus boundary around both controls.

The family-owned native stylesheet paints that shared boundary while focus is
inside the group and removes the duplicate child shadows. It retains the
existing input focus token, joined geometry, disabled and read-only behavior,
and destructive indication for invalid values. A system-color outline keeps
the complete boundary visible in forced colors. Input, Button and ButtonGroup
APIs and unrelated styling remain unchanged.

## Regression and review

Exact regression command:

```sh
pnpm test:storybook src/shared/forms/file-path-input/FilePathInput.stories.svelte
```

Before changing the production stylesheet, the new focus assertions failed in
`SelectAndCancel`: the group had no shadow while the input was focused.
Baseline: one failure and four passes. The story also checks Tab/Shift+Tab,
keyboard Browse activation, cancellation, loss of focus and stable geometry.
Read-only and invalid scenarios extend coverage without changing the public API.

Focused browser command:

```sh
SHADCN_STORYBOOK_PORT=9210 pnpm test:shadcn:pointer tests/shadcn/file-path-input.spec.ts
```

This exercises the real catalog in light and dark modes, shared-ring geometry,
keyboard navigation and forced-colors fallback. Screenshots from the main
catalog retain input and Browse focus under `/tmp/dc-file-path-focus-input.png`
and `/tmp/dc-file-path-focus-browse.png`. No screenshot baselines are updated;
the affected stories retain `visual-pending`.

Logs use the `/tmp/dc-file-path-focus-` prefix. Complete qualification results
are recorded after the required lanes finish.

## Focused qualification and inherited package blocker

- The exact story-file command passes all seven scenarios: the original five
  plus read-only and invalid cases. Declarative Settings passes its affected
  scenario separately. The real-browser light/dark and forced-colors cases
  pass 2/2. Story assertions await the existing input shadow transition and
  font loading before checking paint and geometry; keyboard navigation is
  checked before the chooser temporarily disables its triggering button.
- The published-archive preparation/CSS audit and strict clean-consumer type
  check pass. The package-wide runtime smoke stops before rendering because
  registry Mira `0.0.5` does not export `TableReader`, which the existing
  Transcript `RichTable.svelte` and `TableRowQuote.svelte` import. These files,
  `package.json` and `pnpm-lock.yaml` are unchanged from parent `6c04ce2f`.
  A separate minimal production build using the parent's exact import
  reproduces the missing-export failure. Mira owns that export; releasing it
  and qualifying the existing Transcript dependency remains separate work.
- A clean consumer of the same prepared archive using only the focused
  `forms/file-path-input` entry passes in cold development and production,
  in both light and dark modes, without a Tailwind installation. It checks
  the continuous ring, Tab navigation, keyboard chooser activation, stable
  geometry and zero runtime diagnostics. Its four combinations pass; it does
  not bypass or claim success for the failing package-wide smoke.

Focused logs: `dc-file-path-focus-exact-final.log`,
`dc-file-path-focus-settings.log`, `dc-file-path-focus-browser.log` and
`dc-file-path-focus-public-consumer.log` under `/tmp`. The last includes the
parent reproduction; its temporary fixture is recorded in the ignored
`.local/file-path-focus-consumer.json`. The failing wider package log is
`/tmp/dc-file-path-focus-pack.log`. The failure count is zero for the changed
component and one inherited missing-export cause for the wider package lane.

## Repository gate status

`STORYBOOK_PORT=10209 pnpm checks` passed governance, repository formatting,
all four type configurations with zero errors/warnings, the native-CSS audit,
859 unit cases, 3 Turbo tests, 16 release/tooling tests, the production
Storybook build and the workspace visual metadata audit (zero contract errors).

The catalog reported 256 completed files with 867 passing cases and two
30-second timeouts: CodeBlock `DefaultTSX` and Workspace Mobile
`EditorWithRevealableSidebars`. Both owning files then passed together in a
fresh process: 18/18, without changes to those sources or assertions:

```sh
pnpm test:storybook src/shared/workspace/mobile/WorkspaceMobile.stories.svelte src/shared/shadcn/code-block/CodeBlock.stories.svelte
```

The aggregate stopped reporting progress with ButtonGroup variations and
structural AppShell still unreported. The stalled run was terminated, so it
does not constitute a passing full suite. Subsequent aggregate browser lanes
did not execute. Catalog timing/termination remains owned by Storybook tooling;
no assertion, timeout or dependency was weakened for this focused style fix.

Full-run evidence is `/tmp/dc-file-path-focus-checks.log`; the isolated
18/18 rerun is `/tmp/dc-file-path-focus-catalog-recheck.log`. The two catalog
timeouts and the inherited package-export issue remain explicit blockers to
complete broad qualification. On 2026-10-21, the user explicitly accepted
keeping this fix focused and deferring broader qualification. That decision
permits the focused local commit with these wider issues recorded separately.
No publication is attempted.
