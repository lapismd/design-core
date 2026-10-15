# Plain browser CSS — slice 1

Reviewed by the user on 2026-10-15. The deferred component work is recorded in
[slice 2](plain-browser-css-components.md); the findings below describe the
original slice 1 archive.

2026-10-15. Workspace `plain-css`, based on remote main `b46bcf02`
(Design Core 0.3.5). Owning requirements: DC-CSS-008, DC-PKG-009,
DC-ARCH-006, DC-TOOL-003.

## Deliverable and review boundary

Package preparation compiles the three authoring stylesheet roots to ordinary
browser CSS, without source scanning. Static theme defaults, keyframes, font
files and their licenses travel with the archive. Existing public imports stay
the same. A fresh Svelte/Vite consumer needs no Tailwind compiler or plugin.

The user selected compiler independence as the first reviewable slice and
deferred the eight component-family repairs below. This is a local review
artifact, not a release candidate. Component selectors, theme/font/reset
splitting, per-component token ownership, tree-shaking, publication and consumer
refresh remain subsequent slices. No application dependency is changed here.

## Baseline and focused evidence

- Baseline `pnpm package:local` succeeds but exported `dist/styles.css` retains
  six compiler dependencies: three imports and three `@apply` directives.
- Updated `pnpm package:local` prepares three roots and audits 207 stylesheet
  files or Svelte style blocks. No compiler directives remain in the prepared
  output. Local review reports 78 pre-existing utility-selector references.
- `pnpm test:release`: 16 tests pass, including six CSS preparation tests for
  static defaults, keyframes, portable licensed fonts, idempotence, standalone
  themes, forbidden scans, missing assets, and strict release rejection.
- Existing selector-remapper tests: 3 pass. `pnpm check:no-tailwind` passes.
- The archive acceptance in `scripts/check-public-package-runtime.mjs` passes
  type checking, cold Vite development and production builds, loaded DM Sans,
  button/input geometry, focus shadow, dark mode, ancestor token overrides,
  screen-reader styling, CodeEditor updates and Composer Input lifecycle,
  with zero Svelte diagnostics.

Reproduce the consumer acceptance after `pnpm package:local`:

```sh
node --input-type=module - <<'NODE'
import {checkPublicPackageRuntime} from './scripts/check-public-package-runtime.mjs';
await checkPublicPackageRuntime(
  `${process.cwd()}/.local/packages/lapismd-design-core-0.3.5-built.tgz`,
  'https://registry.npmjs.org',
);
NODE
```

The first clean-consumer attempt detected Tailwind installed through
`@lapismd/mira@0.0.2 -> tailwind-variants@1.0.0`. The acceptance deliberately
uses `npm install --omit=peer` and explicitly declares required fixture peers
to prove operation with the compiler absent. Ordinary installation still
includes that legacy transitive peer; its removal belongs in a separately
released Mira dependency update. `tailwind-merge` is still used by Design Core's
existing `cn()` helper and is not a CSS compiler. The entire dependency tree
is not yet free of Tailwind-named packages.

Final local archive: `.local/packages/lapismd-design-core-0.3.5-built.tgz`,
SHA-256 `ebb7bb2a2e05bfbf011357f4784ebdae05fd92c33b09f6b4b1eb7e55d2f67cf8`.
All 2,332 runtime/declaration/asset and manifest files match the archive used
by the passing clean-consumer acceptance; only documentation changed afterward.

## Component cleanup for the next slice

The existing markup gate did not inspect these stylesheet selectors. The new
archive audit reports them for local review and rejects them in release mode.
The report is `.release/remaining-style-utilities.json`.

| Component family | Utility/group selector references |
| ---------------- | --------------------------------- |
| Alert            | 2                                 |
| Card             | 16                                |
| Checkbox         | 1                                 |
| Field            | 4                                 |
| Input Group      | 2                                 |
| Label            | 4                                 |
| Tabs             | 23                                |
| Toggle Group     | 26                                |

Repair the owning generator and semantic component selectors together, with
focused evidence for grouped variants, disabled states and dividers. Do not
strip selectors from the archive or waive them in a release.

## Wider verification

The initial aggregate passed specification, formatting, four type-check lanes,
734 unit tests, static Storybook build and the visual metadata audit.

The Storybook interaction count was 20 failures initially and 21 on repetition.
The isolated Dialog OpenDialog case passed. An unchanged-parent checkout passed
all 692 tests, so those failures were not accepted as inherited. Comparing the
actual Vite-generated CSS identified a new test fixture's animation variable
as a catalog source-scan candidate: it enabled an entry animation absent from
the parent catalog. The fixture now references the already-present pulse token
while still asserting that static archive compilation retains entry and exit
keyframes without scanning. The corrected cold run passed all 692 tests across
217 story files. No interaction assertion or visual baseline changed.

All 15 workspace pointer tests and 11 Shell browser tests pass. The AI browser
lane passed all three tests on a fresh server after an initial two readiness
helper errors (`document.body` was null during startup); its assertions and
helper were unchanged. The primitive browser lane passed 56 tests with one
existing Chromium skip for a WebKit-only scenario; that scenario passed in
WebKit. All required functional lanes have passing final results.
The final static Storybook build and specification checks pass; the refreshed
visual metadata audit has zero contract errors. Screenshot comparison and
human visual review remain pending, and no baseline was updated.
Do not run package staging, Vitest Storybook and dev Storybook browser lanes
concurrently in the same checkout: Vite can reload on temporary packaging
tsconfigs or contend over its optimization cache. One overlapping Shell run
was interrupted after three readiness timeouts; its serial rerun is the
qualification run.

Local logs: `/tmp/design-core-plain-css-checks.log`,
`/tmp/design-core-css-baseline-stories.log`,
`/tmp/design-core-plain-css-stories-final.log`,
`/tmp/design-core-plain-css-workspace-pointer.log`,
`/tmp/design-core-plain-css-shell-final.log`,
`/tmp/design-core-plain-css-ai-final.log`,
`/tmp/design-core-plain-css-shadcn-pointer.log`, and
`/tmp/design-core-plain-css-consumer.log`. The aggregate's original failure is
retained; final passing lanes were run separately after the fixture repair.

## Remaining delivery sequence

1. Review this compiler-independent local archive and its evidence.
2. Repair the eight component families and generator leakage, with dedicated
   state/interaction evidence, so release packaging can pass.
3. Separate the small theme from optional fonts/reset and retain the existing
   compatibility stylesheet.
4. Make component token/style ownership explicit and qualify barrel/direct
   imports for CSS tree-shaking using actual Vite build output.
5. Release Design Core through a PR and npm, then refresh Notes/Plugins using
   registry ranges and validate their affected surfaces.

Each slice stops for review. The current work does not publish, merge or
refresh another repository.
