# Workspace / Panels

Workspace panels provide generic domain-neutral views driven by consumer data and actions.

## Public surface coverage

| Surface        | Public boundary                           | Requirement |
| -------------- | ----------------------------------------- | ----------- |
| Explorer Panel | `@lapismd/design-core/workspace/explorer` | DC-WS-033   |
| Problems Panel | `@lapismd/design-core/workspace/problems` | DC-WS-034   |

## DC-WS-033 — Explorer Panel

**Requirement.** The Explorer Panel family MUST compose controlled hierarchical resources, selection, actions, and empty states through generic workspace contracts.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/explorer`, whose tree construction must preserve stable resource identity and declared parent-child ordering.
- File activation MUST pass one semantic disposition to the consumer adapter: single-click requests `current` and MUST keep keyboard focus on the selected row so Enter starts inline rename, double-click requests `reveal-or-new-tab`, and modifier-click or middle-click requests forced `new-tab`.
- The tree MUST retain an accessible label without duplicating the owning leaf title, pressed toolbar actions MUST use the workspace accent foreground, and selected tree rows MUST use the same background wash as row hover.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-WS-034 — Problems Panel

**Requirement.** The Problems Panel family MUST present grouped and tabular diagnostics with severity, location, selection, filtering, and consumer-owned navigation actions.

### Acceptance details

- The public boundary is `@lapismd/design-core/workspace/problems`.
- The owning workspace leaf title and grouped-tree counts MUST present live totals with the shared Badge component, while the right-aligned panel toolbar MUST NOT duplicate its title text or count.
- Severity toggles MUST appear as compact checkbox items in an untitled search-field menu whose semantic icons retain their colours and whose aligned count column remains unclipped, while the separate grouped-to-table action uses the Lucide `table-properties` icon.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
