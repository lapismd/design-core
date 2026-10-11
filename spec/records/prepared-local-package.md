# Prepared local package evidence

2026-10-10. Enclosing default-workspace change `lznzkutt`; base `e03b1cfb`.
Owning requirements: DC-PKG-009, DC-ARCH-006, DC-TOOL-003, DC-WS-003.

The source tarball cannot cross jj-store's Vite 8.3.1 / Svelte plugin 7.3.1
optimizer: 31 TypeScript parse errors occurred in raw `.svelte.ts` modules.
`package:local` now prepares the normal packed source inventory with the public
`svelte-package` CLI. Public subpaths point to generated JavaScript, declarations,
Svelte components and CSS. A missing declaration fails packaging. The archive
is an ignored local validation artifact; registry publication, package version
and released source exports are unchanged.

Explicit `typeof` annotations on the compatibility AppShell compound preserve
its existing runtime API while giving declaration generation stable public
component names. No visual component or runtime behavior changed in this slice.
Existing unrelated AI, Diff and verification edits remain user-owned.

Actual commands and results:

- `node --test scripts/pack-local.test.mjs`: 1 test passed. Public names,
  runtime/type conditions, CSS and wildcard paths retain their meanings.
- `pnpm package:local`: initial programmatic API attempt failed because
  `@sveltejs/package` does not export `package`. Replaced it with the public CLI.
  Initial CLI run warned about nine AppShell declarations; explicit component
  annotations repaired them. Final run emits complete declarations without
  those warnings. Logs: `/tmp/view-loading-built-archive.log`,
  `/tmp/view-loading-built-archive-retry.log`,
  `/tmp/view-loading-built-archive-conditional.log`.
- `pnpm checks`: first run rejected a fifth acceptance bullet under DC-PKG-009.
  Folded the archive acceptance into the existing consumer bullet. Generated
  compiler temporary files were moved into ignored `.local/package-proof`;
  final packaging runs within temporary staging and cleans it.
- `pnpm checks` rerun: governance/spec-first, formatting and type checks,
  consumer checks, 722 unit tests, 3 orchestration tests, static catalog build,
  metadata audit and 674 Storybook tests pass. Workspace pointer lane has 14
  passes and one failure: the unchanged notification toast test times out on
  Visual Delta readiness. Subsequent Shell, AI and Shadcn pointer lanes are
  not reached by the fail-fast aggregate. Log:
  `/tmp/view-loading-design-core-checks-retry.log`.
- `pnpm test:workspace:pointer notification-toasts.spec.ts`: the same readiness
  timeout recurs. Log: `/tmp/view-loading-design-core-notification-retry.log`.
  This test, its source component and its Visual Delta readiness helper were
  not modified. No assertion, timeout or visual baseline was relaxed.

Consumer validation is recorded separately as jj-store
E-UI-VIEW-LOADING-001. The installed archive is
`.local/packages/lapismd-design-core-0.1.2-built.tgz`, SHA256
`c24293ea0a98316508e2bbcb281dd839cb5a188bf4645507facb413391fa3c4a`.
It contains the existing dirty source inventory, including independent AI/Diff
work; this record qualifies package preparation, not that work's completion.
Environment: macOS ARM64, Node 26.9.0, pnpm 10.32.1, Svelte package 3.0.0.

Package preparation has focused acceptance. The aggregate is not a full pass;
notification readiness and remaining pointer lanes remain open. Visual
baselines are unapproved. Next: retain local consumer proof, repair the
independent readiness lane in its owner, and qualify a registry release
separately. No registry dispatch, release, tag or installed service changed.
