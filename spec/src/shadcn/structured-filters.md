# Shadcn / Structured filters

This chapter is the complete contract for the standalone structured Filter Builder
and its optional Canvas Table consumer. Bases supplies UI research only. No
lapis-plugins source changes, raw expressions, SQL, CodeMirror, App, vault access,
persistence, publication or consumer migration are included.

## Public surface coverage

| Surface                     | Public boundary                              | Requirement |
| --------------------------- | -------------------------------------------- | ----------- |
| Filter Builder              | `@lapismd/design-core/shadcn/filter-builder` | DC-SHA-069  |
| Controlled filter drafts    | Filter Builder                               | DC-SHA-070  |
| Typed conditions            | Filter Builder                               | DC-SHA-071  |
| Canvas Table filtering      | `@lapismd/design-core/shadcn/canvas-table`   | DC-SHA-072  |
| Column type inference       | Canvas Table                                 | DC-SHA-073  |
| Lifecycle and qualification | Structured filter families                   | DC-SHA-074  |

## DC-SHA-069 — Standalone Filter Builder

**Requirement.** FilterBuilder MUST provide host-neutral structured filter editing independently of Canvas Table.

### Acceptance details

- The Shadcn family MUST export FilterBuilder, field/operator/value/node/state types and state helpers, with the Filter entry point re-exporting the same implementation.
- Nested All, Any and None groups MUST support searchable field selection, segmented field/operator/value rows with continuous full-width wrapped dividers and no predicate end border, adding and removing conditions and groups, and Clear filters.
- Host field descriptors MUST supply stable IDs, labels, types, optional choices and optional custom operators/value editors without importing application contracts.
- The family MUST compose existing Shadcn primitives and native CSS with documented `--ui-filter-builder-*` tokens, without importing Forms, Filter, Canvas Table, raw-query parsers or application APIs.

## DC-SHA-070 — Controlled drafts

**Requirement.** FilterBuilder MUST distinguish incomplete presentation drafts from the host-controlled valid applied configuration.

### Acceptance details

- The public value MUST contain a stable-ID condition tree and permitted field-type overrides, and valid changes MUST emit immediately through onValueChange without Apply or Cancel buttons.
- Invalid nonblank edits MUST retain the last applied value, show an accessible inline explanation and keep the correction controls usable.
- Pristine new blank conditions and empty groups MUST impose no constraint, and the initial Add Filter action MUST preserve the first visible row and append another.
- External value replacement MUST replace drafts, while closing the table popover MUST discard unapplied drafts and preserve applied changes.

## DC-SHA-071 — Typed condition controls

**Requirement.** Structured conditions MUST use type-appropriate editors, operators and literal values.

### Acceptance details

- Text, number, boolean, date, datetime and enum fields MUST provide appropriate controls, including multiple-value text operations, with zero and false accepted as valid values.
- Field/operator/group/type controls MUST have explicit accessible purpose names, and operator names MUST identify their field independently of the selected label.
- Fields that allow type overrides MUST offer Auto and supported types, while explicit table column types MUST remain fixed and override inference.
- Field or type changes MUST normalize incompatible operators and retain invalid drafts until corrected, without emitting partially valid configurations.

## DC-SHA-072 — Canvas Table filter integration

**Requirement.** CanvasTable MUST optionally compose FilterBuilder through controlled filtering configuration and apply it to provided in-memory cells.

### Acceptance details

- One Filter rows icon in the fixed top toolbar MUST expose an opaque popover with a 48rem desktop default capped to the viewport, active-condition count and clear action, and opening MUST commit cell editing first.
- Matching IDs MUST intersect host visibleRowIds in host order, exclude the fixed header, retain source row numbers and preserve hidden checkbox selections.
- Header select-all MUST cover all matching filtered body rows including offscreen rows, and committed edits MUST update matches with safe cell and checkbox focus recovery.
- Generic cell matching MUST remain in the Canvas Table family, with stable host column IDs supporting reordered columns and existing sort/resize/scroll alignment remaining unchanged.

## DC-SHA-073 — Conservative column type inference

**Requirement.** CanvasTable MUST export and internally use one bounded, conservative column-type inference helper.

### Acceptance details

- inferCanvasTableColumnTypes MUST inspect at most sampleSize source body rows, defaulting to 100, excluding the fixed header and ignoring blank or missing cells without scanning further to fill sparse samples.
- Only consistently typed nonblank samples MUST infer finite decimal numbers, case-insensitive true/false booleans, valid ISO dates or zoned ISO datetimes; mixed, ambiguous, empty and leading-zero identifier samples MUST remain text.
- Detection MUST use unfiltered source data, cache by column identity and refresh key, and preserve manual overrides and active modes across ordinary edits, sorting and filtering.
- Enum choices MUST require explicit metadata, and unsampled invalid typed cells MUST never coerce to zero, false or a guessed date.

## DC-SHA-074 — Structured filter lifecycle and qualification

**Requirement.** Structured filter implementations MUST preserve bounded resources, modular files and explicit staged verification.

### Acceptance details

- Every new handwritten JS, TS and Svelte file, including stories and tests, MUST remain at or below 300 physical lines, enforced by a focused automated audit.
- Nested popup portals MUST remain above the filter panel and canvas headers, with keyboard dismissal, focus return, independent instances and unmount cleanup verified in a cold browser run.
- Before UI approval, work MUST run only specification, formatting, focused type, unit, story and browser checks, while full suites, static catalog build and packed-consumer qualification remain deferred at the user's explicit request.
- Durable evidence MUST distinguish specified, implemented, focused-tested, UI-approved and fully-qualified states, with exact commands, failure counts and resume instructions; stories MUST remain visual-pending without screenshot comparison or baseline updates.

## Public interfaces

FilterBuilder accepts readonly `fields`, controlled `value: StructuredFilterState`,
`onValueChange`, optional disabled state and an accessible label. The state is
`{ root: FilterGroup, types: Record<string, FilterType> }`. Groups contain `id`,
`kind: group`, `match: all | any | none` and children. Conditions contain `id`,
`kind: condition`, `field`, `operator` and a literal value. Values are strings,
finite numbers, booleans or string arrays; no raw/custom expression node exists.
`createFilterState()` creates an empty All root. IDs are presentation identity,
not row identity or persistent storage keys.

A field has `id`, `label`, `type`, optional `allowTypeOverride`, options,
custom operator descriptors and a `ValueEditor` component. Override controls are
absent unless allowed. Operator descriptors contain `id`, `label`, value arity
(none, single or multiple), and optional validation. A custom value editor
receives controlled value, field, operator, disabled and onValueChange props.
The builder validates structure but never evaluates host data.

CanvasTable adds optional `filtering: { value, onValueChange, columns?,
sampleSize?, inferenceKey? }`. A column descriptor supplies stable `id`, zero-based
`column`, optional label, `type` (auto by default) and enum options. Without
metadata, IDs are `column:N` and labels use the fixed header or column letter;
duplicate header labels gain a column-letter suffix. Hosts that move columns
must move their stable-ID index mappings with cells. Metadata types override
detection and lock the type chooser; auto fields allow saved user overrides.
Inference cache refreshes when inferenceKey changes or a new column ID appears,
and the first nonempty dataset can replace an initially empty sample. Cached
types survive ordinary row edits, sorts and visibility changes. Resetting an
override selects the cached Auto type. Hosts may call the pure inference helper
and supply explicit metadata to control detection themselves.

## Operator and matching semantics

Text supports equals, not-equals, contains, starts-with, ends-with, their
negations, contains-any/all and their negations, plus is-empty/is-not-empty.
Numbers support equality and ordered comparisons plus empty checks. Dates and
datetimes use the same comparison IDs with on/before/after labels. Booleans use
is/is-not and empty checks. Enums use is/is-not and empty checks with supplied
choices. Custom operators are available to standalone hosts; the table adapter
exposes the built-in catalog only.

All children match for All; at least one matches for Any; none matches for None.
Empty groups impose no constraint rather than matching no rows. Text matching
is literal and case-insensitive; regex and formula evaluation are excluded.
Whitespace-only cells are empty. Numeric parsing accepts signed decimal and
exponent forms, rejects nonfinite and partial parses, and inference preserves
multi-digit leading-zero identifiers. Dates require real calendar YYYY-MM-DD
values; datetimes require ISO date/time with an explicit Z or numeric zone.
The datetime-local editor emits a normalized zoned ISO instant. Typed invalid
cells fail comparisons, including negative comparisons, but still support empty
checks. Filtering does not mutate cells or infer enum choices.

The builder retains pristine blank row IDs locally. New empty rows do not emit
invalid configuration. Editing an applied value into an incomplete value retains
the last applied whole configuration, with a visible Changes not applied message.
Incoming external state replaces the draft; unresolved fields/operators remain
editable with errors. Table input with an invalid externally supplied applied
configuration produces no matching body rows rather than applying a different
column or coercing a value. Removing/reordering columns cannot silently rebind a
stable field ID to another column. Clearing yields an empty All root and clears
user type overrides. Opening or closing popovers never changes checkbox selection.

## Implementation and verification matrix

Specification is committed before runtime. The first UI slice implements the
standalone editor, typed inference, real table filtering, stories and focused
tests. User UI approval is a separate gate before broad qualification.

| Boundary                 | Focused proof before UI approval                                     | Full qualification after approval          |
| ------------------------ | -------------------------------------------------------------------- | ------------------------------------------ |
| Pure model/drafts        | New family units; external replacement; group normalization          | Full units                                 |
| Typed controls/inference | Type controls, overrides, 100-row bound, mixed/ISO/zero/false cases  | Strict package and all consumers           |
| Standalone UI            | Standalone stories with no table import; interaction and axe         | Full story interaction/accessibility       |
| Table matching/selection | Real results, external visibility, sorts, edits, offscreen selection | All affected browser suites                |
| Portals and lifecycle    | Cold focused browser, keyboard, hit-testing, focus, teardown         | Full cold browser lanes                    |
| Ownership/modularity     | Focused file-length/import audit, native CSS                         | Full governance and package audits         |
| Public exports           | Focused strict source consumer                                       | Packed isolated standalone and table smoke |
| Documentation            | Formatter, spec:first and spec:check                                 | Full pnpm checks and static Storybook      |

No deferred lane may be described as passed. Full qualification requires the
recorded UI approval and final exact-command evidence; screenshot comparison and
baseline updates stay outside scope throughout.

## UI review implementation boundary

The first UI implementation exports the FilterType union from the focused Shadcn boundary and aliases it as StructuredFilterType through Filter, preserving Filter's existing FilterType enum. FilterBuilder itself renders no outer overlay; Canvas Table supplies Popover and the Filter rows trigger. The concrete token defaults and copy-pasteable source examples are colocated with both families. Verification remains In progress until UI approval and subsequent full qualification.
