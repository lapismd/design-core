# Shadcn / Forms

Shadcn form controls provide the low-level accessible inputs used directly or inside Design Core form composition.

## Public surface coverage

| Surface              | Public boundary                            | Requirement |
| -------------------- | ------------------------------------------ | ----------- |
| Radio Group          | `@lapismd/design-core/shadcn/radio-group`  | DC-SHA-065  |
| Checkbox             | `@lapismd/design-core/shadcn/checkbox`     | DC-SHA-024  |
| Command              | `@lapismd/design-core/shadcn/command`      | DC-SHA-025  |
| Command View         | `@lapismd/design-core/shadcn/command-view` | DC-SHA-051  |
| Command View filters | `@lapismd/design-core/shadcn/command-view` | DC-SHA-052  |
| Emoji Picker         | `@lapismd/design-core/shadcn/emoji-picker` | DC-SHA-054  |
| Field                | `@lapismd/design-core/shadcn/field`        | DC-SHA-026  |
| Input                | `@lapismd/design-core/shadcn/input`        | DC-SHA-027  |
| Input Group          | `@lapismd/design-core/shadcn/input-group`  | DC-SHA-028  |
| Label                | `@lapismd/design-core/shadcn/label`        | DC-SHA-029  |
| Select               | `@lapismd/design-core/shadcn/select`       | DC-SHA-030  |
| Slider               | `@lapismd/design-core/shadcn/slider`       | DC-SHA-031  |
| Switch               | `@lapismd/design-core/shadcn/switch`       | DC-SHA-032  |
| Textarea             | `@lapismd/design-core/shadcn/textarea`     | DC-SHA-033  |

## DC-SHA-023 — Shared Shadcn invariants

**Requirement.** Shadcn families MUST retain upstream semantic composition while using Design Core tokens, provenance metadata, and accessible focus behavior.

### Acceptance details

- Multipart primitives must remain importable as one family.
- Owned source must preserve `data-slot` and Design Core provenance metadata where generated.

## DC-SHA-054 — Emoji Picker

Catalog selection awaits the expected emoji button while the lazy grid loads;
the search input can mount before selectable results are available.
Keyboard acceptance verifies initial search focus before dispatching navigation
without an extra pointer click, then retains the immediate option-focus
assertion. Completion checks that the captured input leaves the document and
that focus returns to the trigger.

**Requirement.** Emoji Picker MUST provide host-neutral full and restricted emoji selection through the shared Popover or an inline panel, with native CSS and lazy-loaded Emoji Mart data.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/emoji-picker`; existing AI experimental imports and the explicit searchable `emojis` list remain compatible, including an empty list.
- Full selection MUST support Unicode search, categories and skin tones, suggested reactions and custom emoji identified by ordinary IDs, shortcodes and image URLs; selection reports the string and optional custom record without owning persistence.
- The controlled picker MUST support disabled state, trigger composition and explicit light/dark/automatic theme, constrain its popup to available space, and preserve keyboard focus and reopening behavior; inline presentation MUST reuse the same selection/custom-emoji panel without another trigger or popover, loading the full library only when that panel mounts.
- Full library/data imports MUST occur only when needed; disposal or superseded loading MUST release the picker and observers without stealing focus or mounting stale content, while failed downloads MUST explain refresh recovery and allow dismissal without reloading the host or losing its drafts.

## DC-SHA-024 — Checkbox

**Requirement.** The Checkbox family MUST expose checked, unchecked, indeterminate, invalid, and disabled states through an accessible control.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/checkbox`.
- Checkbox disabled context MUST follow the owning semantic Field slot without a group marker.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-025 — Command

**Requirement.** The Command family MUST compose searchable command lists with keyboard navigation, grouping, empty state, selection, and a fixed viewport-contained dialog variant.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/command`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- The dialog variant must retain modal positioning when Command semantic identity replaces Dialog identity.
- Optional portal and group content must remain omitted, rather than passed as `undefined`, for exact-optional source consumers.

## DC-SHA-051 — Command View

**Requirement.** The Command View family MUST provide a host-agnostic searchable list with composable input start icon, item icon, label, description, and shortcut parts. Overflowing lists MUST use the public ScrollArea viewport and accept an explicit host scroll strategy. The family MUST NOT own dialog, popover, or other overlay chrome.

Root forwards Command filter and value props. It does not expose a separate
bits-ui command API bindable.

List, Group and Item MUST honor their existing HTML `role` and custom `child`
attributes while retaining filtering, refs and keyboard selection. Hosts with
interactive controls inside results use grid/rowgroup/row/gridcell semantics
and declare `aria-haspopup="grid"` on Input. Default results retain listbox and
option semantics; custom-child hosts own the corresponding native markup.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/command-view`, and an empty filtered result MUST remain a disabled option so the listbox retains its required child semantics.
- Input MUST expose a replaceable `start` snippet, MUST NOT bake a Lucide icon into the public contract, and MUST NOT paint a box border around the search field.
- Item rows MUST compose icon, label, optional description, and shortcut parts without a default check icon, and the icon MUST stay vertically centered on the label row.
- Overflowing lists MUST scroll through `@lapismd/design-core/shadcn/scroll-area`, and the catalog MUST demonstrate inline, Dialog, and Popover hosts.

## DC-SHA-052 — Command View filters and footer

**Requirement.** The Command View family MUST expose optional Filters and Footer parts that hosts MAY compose under the input and after the list. Root MUST NOT own tab state or overlay chrome.

### Acceptance details

- The public boundary remains `@lapismd/design-core/shadcn/command-view`.
- Filters MUST render a tablist of host-supplied tabs, MAY render a host start snippet before each tab label, and Footer MUST render host-supplied hint content.
- Icon pickers and settings comboboxes MUST remain valid without Filters or Footer.
- The catalog MUST demonstrate Filters and Footer without a second runtime contract.

## DC-SHA-026 — Field

**Requirement.** The Field family MUST associate labels, descriptions, controls, groups, legends, and errors through semantic form relationships.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/field`.
- Labels MUST reflect `data-disabled="true"` on their semantic Field ancestor without group classes.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-027 — Input

**Requirement.** The Input family MUST provide a token-driven native input contract with invalid, disabled, and focus-visible states. Focus-visible MUST render a single ring without a second focus-colored border.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/input`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-028 — Input Group

**Requirement.** The Input Group family MUST compose inputs with semantic prefixes, suffixes, text, and actions without duplicating focus chrome.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/input-group`.
- Block-aligned Addon sections MUST support `data-divided="true"` with a token-colored divider and matching inset.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.
- Actions MUST forward the requested Button size, default to `xs`, and retain square geometry for `icon-xs` and `icon-sm`.

## DC-SHA-029 — Label

**Requirement.** The Label family MUST associate concise accessible text with a form control and preserve disabled context.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/label`.
- Disabled groups use `data-disabled="true"`; preceding disabled native controls MUST style their label without a peer class.
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
- Thumb fill MUST use `--ui-slider-thumb-background` with a `#ffffff` fallback so consumers without `--color-white` still paint an opaque handle.

## DC-SHA-032 — Switch

**Requirement.** The Switch family MUST expose an accessible binary control with controlled checked, focus, and disabled states.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/switch`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-033 — Textarea

**Requirement.** The Textarea family MUST provide a token-driven multiline input with resize, invalid, disabled, and focus-visible states. Focus-visible MUST render a single ring without a second focus-colored border.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/textarea`.
- The catalog MUST demonstrate the family’s supported states without introducing a second runtime contract.

## DC-SHA-065 — Radio Group

**Requirement.** Radio Group MUST provide controlled single-choice selection through the public shadcn family, retaining native CSS, upstream keyboard behavior and semantic theme tokens.

### Acceptance details

- The public boundary is `@lapismd/design-core/shadcn/radio-group`, with Root and Item composed together.
- Selection, disabled and invalid states MUST remain accessible through pointer, focus and arrow-key navigation in light and dark themes.
- Generated parts, token metadata and provenance MUST use the owning conversion pipeline; focused catalog examples MUST show public consumer imports.
