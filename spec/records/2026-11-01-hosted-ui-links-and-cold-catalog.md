# Hosted UI links and cold catalog qualification

The server parity work exposed insufficient Lapis link-button contrast. The
source-owned link variant now uses foreground text and a persistent underline.
New light/dark scenarios and the generated Link variation remain visual-pending.
No screenshot comparisons or baselines were changed.

- Exact link regression: two failures/two passes before the repair. Complete
  Button families after the repair: 16 passes.
- Initial complete catalog exposed late dependency optimization, repeated
  reloads and duplicate CodeMirror identity: 9 failed/971 passed interactions,
  11 import-suite failures and 10 unhandled errors. The shared development and
  test dependency list now includes the dependencies observed in those reloads.
- Cold affected-family check: 28 passes. The next complete run had one
  VirtualizedHistory visibility failure and 1,032 passes. The exact story then
  passed in a fresh run without changing its assertion.
- Final `pnpm checks`, source `ce670e84`: formatting, specification, type and
  consumer checks pass; 1,118 unit tests/154 files; 1,033 catalog
  interactions/accessibility cases/284 files; static catalog; 16 workspace,
  17 shell, 3 AI browser and 196 shadcn browser passes. One existing conditional
  browser case is skipped. All executed checks pass.
- Exact logs remain under `.local/ui-parity/`, including `checks-2.log`,
  `checks-3.log`, `history-exact-1.log`, `cold-dependencies-exact.log` and
  `checks-4.log`. No failed attempt was retried invisibly.

During qualification, published 0.9.0 landed at `a31e02a7`. Its diff from
`b426f975` contains only package version, changelog and consumed Changesets.
The repair is rebased onto that release source. Final prepared-export payload
comparison and consumer acceptance are recorded separately from this source
behavior matrix. Publication, push and visual approval remain excluded.
