# Relative-time visible accessible names

DC-SHA-062 requires the interactive accessible name to contain the visible date
text alongside its exact date or custom host context. This repairs the axe
label-content-name-mismatch reproduced by the Notes operation card. Public
props, date formatting, clock lifetime, destination policy and pixels are
unchanged. No baselines are updated.

The exact family gains default-name and linked custom-label assertions.
`pnpm test:storybook src/shared/shadcn/relative-time/RelativeTime.stories.svelte`
fails two cases before the fix and passes all four after it. Logs live under
`.local/relative-time-accessibility/{before,after}.log`.

Package qualification passes as recorded below. The private Notes migration
consumes a prepared public archive through its existing ignored overlay;
publication is outside this slice.

## Cold catalog startup

The first wider run passes 821 unit/841 catalog cases, Workspace 16, Shell 11
and AI 3 browser cases. Its Shadcn lane has 150 passes, one guarded skip and
one 15-second story-readiness timeout before the Workspace bottom-control
assertions. The exact case repeats that timeout. Trace network timings show
shared AppShell entries compiling after the advertised readiness barrier.

DC-TOOL-003/DC-CAT-004 now include that public export graph in the existing
client-compiler preparation barrier. Missing shell compilation fails closed
and a repaired probe can retry. The exact new probe test fails once before
the fix (three other cases pass). Interaction timeouts, readiness markers,
assertions and visual baselines stay unchanged. Final qualification is below.

## Final qualification

Enclosing Jujutsu change: `nzvxwktu`, based on `aae7dc35`. Node 26.9.0,
pnpm 10.32.1, Design Core 0.5.1, macOS ARM64.

- `pnpm test:unit scripts/storybook-catalog-readiness.spec.ts`: new refusal
  regression is 1 failed/3 passed before, 4 passed after. Logs:
  `shell-probe-before.log`, `shell-probe-after.log`.
- `pnpm test:shadcn:pointer -g 'Workspace bottom control uses default button styling and fixed frame'`:
  the unchanged exact case passes after the startup repair (6.3 seconds for the
  interaction; 56.3 seconds including cold startup). Its prior repeated timeout
  is preserved in `panel-exact.log`; fixed run is `panel-after.log`.
- `pnpm checks`: final run passes every required nonvisual lane. It includes
  strict types/format/style and public-consumer audits, specification/static
  catalog/visual-metadata checks, 822 unit cases, 19 Node cases, 841 Storybook
  interaction/axe cases, 16 Workspace, 11 Shell, 3 AI and 151 Shadcn browser
  passes. One guarded Chromium skip of the WebKit-only overlay case remains;
  its WebKit counterpart passes. `checks3.log` is the final log.
- Three nonfatal ResizeObserver loop diagnostics remain in the passing catalog
  interaction output. They are recorded separately from assertion/axe counts;
  this change does not establish their cause or resolve them.
- The first `pnpm checks` attempt fails formatting in verification Markdown;
  the corrected broader attempt (`checks2.log`) reaches the repeated startup
  timeout described above. Neither is presented as a full pass.
- `pnpm package:local` prepares 252 browser CSS files with zero remaining utility
  references. The verified production input snapshot is
  `c85c4aa6cf86fdc6b8edfcb4a4d1ed23e489ec16`; archive SHA-256 is
  `8768360cb65fb3dfa760e548a5f57fa5f8c5ce737f7f111f88322e9fd590783e`.
  `pack.log` records the exact artifact. Later changes affect source-catalog
  readiness only; packaged production bytes do not change.

Logs and the first timeout's retained browser artifacts are under
`.local/relative-time-accessibility/`. Notes consumes the archive through its
existing ignored overlay and qualifies its production operation-card stories
separately in E-REPO-010. No package publication or baseline updates occur.

The changed source, stories, readiness regression and owning DC-SHA-062,
DC-TOOL-003/DC-CAT-004 chapters are selected in `spec/src/verification.md`.
Final evidence-only consumers run `pnpm spec:check` and changed-file Prettier
checks before commit. Public props, date/clock and destination behavior remain
unchanged; only the accessible-name contract and source-catalog preparation
barrier change. Whole-application visual review remains separate.
