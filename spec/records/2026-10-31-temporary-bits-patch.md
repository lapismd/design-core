# Authorized temporary Bits UI patch

Requirements: DC-PKG-009, DC-ARCH-005, DC-TOOL-003, DC-SHA-054.

## Scope and provenance

The user explicitly authorizes a reproducible tracked package-manager patch
while the owner FocusScope repair awaits upstream release. This scoped
exception applies to released Bits UI 2.20.2 and preserves the existing
Link Preview and Slider lifecycle fixes. No fork package, source alias,
dependency-node_modules edit, diagnostic exception or visual baseline changes
are introduced.

The canonical payload is `patches/bits-ui@2.20.2.patch`, produced by
`pnpm patch bits-ui@2.20.2 --edit-dir <temporary-directory>` and `pnpm patch-commit`.
SHA-256 and pnpm lock patch hash:
`debd3bc7d43917f0967f0cc1e212fc5c7721c751d3b92bf8f31030d1c96289ad`.
The shared payload is copied byte for byte into each actual installation root.

Registry Bits 2.20.2 integrity is
`sha512-cb1eQD1wZEhJWb1dTLiAdYWqeUI5v7f+7EAHmetxBuELI9lo4cpAIfGEjald/PR4wTR80Fu5DFH+IaY1OKn+tg==`.
Notes independently verifies the registry tarball SHA-256 as
`e9dfe0419e82b4b6f6f741c8ce612c86918b30ce8bd95db3457f14d8df3199db`.
`patches/manifest.json` retains all original/final SHA-256 and Git blob identities.

- Link Preview retains the cancellable deferred pointer-selection probe and
  destroyed guard from Plugins `bf492db552702fd310dcc6439152d42d472de068`,
  `spec/records/2026-10-11-plugin-test-unblock.md`. The listener-safe cleanup is
  already upstream in 2.20.2. Notes' carried timer patch is
  `d9b49a52c343dfbd392e235b5d748e5922f3e16e727cf92064437a95c90530f9`.
  Its final file blob remains `1ab543c5310bbe1bcce1b9dbb3aaa2dd7010c602`.
- Slider retains all six single/multi pointer handlers' destroyed guards from
  Plugins `201b1feb60fe97ee383ea30b061e453e1ad5e853`, LP-SPEC-058 and
  `spec/records/2026-10-27-preview-lifecycle-slider-drain.md`. Registry 2.20.2
  has the exact old preimage `eb30e0b45a03d014d58d9d30f63aed4630c26dd1`;
  the patched result remains `76a550a0f8fe3cc14e7236ac35b2acfccd6484e3`.
- FocusScope adds only the identical-container early return from owner
  `692fbdf5095941464561189fd81ffc2cb4b81c6c` / upstream
  <https://github.com/huntabyte/bits-ui/pull/2264>. The compiled file matches
  the previously verified owner output exactly, SHA-256
  `62c6ee5f7352531f61e465b38ae901bb9b3c2d1c3fb3d5bd7dc445e491a1e0f1`.

## Original Linux boundary

The before source `a99a8d14fe581f326dff01c3f67faa3f8abf1930` consumes registry
2.20.2 without a patch. The only semantic adaptation is querying the dependency's
native combobox roles. The same frozen image, four CPUs, 12 GiB memory, 2 GiB
shared memory, init and isolated source-transfer process qualify both sides.
No host checkout, authentication or provider data mounts into either worker.

```sh
pnpm test:storybook src/shared/filter/search-filter-bar/SearchFilterBar.stories.svelte src/shared/shell/app-shell/AppShell.stories.svelte src/shared/shadcn/emoji-picker/EmojiPicker.stories.svelte src/shared/ai/experimental/emoji-picker/EmojiPicker.stories.svelte --maxWorkers=2 --no-file-parallelism
```

Before: 31 passes and one RestrictedReactions failure. Arrow navigation loses
selection to the search input; Enter leaves `No emoji selected` instead of ❤️.
After source `938ac8fd956c4ff1d25f9de5390399a44ce176ab`: 32 passes, zero failures.
The same immediate focus and final selection/closure assertions remain intact.

Both source graphs install with `pnpm install --frozen-lockfile --ignore-pnpmfile`.
The after worker checks the payload digest and all three installed postimages.
Strict source/manifest hashes remain unchanged. Both explicit spec-first ranges
pass. Reports, exact source bundles, input checksums and command/timing receipts:
`/tmp/lapis-core-tracked-patch-validation-20261031/{before,after}/results`.
An initial transfer-path mistake stopped before tests; its setup log is retained
separately from the corrected before run and is not counted as a product failure.

## Complete source qualification

Immutable source `97d1b09b9d7992fe55978133c85b87dc97969dc2`, based on released
main `3ee2b016`, installs the frozen registry graph and verifies the payload plus
all three installed postimages. The uncached bounded Linux worker passes the
exact JSON two cases, Swipe nine cases, four focus families 32 cases, dependency
compatibility families four cases, and cold Avatar target ten repeats plus all
four family cases. Avatar acceptance waits for the previous named tooltip's
physical removal before asserting the new tooltip; its identity/text assertions
and zero-retry policy remain intact.

The complete aggregate passes 920 units, 994 Storybook interaction/accessibility
cases, four strict type surfaces with zero errors/warnings, formatting,
specification, the static build, Workspace 16, Shell 17 and AI three browser
cases. Its Shadcn lane has 146 passes, one existing platform skip and seven
WebKit launch failures: the base image lacks GTK4/GStreamer and other system
libraries. No product assertion executes in those seven cases. The original
aggregate exits one and remains a failed receipt; its public-package phase
does not run. Reports remain under
`/tmp/lapis-core-tracked-patch-validation-20261031/full/results`.

The continuation uses the same immutable source, dependency graph and image,
installs browser system prerequisites with
`pnpm exec playwright install --with-deps chromium webkit`, and reruns
`pnpm test:shadcn:pointer --project=webkit --retries=0`: seven passes, zero
failures. It then reruns the complete affected Shadcn lane and public-package
gate. Complete Shadcn acceptance passes 153 cases with one existing platform
skip and zero failures, with retries disabled. The OS package inventory and
command receipts remain under
`/tmp/lapis-core-tracked-patch-validation-20261031/webkit/results`. Hosted CI
already installs both browser engines with `--with-deps`; no CI source or
assertion change is required. Already green unrelated lanes are not repeated.

The exact `pnpm packages:pack` continuation initially fails once before browser
startup: the final prepared archive rebuilds its file inventory and omits
`patches/manifest.json` despite the source manifest including `patches/`.
The repair retains the patch directory in both prepared archive profiles.
Fresh immutable source `95b70dd4ca65341a294c7bfc53caca0775b01e61` passes the
same exact package command, all 35 release-tool guards and the existing export
guard. Only packaging inventory and canonical receipts differ from the
already-qualified product source; unrelated green product lanes are not rerun.
The clean public consumer verifies all three patched files, passes strict types
and development/production browser acceptance in both themes with no Svelte
diagnostics. Existing low KaTeX GHSA-238p-pmpm-9mq7 acceptance remains explicit
for six affected packages; no new advisory exception is introduced.

The retained-source prepared archive has SHA-256
`b80ad762df4f4bd33f65e6cb895ac2827f9f28f21dbe202c9c11dc9c00592856` and is
retained with its source/profile receipt under
`/tmp/lapis-core-tracked-patch-validation-20261031/qualified-artifact`.
Its pre-version manifest still says 0.7.2. Those bytes are not registry 0.7.2
and qualify preliminary source acceptance only. The final release requires the
new registry version and separately verified final consumers. Complete package
receipts remain under the sibling `package/results` directory.

## Public installation and remaining gates

Published dependency pnpm metadata does not propagate patches. The artifact
ships the exact payload and manifest, and README directs each consumer to
configure its own root selector and frozen lock. No installation hook rewrites
consumer files. The public runtime fixture explicitly configures that clean
pnpm root and disables automatic peers while retaining all CSS/tooling exclusions.

The package gate checks metadata/version/digest/three-file scope, stages the
identical payload, then resolves Bits from the actual installed Core package
and verifies all three postimages. Tampered/missing/mis-scoped artifacts,
unapplied patches and mismatched installed versions fail closed. The public
restricted-picker regression retains initial search focus, immediate option
focus, keyboard selection, physical popup removal and restored trigger focus
in development/production and both themes.

The combined uncached Core source/browser qualification and corrected clean
public artifact acceptance pass. Protected source and version PR checks, actual
publication/provenance and each final consumer remain pending. The user
authorizes qualified PR/version merges and release
follow-through; authentication remains owned by the root workstream. No prepared
source or archive-only pass is a published-package release claim.

Release HTTPS fetch confirms main remains `3ee2b016`. The 23 registered
workspaces, including 14 available roots, remain accounted for in
`/tmp/lapis-core-tracked-patch-final-workspaces-20261031.json`. Other registered
heads and all three protected runtime files remain unchanged. The stale Linux
diagnostic checkout is inspected without updating it, and missing roots remain
untouched. Canvas Table, the public icon-service extension and independent
Notebook follow-ups remain outside this repair. Open Dependabot count is zero;
recheck immediately before every push and fetch again before version/release.

Upstream merge alone is a removal prerequisite. Remove the temporary patch only
after a resolved registry version contains all three equivalent fixes and the
exact plus complete source/public/consumer acceptance passes without it.
