# Shadcn / Data and feedback

Data and feedback primitives communicate state without taking ownership of consumer data or application workflows.

## Public surface coverage

| Surface  | Public boundary                        | Requirement |
| -------- | -------------------------------------- | ----------- |
| Badge    | `@lapismd/design-core/shadcn/badge`    | DC-SHA-010  |
| Table    | `@lapismd/design-core/shadcn/table`    | DC-SHA-011  |
| Alert    | `@lapismd/design-core/shadcn/alert`    | DC-SHA-012  |
| Empty    | `@lapismd/design-core/shadcn/empty`    | DC-SHA-013  |
| Progress | `@lapismd/design-core/shadcn/progress` | DC-SHA-014  |
| Skeleton | `@lapismd/design-core/shadcn/skeleton` | DC-SHA-015  |
| Spinner  | `@lapismd/design-core/shadcn/spinner`  | DC-SHA-016  |

## DC-SHA-009 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-010 — Badge

**Requirement.** The Badge family MUST present compact status or category metadata with documented variants.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/badge`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-011 — Table

**Requirement.** The Table family MUST compose semantic tabular structure with responsive overflow and consumer-owned data.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/table`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-012 — Alert

**Requirement.** The Alert family MUST announce contextual feedback with semantic title, description, and visual variants.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/alert`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-013 — Empty

**Requirement.** The Empty family MUST compose empty-state media, title, description, and actions in a readable layout.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/empty`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-014 — Progress

**Requirement.** The Progress family MUST represent bounded progress with accessible value semantics and controlled state.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/progress`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-015 — Skeleton

**Requirement.** The Skeleton family MUST provide non-interactive loading placeholders without obscuring accessible status text.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/skeleton`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-016 — Spinner

**Requirement.** The Spinner family MUST provide an accessible busy indicator whose size and color follow current context.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/spinner`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The indicator MUST rotate continuously unless the user prefers reduced motion.
