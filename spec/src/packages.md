# Package exports

The app-component promotion batch adds the Chat entry point and qualifies
published Mira `~0.0.5`. Responsive Tabs and Avatar use family exports; Avatar
Picker uses Forms and Topbar uses Shell. Consumer adoption remains deferred.

Avatar Picker also offers `./forms/avatar-picker` for focused source consumers,
matching the existing focused Forms entry-point pattern. The built Forms barrel
remains its standard import and is verified through the packed consumer.

The root package manifest defines the supported import boundaries. Family barrels may expose compound parts, controllers, tokens, and types.

`./shadcn/emoji-picker` exports the generic picker, custom/Unicode option types,
default suggestions and tokens. AI experimental imports remain aliases to that
same component. Published Emoji Mart runtime and data dependencies load only
for the full picker; restricted and suggested-only selections stay lightweight.

## Public surface coverage

| Surface                 | Public boundary  | Requirement |
| ----------------------- | ---------------- | ----------- |
| Root styles and themes  | Package exports  | DC-PKG-001  |
| Shadcn exports          | Package exports  | DC-PKG-002  |
| Forms exports           | Package exports  | DC-PKG-003  |
| AI exports              | Package exports  | DC-PKG-004  |
| Filter exports          | Package exports  | DC-PKG-005  |
| Shell exports           | Package exports  | DC-PKG-006  |
| Workspace exports       | Package exports  | DC-PKG-007  |
| Private workspace tools | Package boundary | DC-PKG-008  |
| Versioned package       | npm artifact     | DC-PKG-009  |
| Diff exports            | Package exports  | DC-PKG-010  |
| Validation pipeline     | Repository CI    | DC-PKG-011  |

## DC-PKG-001 — Root styles and themes

**Requirement.** The Root styles and themes family MUST expose shared styles, Storybook styles, theme assets, catalog-layout helpers, and canonical Storybook reference fixtures at their documented subpaths.

### Acceptance details

- Each export, including the canonical Storybook App Shell reference fixture, must resolve to tracked source or the documented workspace build output; the fixture MUST render the same Design Core-owned composition used by the two-expanded-sidebars scenario and expose bounded content extension points, including an optional right-sidebar toggle, so consumer catalogs do not copy shell markup or styling.
- Reusable form families MAY expose focused public subpaths that avoid loading unrelated forms from the barrel.
- Package checks must fail when the mapped entry point is stale or missing.
- Tool-only dependencies, including declarations for test-only DOM fixtures, must remain outside runtime exports and be pinned where reproducibility requires it.

## DC-PKG-002 — Shadcn exports

**Requirement.** The Shadcn exports family MUST resolve each `./shadcn/*` family and the documented token subpaths.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.
- Strict clean consumers must type-check composed Shadcn source exports without relaxing optional-property checks.

## DC-PKG-003 — Forms exports

**Requirement.** The Forms exports family MUST resolve the forms barrel, core API, tokens, styles, and compatibility component subpaths.

### Acceptance details

- DialogFrame, ConfirmDialog, and ConfirmButton MUST expose focused source subpaths verified with strict consumer compiler settings.

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.
- Strict clean consumers must type-check stable and experimental AI source exports without relaxing optional-property or indexed-access checks.

## DC-PKG-004 — AI exports

**Requirement.** The AI exports family MUST resolve stable chat, token, and explicitly experimental entry points without mixing their stability promises.

### Acceptance details

- Opt-in message virtualization MUST declare `@tanstack/svelte-virtual` as a normal runtime dependency and export its consumer-facing position contract through the stable chat entry point without requiring a consumer migration.

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-005 — Filter exports

**Requirement.** The Filter exports family MUST resolve filter chrome, query-language helpers, and the compatibility SearchFilterBar entry point.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- The focused Search Filter Bar source export must carry the runtime and type dependencies needed by a clean strict consumer.
- Composed filter source exports must omit unavailable optional callbacks instead of forwarding explicit `undefined` values.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-006 — Shell exports

**Requirement.** The Shell exports family MUST resolve the App Shell family and shell token entry points.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-007 — Workspace exports

**Requirement.** The Workspace exports family MUST resolve the workspace barrel, tokens, and each documented framework, component, panel, and plugin subpath.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-008 — Private workspace tools

**Requirement.** Design Core MUST NOT include private workspace packages in its root workspace, runtime manifest, release manifest, Storybook host configuration, or public package artifact.

### Acceptance details

- Private documentation or automation packages must live in their own repository or package release boundary.
- Root package checks must fail when the removed private Docs MCP package is reintroduced into release configuration.
- The package artifact must stay focused on Design Core source, styles, docs, and metadata.

## DC-PKG-009 — Versioned package artifact

Prepared CSS follows DC-CSS-008 in both archive profiles. Public import names
remain stable, and referenced fonts ship with their licenses. CSS authoring
dependencies belong to development tooling rather than the installed runtime.

Release inputs retain only changesets not already represented in the published
changelog. Historical workspace integration must not reintroduce consumed
changesets or repeat their version bumps and release notes.

**Requirement.** Design Core MUST be packable as a public versioned source artifact whose manifest uses semver for runtime dependencies, and release automation MUST stop for manual bootstrap until the npm package exists.

The user-approved 2026-10-11 packed-audit exception MAY accept only
low-severity [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7)
for KaTeX `>=0.11.0 <0.18.2` and npm propagation chains terminating solely
in that advisory, across current and subsequent Design Core releases until
upstream math dependencies are patched. Package version changes MUST NOT
expire this advisory-specific acceptance.
The gate MUST reject other advisories, increased severity, changed vulnerable
ranges, unresolved or cyclic chains, invalid responses, inconsistent counts,
and command failures. Complete audit JSON MUST remain under `.release/`,
and accepted exceptions MUST be printed. Remove the exception when upstream
math ranges resolve patched KaTeX. The exception accepts a known remaining
vulnerability; it does not repair or hide it. Clean audits require no exception,
and workspace audits remain unchanged.

### Acceptance details

- Mira must resolve through a published npm semver dependency that admits compatible pre-1.0 patch releases; Bits UI MUST resolve from `^2.19.5` or a compatible range retaining its Scroll Area and text-selection teardown fixes; optional search tooling remains outside the normal validation dependency graph.
- Published development tooling dependencies must use npm semver ranges; pull requests and pushes to `main` must run the complete nonvisual check suite before the full and production-only dependency audits, using GitHub Actions that do not depend on the deprecated Node.js 20 action runtime.
- The tarball must omit repository-only files and tolerate bounded npm registry visibility delay during post-publication verification.
- Package checks must pack source even when its version is already published; registry and local archives must prepare rune modules and declarations, preserve public import names, and pass cold Svelte dependency prebundling plus bound Composer Input handle teardown with declared dependencies and zero Svelte diagnostics; the clean packed production graph must pass its independent audit or the recorded advisory-specific KaTeX exception.

## DC-PKG-010 — Diff exports

**Requirement.** The Diff exports family MUST resolve the Diff barrel and documented token subpaths.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-011 — Parallel validation pipeline

**Requirement.** Pull requests and pushes to `main` MUST fan out the complete nonvisual validation suite into independent blocking lanes before one stable aggregate result.

### Acceptance details

- Governance, quality, unit, static Storybook, Storybook interaction, Workspace pointer, Shell pointer, Shadcn pointer, and AI browser lanes must run independently.
- Cacheable lanes must use the signed Turbo cache contract and publish cache summaries.
- Full and production dependency audits must run after every nonvisual lane succeeds.
- Visual comparison must remain outside the blocking graph, and maintained Node.js 24-compatible actions must be used.
