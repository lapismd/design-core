# Tooling

`package:local` stages the normal source inventory, runs `svelte-package` with
declarations, verifies every TypeScript and Svelte declaration exists, and writes an
ignored `-built.tgz` artifact with its SHA-256. Failed preparation cannot select
an incomplete archive. Consumer types and cold prebundling remain separate
checks; the command performs no publication or service installation.
The same preparation compiles global CSS without source scanning, audits all
prepared CSS and Svelte style blocks, and copies referenced assets and licenses.
The cold archive consumer verifies both development and production styling
without a Tailwind installation or Vite plugin, using `npm install --omit=peer`
to exclude the legacy Mira dependency's automatic Tailwind peer installation.
Required fixture peers such as Svelte are declared explicitly; the normal
dependency tree's remaining Mira peer is tracked separately from CSS compilation.
During the incremental CSS migration, local review archives report remaining
component utility selectors in `.release/remaining-style-utilities.json`;
release archives reject those references. Local artifacts are validation-only
and MUST NOT be published while that report is nonempty.

Repository tools keep source generation, discovery, documentation, validation, Changesets, and package-pack evidence reproducible for humans and agents. The catalog CLI lists Diff families, including File Change Stats and Merge Editor, beside shadcn, forms, filter, and AI. Agent tooling guidance keeps external LapisMD repositories outside the workspace and resolves published dependencies through npm semver ranges while preserving portable manifests.

## Public surface coverage

| Surface               | Public boundary | Requirement |
| --------------------- | --------------- | ----------- |
| UI catalog CLI        | Tooling         | DC-TOOL-001 |
| Component generator   | Tooling         | DC-TOOL-002 |
| Validation commands   | Tooling         | DC-TOOL-003 |
| Offline documentation | Tooling         | DC-TOOL-004 |
| Turbo orchestration   | Tooling         | DC-TOOL-005 |

## DC-TOOL-001 — UI catalog CLI

**Requirement.** The UI catalog CLI family MUST list and inspect guides and component families in human-readable and JSON forms.

The AI catalog derives stable public chat components, including shared tool-call detail, from their colocated stories and public subpath exports.

### Acceptance details

- Machine-readable output must be stable enough for repository automation, and validation must include strict public Shell, Search Filter Bar, and composed source-consumer type-checks so source-export compatibility cannot regress unnoticed.
- Tooling failures must report an actionable source path or command.

## DC-TOOL-002 — Component generator

**Requirement.** The Component generator family MUST add, inspect, refresh, and diagnose owned component sources through guarded repository workflows.

### Acceptance details

- Machine-readable output must be stable enough for repository automation, and type validation must exercise focused and composed public source exports under the strict compiler options used by first-party consumers.
- Tooling failures must report an actionable source path or command.
- Generator path allowlists must point to the canonical component inventory rather than a duplicate root document.
- Multipart family CSS must be emitted from an always-instantiated root or content part rather than an optional sibling component, including styles extracted from unannotated nested elements.

## DC-TOOL-003 — Validation commands

Local package checks validate the current source archive independently of
registry release selection, including when its manifest version is published.
Release and local archives share rune-module preparation; only release archives
retain the original source and enter manifest-bound publication.
The staged compiler configuration keeps declaration output inside the archive
fixture. `packages:pack` checks every exported runtime and type target, then
starts a fresh Vite/Svelte consumer and exercises Button and reactive CodeEditor
without consumer aliases or dependency overrides. The release artifact job
installs Chromium before this check.
The clean packed production graph is audited independently of workspace
overrides; complete evidence is retained under `.release/` and blocks the gate
unless it meets the explicit KaTeX policy in DC-PKG-009.
Release tests MUST prove that only that advisory and its npm propagation
chains remain accepted across package releases, with other findings,
severity increases, changed vulnerable ranges, invalid responses, and command
failures remaining blocking.
Storybook runtime-diagnostic guard tests MUST cover formatted warnings,
diagnostic URLs, error objects, logging preservation, and console restoration.
The gate MUST retain diagnostics caught during component teardown and fail
after the story or final suite cleanup instead of relying only on the
immediately thrown error.
The development catalog readiness probe MUST prepare representative client
entries and await pending import requests before browser acceptance begins.
Compilation failures return an unavailable response and allow a later retry.
Development and Vitest hosts share explicit runtime and parser dependencies;
catalog icon imports are discovered deterministically for prebundling.
The release workflow MUST retain the packed audit report as a downloadable
artifact, including when a reported finding fails the gate.

**Requirement.** The Validation commands family MUST provide focused formatting, type, unit, Storybook, source-style, browser, build, and visual-comparison commands, including narrowly filtered engine projects when a compatibility boundary requires real browser acceptance.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Specification commands must retain separate validation, build, spec-first, index, search, and serve entry points through the configured shared CLI.
- Release-safe aggregate gates must use bootstrap-safe validation and bounded post-publication npm visibility waits; cold Storybook tests must prebundle parser dependencies, lifecycle-sensitive checks must run serially, cold runs must have bounded windows, formatting must exclude `.local/` artifacts while preserving evidence, and packaging must reject local cache artifacts.

## DC-TOOL-004 — Offline documentation

**Requirement.** The offline documentation tooling MUST expose guide and component discovery through repository-local CLI commands without depending on a private Docs MCP workspace package.

### Acceptance details

- Machine-readable output must be stable enough for repository automation.
- Tooling failures must report an actionable source path or command.
- Guide and component discovery must point readers back to canonical source paths instead of becoming a second authority.
- Removed Docs MCP commands must not appear in root package scripts or Storybook host configuration.

## DC-TOOL-005 — Turbo orchestration

**Requirement.** Turbo orchestration MUST expose deterministic local and CI task commands, bounded concurrency, and auditable cache results.

### Acceptance details

- The local nonvisual aggregate must execute the same functional lanes that CI fans out, running governance, quality, and unit work concurrently while serializing resource-heavy Storybook and browser suites.
- Static Storybook output must be restored from cache when its inputs are unchanged.
- Cache reporting must distinguish remote hits, local hits, and executed tasks.
- Focused tests must cover default concurrency, overrides, and cache-summary classification.
