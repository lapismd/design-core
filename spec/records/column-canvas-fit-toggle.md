# Column Canvas resize-rail toggle

Requirement: DC-SHA-036. The user requested a bounded attempt to fit column
contents, then clarified that double-clicking at default width expands and at
any other width resets. Enter on the separator uses the same behavior.

## Implementation

`Column` measures currently mounted content in place, including clipped labels,
without cloning editors or requesting hidden data. Expansion never shrinks the
column and defaults to a finite 720px cap, configurable with `fitMaxWidth`.
Column/neighbour limits still apply. Controlled widths notify their host on
expansion and reset. Wide pairs compare against their normal stage allocation
and reset their saved split, retaining the pair total and viewport position.
New gestures, disposal, navigation and structural/mode changes supersede fitting.

## Targeted verification

- Exact regression: `pnpm exec vitest run --project storybook src/shared/shadcn/column-canvas/ColumnCanvasFit.stories.svelte`.
  Initial harness import had one transform failure and zero tests (initial prop
  capture); after correcting the harness, 5 of 8 failed against always-fit
  behavior. The corrected toggle passed 8/8. An intermediate pair assertion
  failed because it measured before initial stage allocation; the test now
  waits for the real wide allocation before checking the unchanged total.
- `pnpm exec vitest run --project unit src/shared/shadcn/column-canvas/column-canvas-controller.spec.ts src/shared/shadcn/column-canvas/column-canvas-layout.spec.ts src/shared/shadcn/column-canvas/column-canvas-pinning.spec.ts src/shared/shadcn/column-canvas/column-canvas-docs.spec.ts`: 33/33 passed.
- All six directly affected Column Canvas story files: `pnpm exec vitest run --project storybook src/shared/shadcn/column-canvas`: 34/34 interaction/accessibility tests passed in a fresh Vitest/Vite process.
- `pnpm exec svelte-check --tsconfig ./tsconfig.json --fail-on-warnings`: zero
  errors and warnings.

- `pnpm spec:first` and `pnpm spec:check`: passed; changed-file formatting and
  `pnpm check:no-tailwind`: passed.
- Prepared source-inclusive public package with `packLocal({retainSource:true})`:
  declarations emitted, 270 browser CSS surfaces audited, zero utility references.
  Local archive `lapismd-design-core-0.6.0-column-fit-review-source-built.tgz`,
  SHA-256 `f4b58f28cdeaf50cdf12d4fc73e46d952afd3143b2b7df6ac3d8007b63621c12`.

Review remains visual-pending. Broad suites, static catalog qualification,
publication and visual baselines are deferred until final screen review, per the
user's instruction. Agent UI acceptance uses a prepared source-inclusive local
review archive while tracked manifests and lockfiles retain registry ranges.
