# Filter

Filter contracts separate query language, reusable search chrome, and consumer query execution.

## Public surface coverage

| Surface                  | Public boundary                            | Requirement   |
| ------------------------ | ------------------------------------------ | ------------- |
| Shared Filter invariants | Filter layer                               | DC-FILTER-001 |
| Filter query language    | `@lapismd/design-core/filter/filter-query` | DC-FILTER-002 |
| Search Filter Bar        | `@lapismd/design-core/filter`              | DC-FILTER-003 |
| Power Search             | Storybook composition                      | DC-FILTER-004 |
| Filter Guidance          | Documentation surface                      | DC-FILTER-005 |

## DC-FILTER-001 — Shared Filter invariants

**Requirement.** The Shared Filter invariants family MUST keep query parsing, filter presentation, and consumer-owned execution separate while preserving accessible keyboard behavior.

### Acceptance details

- The public boundary is Filter layer.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FILTER-002 — Filter query language

**Requirement.** The Filter query language family MUST parse, serialize, inspect, and edit the documented filter expression grammar without executing application queries.

### Acceptance details

- The public boundary is `@lapismd/design-core/filter/filter-query`.
- Slash-delimited hierarchical tags MUST remain one parsed value and one complete Search Filter Bar predicate chip.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FILTER-003 — Search Filter Bar

**Requirement.** The Search Filter Bar family MUST compose text search, structured filters, commands, and controlled query changes in an accessible search surface.

### Acceptance details

- The public boundary is `@lapismd/design-core/filter`.
- Search surfaces with small enumerated facets beneath the query MUST use forms `FilterCommandPicker` selectors by default; parallel button sets are reserved for true mode or action switching.
- Expandable search-syntax guidance MUST use a Lucide disclosure icon whose orientation reflects the native disclosure state.
- The catalog MUST prove filter-query completion tooltips portal into the owner document, escape search-surface clipping, remain hit-testable above adjacent content, use a compact 18rem viewport-bounded default width, and wrap labels and details inside each row.

## DC-FILTER-004 — Power Search

**Requirement.** The Power Search family MUST demonstrate advanced shared filter syntax and interaction through public filter contracts.

### Acceptance details

- The public boundary is Storybook composition.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FILTER-005 — Filter Guidance

**Requirement.** The Filter Guidance family MUST explain when to use plain search, structured filters, command pickers, and the query-language helpers.

### Acceptance details

- The public boundary is Documentation surface.
- Guidance MUST route compact search-panel facets to forms `FilterCommandPicker` and explain the exception for true mode or action controls.
- Guidance MUST identify `filterSyntax` as the governed disclosure pattern for search-language help.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
