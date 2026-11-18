# Required Core development audit correction

Hosted [run44208170836](https://github.com/lapismd/design-core/actions/runs/44208170836)
at afda8edbf346d86fc886774968207ea7822db703 passed all product, Storybook,
pointer, quality, unit and governance jobs, then failed the required Dependency
audits job and aggregate Validate. Earlier local evidence described the unchanged
development findings separately without identifying this required hosted gate;
that interpretation was wrong. The raw audit failure remains blocking.

The two HIGH findings are picomatch4.0.7 through Changesets/config and
picomatch2.3.2 through TailwindCLI/Parcelwatcher/micromatch. Production has zero
findings and raw full evidence has no muted findings. Source issue94 retains the
correction. The source-owned disabled proposal lists only these exact paths,
versions and advisory, ending November19 at00:00UTC or sooner on a fix/successor.
No Core HIGH approval is currently active.

CI now delegates both raw full and production collection to the reviewed shared
63e64958e9b271d36feba06a162ee02b079a3206 action, with empty operational approvals
and always-retained raw audit/decision artifacts. Its repository-root checkout
has full history for actual dependency-source derivation. The separate packed
production audit remains unchanged. No source collector, global ignore, manifest,
lock, qualified release recipe or release-intent binding changes.

Product evidence remains the same source-fixed zero failures/1066 Storybook
cases,196 pointer passes/one governed skip and1133 unit cases documented in the
browser lifecycle record. This audit-only slice changes no component, browser
assertion, worker, timeout or baseline. Its appropriate audit, workflow,
governance and release-policy checks are recorded with the exact blocked probe
in the proposal facts; full browser repetition is unnecessary for this wiring.

The actual immutable GitHub-distributed shared CLI, with package build scripts
disabled, ran on committed Core source c994aa44 and the unchanged clean graph.
It exited1 with `reason: unapproved-finding`, `accepted: []`, raw full exit1/
HIGH2 and production exit0/all severities0. It bound dependency-source
7d2b32dc1fa0e444bdef39276f9c6014cea328a4, root manifest
bb57b420e4d8d45c0e47ac60d20573a512deb424d194111cc3ff934e75e0343b and lock
41d8405f554d352444bcce704a1d997787712367f29c34bcce17baa803534703.
All63 release-policy tests, three spec lanes, full formatting and actionlint
pass. Raw report and immutable checker/test evidence hashes are in the adjacent
proposal facts. The same source policy stays disabled; this qualification
proves correct rejection, not an approved exception or green deployment.
