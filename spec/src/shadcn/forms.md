# Shadcn / Forms

Shadcn form controls provide the low-level accessible inputs used directly or inside Design Core form composition.

## Public surface coverage

| Surface     | Public boundary                           | Requirement |
| ----------- | ----------------------------------------- | ----------- |
| Checkbox    | `@lapismd/design-core/shadcn/checkbox`    | DC-SHA-024  |
| Command     | `@lapismd/design-core/shadcn/command`     | DC-SHA-025  |
| Field       | `@lapismd/design-core/shadcn/field`       | DC-SHA-026  |
| Input       | `@lapismd/design-core/shadcn/input`       | DC-SHA-027  |
| Input Group | `@lapismd/design-core/shadcn/input-group` | DC-SHA-028  |
| Label       | `@lapismd/design-core/shadcn/label`       | DC-SHA-029  |
| Select      | `@lapismd/design-core/shadcn/select`      | DC-SHA-030  |
| Slider      | `@lapismd/design-core/shadcn/slider`      | DC-SHA-031  |
| Switch      | `@lapismd/design-core/shadcn/switch`      | DC-SHA-032  |
| Textarea    | `@lapismd/design-core/shadcn/textarea`    | DC-SHA-033  |

## DC-SHA-023 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-024 — Checkbox

**Requirement.** The Checkbox family MUST expose checked, unchecked, indeterminate, invalid, and disabled states through an accessible control.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/checkbox`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-025 — Command

**Requirement.** The Command family MUST compose searchable command lists with keyboard navigation, grouping, empty state, and selection.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/command`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-026 — Field

**Requirement.** The Field family MUST associate labels, descriptions, controls, groups, legends, and errors through semantic form relationships.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/field`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-027 — Input

**Requirement.** The Input family MUST provide a token-driven native input contract with invalid, disabled, and focus-visible states.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/input`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-028 — Input Group

**Requirement.** The Input Group family MUST compose inputs with semantic prefixes, suffixes, text, and actions without duplicating focus chrome.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/input-group`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-029 — Label

**Requirement.** The Label family MUST associate concise accessible text with a form control and preserve disabled context.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/label`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-030 — Select

**Requirement.** The Select family MUST compose accessible selection triggers, content, groups, items, scrolling, and controlled values.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/select`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-031 — Slider

**Requirement.** The Slider family MUST expose bounded numeric selection with keyboard, pointer, orientation, and controlled-value behavior.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/slider`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-032 — Switch

**Requirement.** The Switch family MUST expose an accessible binary control with controlled checked, focus, and disabled states.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/switch`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-033 — Textarea

**Requirement.** The Textarea family MUST provide a token-driven multiline input with resize, invalid, disabled, and focus-visible states.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/textarea`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
