# Shadcn / Actions and content

Action and content primitives adapt shadcn-svelte semantics to Design Core styling, provenance, and catalog conventions. Historical implementation research lives under `spec/records/`; this chapter remains authoritative.

## Public surface coverage

| Surface      | Public boundary                            | Requirement |
| ------------ | ------------------------------------------ | ----------- |
| Button       | `@lapismd/design-core/shadcn/button`       | DC-SHA-002  |
| Button Group | `@lapismd/design-core/shadcn/button-group` | DC-SHA-003  |
| Swipe Item   | `@lapismd/design-core/shadcn/swipe-item`   | DC-SHA-004  |
| Toggle       | `@lapismd/design-core/shadcn/toggle`       | DC-SHA-005  |
| Toggle Group | `@lapismd/design-core/shadcn/toggle-group` | DC-SHA-006  |
| Code         | `@lapismd/design-core/shadcn/code`         | DC-SHA-007  |
| Code Block   | `@lapismd/design-core/shadcn/code-block`   | DC-SHA-008  |

## DC-SHA-001 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-002 — Button

**Requirement.** The Button family MUST expose semantic actions with documented variants, sizes, loading or disabled states, and consumer content.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/button`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-003 — Button Group

**Requirement.** The Button Group family MUST group related actions with coherent orientation, separators, focus behavior, and accessible labels.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/button-group`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-004 — Swipe Item

**Requirement.** The Swipe Item family MUST support pointer and keyboard-accessible reveal actions without taking ownership of domain mutations.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/swipe-item`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-005 — Toggle

**Requirement.** The Toggle family MUST expose pressed state, controlled updates, disabled behavior, and documented visual variants.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/toggle`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-006 — Toggle Group

**Requirement.** The Toggle Group family MUST coordinate single or multiple pressed values with keyboard navigation and controlled updates.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/toggle-group`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-007 — Code

**Requirement.** The Code family MUST present inline code with semantic typography and token-driven contrast.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/code`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-008 — Code Block

**Requirement.** The Code Block family MUST present multiline code with language-aware content chrome, overflow handling, and copy affordances where configured.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/code-block`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
