# Disabled Core development-audit proposal

This proposal is **disabled**. Operational policy has `approvals: []`; the
required Dependency audits job blocks both HIGH findings. No coordinator,
Mira, Docs, Tasks or other source approval transfers to Core. A separate exact
explicit user decision is still required.

The proposed scope is only HIGH `GHSA-fc5q-39xc-vjpf`, module `picomatch`:

| Version | Exact development path                                    |
| ------- | --------------------------------------------------------- |
| 4.0.7   | `.>@changesets/cli>@changesets/config>picomatch`          |
| 2.3.2   | `.>@tailwindcss/cli>@parcel/watcher>micromatch>picomatch` |

Both first hops are declared root development dependencies. Changesets can later
run with the existing repository-scoped App write credential; the Tailwind CLI
is development tooling. Neither production audit nor the separate packed public
consumer audit receives an exception. Production is clean.

The raw advisory range is `<=4.0.7`, with no recorded patch
(`patched_versions: <0.0.0`). The proposed acceptance expires November 19, 2026
at 00:00 UTC or sooner on a known fix. Fresh official registry evidence must
contain both exact installed versions and ceiling4.0.7; any stable successor
beyond that ceiling also ends acceptance immediately. No extra path, version,
severity, finding, expiry extension or source rebind is authorized here.

The required job uses the reviewed shared action at
`63e64958e9b271d36feba06a162ee02b079a3206`, merged through
[Lapis CI #30](https://github.com/lapismd/lapis-ci/pull/30). It collects complete
raw full and production reports, retains the blocked decision even on failure,
and rejects missing/muted evidence, additional findings and production exposure.
Any future exact approved entry must enforce repository, dependency-source,
manifest, lock, record, path/version/advisory/severity, time and official registry
bindings. The adjacent facts file binds the final unchanged dependency graph and
records source/checker evidence. Its broader source-file hashes are review
evidence only, not a claim of additional runtime checks of every product byte.

The existing source-owned LOW deepmerge configuration is unchanged. The actual
raw report has `muted: []`; this proposal adds no ignore and cannot waive a future
suppressed finding. All functional/browser/axe, public patch Changeset, release,
publication, activation and packed-consumer gates remain required.

Hosted run44208170836 proved the required audit job and aggregate Validate fail
after every product and browser lane passes. Earlier local commentary inferred
this was merely a separate follow-up; that inference was incorrect. The failure
is preserved in [issue94](https://github.com/lapismd/design-core/issues/94) and
the source qualification record. This disabled proposal does not make PR93 green.
