# Core explicit-user development HIGH decision

This records the exact explicit user approval given in the organisation cleanup
thread for HIGH GHSA-fc5q-39xc-vjpf on both Core picomatch development paths. It
does not transfer Docs, Tasks, Mira, or coordinator authority. Production and
packed-consumer audits remain clean and blocking for every other finding.

## Reviewed source and evidence

Dependency source: `7d2b32dc1fa0e444bdef39276f9c6014cea328a4`.
Manifest SHA256: `bb57b420e4d8d45c0e47ac60d20573a512deb424d194111cc3ff934e75e0343b`.
Lock SHA256: `41d8405f554d352444bcce704a1d997787712367f29c34bcce17baa803534703`.

The disabled proposal at
`docs/proposals/picomatch-development-2026-11-19.md` and its facts file bound
these identities before approval. Shared collector pin remains
`63e64958e9b271d36feba06a162ee02b079a3206`. Raw full audit retains HIGH2 with
all other severities0; production audit is clean; muted is empty. The existing
source-owned LOW deepmerge configuration remains unchanged and separate.

## Exact decision

At 2026-11-18T13:30:52.633Z, under explicit-user authority, accept only
GHSA-fc5q-39xc-vjpf, HIGH picomatch, on these exact development-only paths:

- 4.0.7 at `.>@changesets/cli>@changesets/config>picomatch`
- 2.3.2 at `.>@tailwindcss/cli>@parcel/watcher>micromatch>picomatch`

Vulnerable range `<=4.0.7`, patched range `<0.0.0`. Expiry remains
2026-11-19T00:00:00.000Z, or sooner on a known patch or official stable
successor above 4.0.7. The shared checker additionally limits HIGH to 48 hours
from this approval timestamp. No renewal, broader ignore, production exception,
or cross-repository transfer is granted.
