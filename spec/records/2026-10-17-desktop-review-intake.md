# Desktop review candidate for Design Core 0.5.1

The desktop catalog requests latest local Design Core while preserving its
existing unpublished lifecycle and popup contracts. Main revision `e0ca382f`
provides version 0.5.1. Existing migration changes `74a94ed15dfe` and
`54756952db68` were duplicated onto that revision as `714f4877` and `fa174d7e`.
They apply without conflicts; the original migration lineage is preserved.

A direct main-only intake fails during Notes Workspace construction because
`renderer.setCloseGuard` is absent. The combined candidate retains guarded
removal, popup ownership/clearance and drained plugin transitions; none are
replaced by consumer shims. New main component and tab fixes remain present.

`packLocal` prepared the candidate through public built exports and native CSS:
three compiled stylesheets, 253 audited stylesheets and zero remaining utility
references. Archive `lapismd-design-core-0.5.1-fa174d7e-preview.tgz` has SHA256
`473616153257920672a6fb7e6210f945a3f7802975e22ff8661a6fdab54f51c5`.

The desktop user explicitly deferred test suites and native builds for this
presentation review. Earlier records describe original-change qualification;
they do not qualify this new combined candidate. Full source, interaction,
accessibility and consumer acceptance remain deferred. No package is published,
no baseline is approved, and the main bookmark is unchanged.
