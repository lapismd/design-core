# Caught teardown diagnostics and bound Composer Input handles

The KaTeX exception validation found 11 Svelte `state_proxy_equality_mismatch`
warnings in Composer Input and Composer teardown despite the throwing runtime
guard. Component cleanup caught the immediate guard error, so the suite still
passed. Under DC-TOOL-003, the guard now records each diagnostic and checks the
record after each story and after final suite cleanup; catching the immediate
error cannot clear it.

Composer Input assigned a plain handle to a consumer's `$state` binding, then
compared that proxy against the original plain object during cleanup. The
comparison both warned and failed to release the bound handle. Under DC-AI-026,
the component captures the handle identity returned by the binding inside
`untrack`, then clears only that assigned identity on teardown. A subsequently
replaced consumer handle remains owned by the consumer.

## Exact regression evidence

- `pnpm exec vitest run --project unit
scripts/storybook-runtime-diagnostics.spec.ts`: the new caught-error recording
  test failed before the callback repair (**1 failed, 4 passed**); the exact
  target now passes **5 tests, 0 failures**.
- `pnpm exec vitest run --project storybook
src/shared/ai/composer-input/ComposerInput.stories.svelte
src/shared/ai/composer/Composer.stories.svelte`: the new `BoundHandleLifecycle`
  scenario failed to release its handle before the source repair (**1 failed,
  22 passed**), while the old guard allowed cleanup warnings. Retaining caught
  diagnostics exposed **12 failed, 11 passed** on the same target. The source
  fix then passed **23 stories, 0 failures and 0 Svelte diagnostics**.
- The new lifecycle fixture imports only the public `ai/chat` contract and
  checks mount, release through a reactive binding, remount, consumer
  replacement, and preservation on teardown. The cold packed consumer reuses
  this fixture under DC-PKG-009 and rejects Svelte console diagnostics as well
  as browser errors.

Dependency manifests and lockfiles remain unchanged. Lapis Notes has no direct
Composer Input usage; the Lapis AI plugin still consumes Design Core through
`^0.1.2`, which does not resolve the 0.3.x source line being prepared here.
Consumer ranges have not been advanced ahead of registry publication. This
slice validates the source and its packed public contract; an application
upgrade requires separate consumer acceptance at the released version.

## Packed public acceptance

`pnpm packages:pack` passed clean public consumer type checking and cold
Vite/Svelte startup. The public Button and reactive CodeEditor checks passed,
followed by bound Composer Input release, remount, replacement, and teardown
acceptance with **zero Svelte diagnostics or browser errors**. The independent
production audit still records the six known low KaTeX propagation rows and
prints the separately approved advisory-specific exception.

## Full source validation

`pnpm checks` passed all nine nonvisual lanes with **728 unit tests**, **684
Storybook interaction/accessibility tests and zero Svelte diagnostics**, strict
type checks, static build and metadata audit, and Workspace (**15**), Shell
(**11**), AI (**3**), and Shadcn (**56**, plus one existing skip) browser tests.
`pnpm spec:check` passed all three specification lanes after adding the atomic
DC-AI-026 handle lifetime contract and its verification row. Visual baselines
were not changed; the new acceptance story remains `visual-pending`.
