# Filter Builder

A standalone structured condition editor inspired by Bases. It has no table,
query-language or application dependency. See Shadcn/Guidance for shared control
conventions and the canonical Structured filters specification for the contract.

```tsx
<script lang="ts">
  import {
    FilterBuilder, createFilterState, type FilterField,
  } from "@lapismd/design-core/shadcn/filter-builder";
  import "@lapismd/design-core/styles.css";
  const fields: FilterField[] = [
    { id: "name", label: "Name", type: "text", allowTypeOverride: true },
    { id: "amount", label: "Amount", type: "number" },
    { id: "active", label: "Active", type: "boolean" },
  ];
  let filter = $state(createFilterState());
</script>
<FilterBuilder {fields} value={filter} onValueChange={(next) => { filter = next; }} />
```

The same component and helpers are re-exported from
`@lapismd/design-core/filter`. That entry point calls the new type union
`StructuredFilterType`, preserving its existing query-language `FilterType` enum.
The focused Shadcn entry point names the union `FilterType`.

## Controlled state and fields

`value` contains an All/Any/None root and permitted field-type overrides.
Conditions and groups have stable IDs. Fields have stable IDs, labels and types:
text, number, boolean, date, datetime or enum. Enum fields require supplied
`options: { value, label }[]`. `allowTypeOverride` defaults to false. Fields may
supply custom operator descriptors and a controlled `ValueEditor`; data matching
and custom operator execution stay with the standalone host.

Valid changes emit immediately. Pristine new blank rows impose no constraint.
Invalid edits retain the last applied value with an accessible error and draft
status. Replace `value` to discard drafts externally. Clear filters removes all
conditions and user overrides. `disabled` disables the editing controls.

The component can render directly in a page or inside the existing Popover
controls. It imposes no outer overlay, persistent storage or data evaluator.

## Tokens

| Token                            | Default                      | Purpose                          |
| -------------------------------- | ---------------------------- | -------------------------------- |
| `--ui-filter-builder-background` | `var(--popover)`             | Panel background                 |
| `--ui-filter-builder-border`     | `var(--border)`              | Segmented rows and nested groups |
| `--ui-filter-builder-radius`     | `var(--radius)`              | Row and group corners            |
| `--ui-filter-builder-gap`        | `0.5rem`                     | Condition spacing                |
| `--ui-filter-builder-width`      | `clamp(22rem, 45svw, 48rem)` | Suggested popover width          |

Controls inherit the normal Input, Button, Select, Checkbox and focus tokens.
Canvas Table bounds the popover to the viewport and uses the suggested width.
Stories remain visual-pending. This slice is awaiting UI approval; full repository
and packed-consumer qualification are intentionally deferred.
