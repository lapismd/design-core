# Transcript item composition acceptance

The `ToolCalls.callWrapper` regression initially failed once because individual
calls had no composition slot. The cold focused rerun passed all eight tests in
three Tool Calls story files. The wrapper preserves disclosure controls and
keyboard access and does not place interactive actions inside their triggers.

On 2026-09-24, `TURBO_CONCURRENCY=1 pnpm checks` passed without retries:

- Governance, formatting, Svelte/types, consumer types and 710 unit tests.
- Static Storybook build, metadata audit and 636 Storybook interaction and
  accessibility tests.
- Workspace pointer: 14; shell browser: 11; AI-chat browser: 2; Shadcn pointer:
  35 passed, with the existing Chromium skip for a WebKit-only assertion.

The package was packed into Community's ignored
`.local/transcript-replies/lapismd-design-core-0.1.2.tgz` and installed there
using `.local/transcript-replies/packed-dependency.cjs` with `--lockfile=false`.
The real grouped-tool reply and failed-send/draft regressions passed both
consumer stories. The first grouped fixture run failed because its canonical
and page record timestamps disagreed; correcting that fixture restored its
verified checkpoint projection. The validation preserves existing dependency files; Community records its
pre-existing file-backed lockfile separately. This is local acceptance, not a
published package.

Changed stories remain `visual-pending`. No baselines were changed. Full
Community acceptance is recorded by its owning repository.
