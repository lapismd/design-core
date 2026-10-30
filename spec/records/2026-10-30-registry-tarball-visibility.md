# Released-tarball visibility verification

Requirements: DC-PKG-009, DC-TOOL-003.

Release run 41130580060 published `@lapismd/design-core@0.7.1` from
`72aed92f613f6f27781734a16332d6602a354507`. The first verification job
124325976085 observed the version in npm metadata, then failed its clean
installation with E404 for the exact released tarball. Existing visibility
retry covered metadata only. No package-source or provenance failure was shown.

Rerunning only the failed jobs after propagation succeeds: verification job
124327193642 completes the clean registry install and npm signature/provenance
audit, retains artifact 13013303248, and dependent job 124327531533 creates the
package tag/GitHub release. The published version is unchanged.

The release helper now bounds released-tarball E404 retries using the existing
visibility attempts/delay options (30 attempts, 10-second delay by default).
Every attempt creates and cleans an independent consumer. Other missing
packages, authentication/integrity errors and signature/provenance audit
failures remain fatal. No publication or product behavior changes.

Regression evidence:

- Original `node --test scripts/design-core-release.test.mjs`: 3 passed.
- Before fix, `node --test --test-name-pattern='waits for the tarball'
scripts/design-core-release.test.mjs`: 1 failed on metadata-visible/tarball-404.
- The same exact command after fix: 1 passed.
- `pnpm test:release`: 23 passed, zero failures, including bounded exhaustion,
  fresh consumer cleanup, fatal authentication/integrity errors, unrelated
  missing dependency and failed signature verification.

Spec Validator resolves latest npm 0.2.0. The initial host Node 26 invocation
reports a QMD ABI mismatch. Explicit installed Node 24 PATH permits semantic
`pnpm spec:search` and doctor succeeds; its final run has only the expected custom script-alias warning. Search returns
canonical Package exports, Tooling, Architecture and Verification chapters;
these, rather than the index, govern the change.

Final local qualification: `PATH=<installed Node 24>/bin:$PATH
STORYBOOK_PORT=9669 pnpm checks` passes all required nonvisual lanes:
917 unit cases, release/Turbo tests, 978 Storybook interaction/accessibility
cases, 16 Workspace pointer cases, 17 Shell pointer cases, three AI browser
cases and 153 Shadcn browser cases (one existing engine-specific skip).
Formatting, all four strict type-consumer checks, source-style audit, static
Storybook build/metadata audit and three specification lanes also pass.
The final release-helper revision separately passes all 23 release tests and
the exact tarball regression after preserving complete npm diagnostics and
forcing online registry revalidation. No screenshot baseline changes occur.

Push preflight finds no open Dependabot pull requests. This tooling-only repair
is based on released main and does not version, repack or republish product
code, or incorporate unrelated work from other registered workspaces.
