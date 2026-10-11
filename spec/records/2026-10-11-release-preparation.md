# Design Core release preparation

The release workspace preserves the remote 0.2.0 release metadata and the
registry-visibility prerequisite from PR #9, then integrates the unpublished
source backlog. Primary workspaces and their local history remain intact.
Consumed Changesets are removed; pending feature Changesets target the next
minor release. No release version has been published by this preparation.

Owning requirements: DC-PKG-009, DC-ARCH-006, DC-TOOL-003.

## Dependency and integration checks

Mira uses `~0.0.2`, admitting the planned 0.0.3 patch while excluding 0.1.0.
The source boundary test initially failed once, then all four tests passed.
Explicit CodeMirror peers support a normal registry install. Spec Validator
uses the released 0.1.4 range, with optional QMD peer installation disabled.
Changesets 3 and the maintained Storybook cohort are integrated.

Workspace dependency audits initially found 41 findings in the complete graph
and 12 in production. Updated supported ranges and reviewed overrides reduced
both graphs to zero. `pnpm ui doctor` passes.

## Public package regression

Exact command: `node /tmp/design-core-release-runtime-check-01a129c1.mjs`.

The original raw source archive failed cold Vite dependency prebundling once:
`import type` in `form-controller.svelte.ts` was parsed as JavaScript, so the
consumer Button could not mount. Release archives now share the existing
source-owned preparation helper with local archives, retaining source alongside
prepared JavaScript, Svelte components, CSS, and declarations. All public import
names are retained. No consumer alias, shim, dependency patch, or override was
introduced.

The first prepared `pnpm packages:pack` attempt failed once on a missing
`data-ui-contract.d.ts`: Svelte package 2 resolves declaration output relative
to the compiler configuration. A staged configuration now scopes input and
output to the package fixture. The exact cold consumer rerun passes, mounting
Button and updating CodeEditor. This is now maintained as
`scripts/check-public-package-runtime.mjs` and invoked by `packages:pack`.
Every TypeScript and Svelte declaration remains required, and all explicit
runtime/type export targets are checked. The release job installs Chromium.
The maintained clean consumer also runs strict Svelte/TypeScript diagnostics
with warnings rejected before exercising the browser. Both checks pass on the
final public archive; log: `/tmp/design-release-public-types-runtime.log`.

The formerly published-version no-op in `pack-check` is repaired. Its exact
regression failed once before repair and passes afterward; all three release
tests and the export-map test pass. The fake-command fixture is isolated from
real release tarballs.

## Full source validation

`pnpm checks` passed all nine lanes before the public archive repair: 723 unit
tests, 679 Storybook interaction/accessibility tests, four Svelte/type checks
with zero errors or warnings, 15 Workspace pointer tests, 11 Shell pointer
tests, 3 AI browser tests, and 56 Shadcn Chromium/WebKit tests with one existing
project skip. Specification, formatting, no-Tailwind, static Storybook, and
visual metadata checks pass. Log: `/tmp/design-release-checks-complete.log`.

Screenshot comparison and baseline updates are excluded by user preference.
Functional and accessibility checks remain gates.

`pnpm checks` after the archive repair also passes all nine lanes with the same
counts above; log: `/tmp/design-release-checks-public-final.log`. Its first
attempt found one non-atomic acceptance bullet, repaired without changing the
requirement. Final spec-first reports 169 protected files and 22 canonical
chapters; the focused release/export-map suite has four passes.

## Remaining publication blocker

A clean installed-tarball production audit reports six affected packages from
one unique low-severity advisory: GHSA-238p-pmpm-9mq7 in KaTeX below 0.18.2.
Mira's latest upstream math dependencies still declare `katex ^0.16.0`; the
workspace override to 0.18.10 cannot travel to npm consumers. Evidence:
`/tmp/design-release-packed-audit.json` and Mira's release-preparation record.
Final `pnpm packages:pack` passes archive inventory, export/type checks, clean
typed consumer, cold startup, and reactive editor acceptance, then fails only
the independently audited production graph; log:
`/tmp/design-release-package-gate-final.log`. Machine-readable evidence is
retained at `.release/production-consumer-audit.json`.
Publication remains blocked pending an upstream repair or explicit user
acceptance of a recorded exception. Source validation does not waive this.
