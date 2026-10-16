# Awaitable App Shell plugin transitions

This source slice supports Lapis Desktop M4. It is based on the published 0.4.0
line (`c40cb35c`) so the existing registry ranges remain portable. Publication
stays deferred to the migration release gate.

The public plugin manager now tracks admitted enable/disable operations through
their persistence promises. `flushChanges()` waits for those operations;
`stop()` waits before unloading instances. Consumer filesystems and close policy
remain outside Design Core.

Verification on macOS ARM64, Node 26.9.0, pnpm 10.32.1:

- Before: `pnpm exec vitest run --project unit src/shared/workspace/core/plugin-transitions.spec.ts`
  failed both cases: the flush method was missing, and concurrent stop unloaded
  a pending disable twice.
- After: `pnpm exec vitest run --project unit src/shared/workspace/core/plugin-transitions.spec.ts src/shared/workspace/core/app-shell-controller.spec.ts`
  passed all 17 cases, including the two exact regressions.
- `pnpm check:types` passed main, shell-consumer, filter-consumer and source-consumer
  checks with zero errors and warnings.
- `pnpm spec:check` passed validation, mdBook and mapped spec-first.

The user explicitly defers full suites until M7 implementation is complete in
the active delivery session. Deferred final lanes are `pnpm checks`, including
all unit, catalog, pointer/browser, static-build and metadata-audit checks.
Screenshot comparison and baseline updates remain excluded by the user's
standing Design Core preference. No visual component, style, or story changed.

The migration gate is unchanged. Passing this source component does not qualify
M4 or M7; the desktop must consume the verified public archive and prove cold
close/restart behavior with its owned writers.
