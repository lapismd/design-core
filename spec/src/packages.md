# Package exports

The root package manifest defines the supported import boundaries. Family barrels may expose compound parts, controllers, tokens, and types.

## Public surface coverage

| Surface                | Public boundary   | Requirement |
| ---------------------- | ----------------- | ----------- |
| Root styles and themes | Package exports   | DC-PKG-001  |
| Shadcn exports         | Package exports   | DC-PKG-002  |
| Forms exports          | Package exports   | DC-PKG-003  |
| AI exports             | Package exports   | DC-PKG-004  |
| Filter exports         | Package exports   | DC-PKG-005  |
| Shell exports          | Package exports   | DC-PKG-006  |
| Workspace exports      | Package exports   | DC-PKG-007  |
| Docs MCP package       | Workspace package | DC-PKG-008  |

## DC-PKG-001 — Root styles and themes

**Requirement.** The Root styles and themes family MUST expose shared styles, Storybook styles, theme assets, and catalog-layout helpers at their documented subpaths.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.
- Tool-only dependencies must remain outside runtime exports and be pinned where reproducibility requires it.

## DC-PKG-002 — Shadcn exports

**Requirement.** The Shadcn exports family MUST resolve each `./shadcn/*` family and the documented token subpaths.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-003 — Forms exports

**Requirement.** The Forms exports family MUST resolve the forms barrel, core API, tokens, styles, and compatibility component subpaths.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-004 — AI exports

**Requirement.** The AI exports family MUST resolve stable chat, token, and explicitly experimental entry points without mixing their stability promises.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.

## DC-PKG-005 — Filter exports

**Requirement.** The Filter exports family MUST resolve filter chrome, query-language helpers, and the compatibility SearchFilterBar entry point.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
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

## DC-PKG-008 — Docs MCP package

**Requirement.** The Docs MCP package family MUST expose the private Storybook Docs MCP package only as workspace tooling rather than a Design Core runtime export.

### Acceptance details

- The export must resolve to tracked source or the documented workspace build output.
- Package checks must fail when the mapped entry point is stale or missing.
