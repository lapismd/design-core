# Cold consumer package-manager binding

DC-PKG-009 and DC-TOOL-003 retain the existing explicit, checksum-bound Bits UI
2.20.2 patch contract. This repair changes no patch bytes, manifest dependency,
lockfile, advisory policy, assertion or publication scope.

## Actual reproduction

The cold supported Linux `pnpm packages:pack` run rejects the installed
link-preview bytes: actual SHA256 d1003472…35cc3 is the original registry file,
while the existing guard requires the reviewed patched file 84ceb64f…26d14.
The preceding production audit reports zero findings. The run exits one; it
is not a passing package gate. Its archive SHA256 is
fde31f599be44c6d8b7d6b6e9c68afff0d0ce95e677d5c86c3d97d7b26ad4620.

A disposable probe uses the same pinned Playwright image and verified Node
24.15.0 archive as the reaction qualification. With the owner binding,
Corepack selects pnpm 10.32.1. The generated consumer has no packageManager and
instead selects pnpm 12.21.0. Adding the same exact binding restores 10.32.1.
The completed probe and log are retained at
`~/.cache/core-reaction-supported-20261117b/probe-corepack.sh` and
`/tmp/core-cold-consumer-pnpm-probe.log`.

## Repair and required acceptance

The generated consumer now receives the source package's exact packageManager.
The actual child executable must report the same version before dependency
installation; a mismatched direct PATH binary fails closed too. Existing
consumer-root patch staging and all three installed-byte checks remain intact.
No host dependency tree, credentials, package substitution or additional patch
participates.

Repeat the exact cold `pnpm packages:pack` command, preserving clean install,
patch-byte verification, strict types, Vite/browser acceptance and zero-finding
production audit. Run release controls and canonical qualification for this
private package-validation boundary. The source Storybook/browser implementations
are unchanged from the separately qualified complete 1,064-story/243-browser
source snapshot; no product-suite rerun is inferred or needed solely from this
private fixture/runtime correction. Publication and final registry consumer
acceptance remain separate gates. Qualification is pending until the exact
packaged consumer finishes.

## Actual repaired qualification

The cold rerun exits zero. `pnpm packages:pack` reports actual pnpm 10.32.1,
verifies all retained Bits UI patch bytes, passes strict public-consumer types
and completes its browser/runtime acceptance. The production audit contains
zero findings. The complete 40-case release-control lane passes afterward;
all three native canonical lanes also pass. No additional patch or changed
expected checksum participates.

The repaired source snapshot is
`9a4ed2b91ae5b898861f276cf438df1eeba682b4`; archive SHA256 is
`d1ccd44194d1b1c3ea585b5da0f2bc50cc36808cdc31a2fd62224506d62d4f90`.
Pinned image, Node transport and mdBook identities remain those recorded above.
The owned container exits zero and is removed after retaining terminal receipt,
logs and complete production-audit evidence in
`~/.cache/core-reaction-supported-20261117c/`. Only completion records and
formatting change after that source snapshot. Hosted source/version checks and
publication remain separate gates.
