# Core explicit-user development HIGH decision

This records the exact explicit user approval given in the organisation cleanup
thread for HIGH GHSA-fc5q-39xc-vjpf on both Core picomatch development paths. It
does not transfer Docs, Tasks, Mira, or coordinator authority. Production and
packed-consumer audits remain clean and blocking for every other finding.

## Reviewed source and evidence

Dependency source: `81a46ee403c4f129e0800fe597ca35033a809751` (Version Packages `0.13.6` public version bump; lockfile unchanged from the original approved graph).
Manifest SHA256: `214d0036dc96398e2e35833620b9c80631742a124029f0f564766e8d183dc3b2`.
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

## Version Packages rebind

The Version Packages pull request only advances the public package version in
`package.json` to `0.13.6`. The lockfile and installed picomatch paths remain
identical. Under the same explicit-user HIGH decision and original expiry, the
operational policy bindings were updated to this dependency-source commit and
manifest digest so the temporary admission continues to apply until expiry or a
known fix.
