# Workspace / Panels

Workspace panels provide generic domain-neutral views driven by consumer data and actions.

## Public surface coverage

| Surface            | Public boundary                           | Requirement |
| ------------------ | ----------------------------------------- | ----------- |
| Explorer Panel     | `@lapismd/design-core/workspace/explorer` | DC-WS-033   |
| Explorer icons     | `@lapismd/design-core/workspace/explorer` | DC-WS-051   |
| Explorer hidden    | `@lapismd/design-core/workspace/explorer` | DC-WS-052   |
| Problems Panel     | `@lapismd/design-core/workspace/problems` | DC-WS-034   |
| Problems copy      | `@lapismd/design-core/workspace/problems` | DC-WS-046   |
| Problems opener    | `@lapismd/design-core/workspace/problems` | DC-WS-047   |
| Problems quick fix | `@lapismd/design-core/workspace/problems` | DC-WS-050   |

## DC-WS-033 — Explorer Panel

**Requirement.** The Explorer Panel family MUST compose controlled hierarchical resources, selection, actions, and empty states through generic workspace contracts.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/explorer`; tree construction MUST preserve stable resource identity and ordering, while overflow MUST stay in a bounded Scroll Area viewport whose inherited visibility follows App Shell Appearance settings and whose overlay remains flush to the Explorer edge above a competing resize rail while visible.
- File activation MUST pass one semantic disposition to the consumer adapter: single-click requests `current` and MUST keep keyboard focus on the selected row so Enter starts inline rename, double-click requests `reveal-or-new-tab`, and modifier-click or middle-click requests forced `new-tab`.
- The tree MUST retain an accessible label without duplicating the leaf title; pressed toolbar actions MUST use the workspace accent foreground; selected rows MUST match the hover wash without heavier type; indent guides MUST align beneath expanded chevrons; and auto-reveal MUST flash only for external active-file changes.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-051 — Explorer same-depth type icons

**Requirement.** Explorer rows at the same depth MUST reserve a disclosure column so sibling folder and file type icons share one start edge.

### Acceptance details

- File rows MUST render a non-interactive disclosure spacer whose size matches the folder chevron.
- Nested indent guides MUST remain aligned under expanded disclosure chevron tips.
- The catalog MUST assert same-depth folder and file type icons share one start edge.

## DC-WS-052 — Explorer hidden files

**Requirement.** The Explorer Panel MUST hide tree nodes whose names start with a dot unless the consumer show-hidden preference is on.

### Acceptance details

- The preferences adapter MUST expose get and set for show hidden files and default the preference off.
- Refresh MUST prune dot-named nodes at any depth when the preference is off and keep them when it is on.
- The toolbar MUST offer a pressed Show hidden files control that persists through the adapter.
- Unit tests and the catalog MUST cover default-hidden and revealed dotted names.

## DC-WS-034 — Problems Panel

**Requirement.** The Problems Panel family MUST present grouped and tabular diagnostics with severity, location, selection, filtering, and consumer-owned navigation actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/problems`.
- The owning workspace leaf title and grouped-tree counts MUST present live totals with the shared Badge component, while the right-aligned panel toolbar MUST NOT duplicate its title text or count.
- Severity toggles MUST appear as compact checkbox items in an untitled search-field menu whose semantic icons retain their colours and whose aligned count column remains unclipped, while the separate grouped-to-table action uses the Lucide `table-properties` icon.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-046 — Problems copy

**Requirement.** Problems tree and table context menus MUST expose Copy Message and Copy Problem. Copy Problem MUST serialize the selected diagnostics as a JSON array. Tree group rows MUST copy every grouped problem.

### Acceptance details

- Copy Message MUST copy the diagnostic message, or every grouped message joined by newlines.
- Copy Problem MUST copy a JSON array of serializable objects with resource, owner, code, numeric severity, message, source, and one-based range fields when present.
- Tree group rows MUST offer the same two copy actions for all grouped entries.
- Unit tests MUST cover item and group copy payloads.

## DC-WS-047 — Problems opener

**Requirement.** The Problems presentation plugin MUST NOT seed a leaf when the shell becomes ready. Show Problems and the Problems status item MUST be the only creators, revealing an existing leaf or opening the default bottom tab. Registering the view MUST upgrade leftover missing-view placeholders, and ViewHost MUST NOT show missing-view once the type is registered. The status item MUST show the circle-alert icon and live diagnostics total and MUST call `showProblems()` on select.

### Acceptance details

- Starting the shell with no persisted Problems leaf MUST leave `getLeavesOfType` empty.
- The command and status item MUST reveal an existing leaf wherever it lives, including an empty missing-view placeholder that registration upgrades to `workspace:problems`, or create one closable bottom tab.
- The right-aligned status item MUST show the live total; count changes MUST NOT open the dock.
- ViewHost MUST NOT show missing-view once the type is registered; unit tests MUST cover no-seed start, command create, placeholder upgrade, and status click versus count-change.

## DC-WS-050 — Problems row quick fix

**Requirement.** Problems tree and table rows MUST use the severity-icon slot as the quick-fix control when the collection contributed actions. Hover or focus MUST show a Lucide lightbulb in that slot. Click MUST open the portaled workspace menu of those actions. Row activation MUST still navigate, and the Copy-first context menu MUST remain.

### Acceptance details

- The lightbulb MUST be absent when `buildItemMenu` adds no entries.
- The open menu MUST portal outside the Problems view without clipping to that container.
- Click MUST not navigate the row.
- Unit tests and the bottom-panel story MUST cover presence, absence, menu titles, and outside-panel paint.
