# Forms / Review

Review families expose proposed changes and decisions while consumers retain authoritative application state.

## Public surface coverage

| Surface              | Public boundary              | Requirement |
| -------------------- | ---------------------------- | ----------- |
| Form Review          | `@lapismd/design-core/forms` | DC-FORM-037 |
| Field Review Actions | `@lapismd/design-core/forms` | DC-FORM-038 |
| Unified Review Diff  | `@lapismd/design-core/forms` | DC-FORM-039 |

## DC-FORM-036 — Shared Forms invariants

**Requirement.** Forms families MUST preserve accessible labelling, controlled value ownership, exact update types, token-driven focus and invalid states, and consumer-composable layout.

### Acceptance details

- Display-only defaults must remain absent from authoritative values until the consumer edits the field.
- Array and disclosure metadata must remain outside consumer values unless explicitly part of the configured schema.

## DC-FORM-037 — Form Review

**Requirement.** The Form Review family MUST coordinate field-level proposed values, issues, and accept or reject actions without applying domain persistence.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-038 — Field Review Actions

**Requirement.** The Field Review Actions family MUST present accessible keep, accept, undo, or reject actions for a reviewed field state.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-FORM-039 — Unified Review Diff

**Requirement.** The Unified Review Diff family MUST present line-oriented proposed changes with accessible hunk actions and controlled decisions.

### Acceptance details

- The public boundary is `@lapismd/design-core/forms`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
