# Shadcn / Overlays

Overlay primitives preserve accessible labelling, focus management, dismissal, placement, and controlled open state.

## Public surface coverage

| Surface       | Public boundary                             | Requirement |
| ------------- | ------------------------------------------- | ----------- |
| Alert Dialog  | `@lapismd/design-core/shadcn/alert-dialog`  | DC-SHA-042  |
| Context Menu  | `@lapismd/design-core/shadcn/context-menu`  | DC-SHA-043  |
| Dialog        | `@lapismd/design-core/shadcn/dialog`        | DC-SHA-044  |
| Drawer        | `@lapismd/design-core/shadcn/drawer`        | DC-SHA-045  |
| Dropdown Menu | `@lapismd/design-core/shadcn/dropdown-menu` | DC-SHA-046  |
| Hover Card    | `@lapismd/design-core/shadcn/hover-card`    | DC-SHA-047  |
| Popover       | `@lapismd/design-core/shadcn/popover`       | DC-SHA-048  |
| Sheet         | `@lapismd/design-core/shadcn/sheet`         | DC-SHA-049  |
| Tooltip       | `@lapismd/design-core/shadcn/tooltip`       | DC-SHA-050  |

## DC-SHA-041 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-042 — Alert Dialog

**Requirement.** The Alert Dialog family MUST present a modal confirmation flow with labelled content, focus containment, cancel, and action controls.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/alert-dialog`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-043 — Context Menu

**Requirement.** The Context Menu family MUST present pointer and keyboard contextual actions with nested, checked, radio, and disabled items.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/context-menu`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-044 — Dialog

**Requirement.** The Dialog family MUST compose modal or non-modal labelled content with controlled open state and focus management.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/dialog`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-045 — Drawer

**Requirement.** The Drawer family MUST compose edge-anchored dialog content with controlled state, drag behavior, and semantic sections.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/drawer`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-046 — Dropdown Menu

**Requirement.** The Dropdown Menu family MUST present keyboard-accessible actions, groups, nested items, checks, radios, and shortcuts.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/dropdown-menu`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-047 — Hover Card

**Requirement.** The Hover Card family MUST show supplementary non-modal content from hover or focus without replacing the trigger semantics.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/hover-card`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-048 — Popover

**Requirement.** The Popover family MUST anchor controlled non-modal content to a trigger with focus and collision behavior.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/popover`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-049 — Sheet

**Requirement.** The Sheet family MUST compose edge-positioned dialog content with controlled state and accessible labelled regions.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/sheet`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-050 — Tooltip

**Requirement.** The Tooltip family MUST provide concise supplementary text on hover or focus with configurable timing.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/tooltip`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
