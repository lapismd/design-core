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
| Avatar   | `@lapismd/design-core/shadcn/avatar`   | DC-SHA-056  |
| Tag List | `@lapismd/design-core/shadcn/tag-list` | DC-SHA-057  |

| Author Card | `@lapismd/design-core/shadcn/author-card` | DC-SHA-058 |
| Reference Chip | `@lapismd/design-core/shadcn/reference-chip` | DC-SHA-059 |
| Link Preview | `@lapismd/design-core/shadcn/link-preview` | DC-SHA-060 |
| Spoiler | `@lapismd/design-core/shadcn/spoiler` | DC-SHA-061 |
| Relative Time | `@lapismd/design-core/shadcn/relative-time` | DC-SHA-062 |

## DC-SHA-057 — Tag List

**Requirement.** Tag List MUST present ordered, host-owned tags in one compact responsive row, composing existing Badge/Button, Tooltip, Popover and ScrollArea primitives.

### Acceptance details

- Tags MUST retain stable IDs, labels, optional component icons, variants, semantic tones, descriptions, disabled state, controlled active state and host callbacks; passive tags MUST remain text and disabled actions MUST never fire.
- Actual tag, gap and overflow-indicator measurements MUST determine the visible prefix without wrapping or reordering; long labels MUST truncate, the first tag MAY shrink to retain priority, and every tag MUST remain available in the count-labelled overflow popover.
- Keyboard tooltips, activation, dismissal and resize-related focus recovery MUST retain full labels and descriptions; the viewport-bounded popover MUST use the shared ScrollArea and inherited overlay portal context.
- Native CSS and documented tokens MUST preserve compact chip styling across sizes and themes; observers, font listeners and scheduled measurements MUST be released on disposal, and inert measuring content MUST stay out of accessibility and tab order.

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
- An alert with a leading SVG MUST align its title in the second grid column without group marker classes.
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
- Optional icon-library compatibility attributes MUST be omitted when unavailable so strict consumers do not receive explicit `undefined` values.

## DC-SHA-056 — Avatar

**Requirement.** Avatar MUST present host-owned images, emoji or initials with optional presence and circle or rounded shapes. Initials on an opaque three- or six-digit hex background MUST choose black or white with at least 4.5:1 contrast unless the host supplies `--ui-avatar-foreground`; other backgrounds retain theme foreground semantics.

### Acceptance details

- The public family MUST provide named and decorative image presentations with image-failure fallback and token-driven sizing, including larger `2xl` and `3xl` presentations for editable profile avatars; decorative images retain `role="img"` and `aria-hidden="true"` so their initials are not mistaken for a surrounding control's visible text label.
- Presence MUST remain available through an accessible label rather than color alone.
- AvatarGroup MUST default to 32px avatars and preserve supplied identity order, overlapping circle or rounded shapes, full accessible names and optional host-selected overflow limits, with hovered or focused participants raised above their neighbours.
- Groups MUST support every Avatar size, size overflow indicators consistently and accept optional custom member content for shared AuthorCard triggers without nested buttons or tooltips.

## DC-SHA-058 — Author Card

**Requirement.** AuthorCard MUST present host-owned identity details and actions through shared accessible hover or popover surfaces.

Mention trigger names retain visible fallback initials before the author name,
matching visible text order when avatar images are unavailable.

### Acceptance details

- Avatar and mention triggers MUST retain supplied labels, shape, presence, details and disabled actions without resolving profiles or executing application routes.
- Popover dismissal MUST restore trigger focus and viewport-bounded content MUST use shared ScrollArea with inherited semantic tokens.
- Compact trigger sizing MUST NOT shrink the identity avatar inside the author details surface; accessible trigger names MUST include visible initials or emoji fallbacks alongside the supplied author label.

- The participant story MUST retain the unchanged name `About Alex Morgan, AM` for `Alex Morgan` with its visible `AM` fallback, including after switching custom participant rendering.

## DC-SHA-059 — Reference Chip

**Requirement.** ReferenceChip MUST compose compact icon or avatar references with Badge presentation and host-owned navigation or actions.

### Acceptance details

- Full labels and descriptions MUST remain available through accessible tooltips while long inline labels truncate without changing supplied text.
- Optional removal MUST be a separate labelled button and disabled references MUST never navigate or invoke callbacks.

## DC-SHA-060 — Link Preview

**Requirement.** LinkPreview MUST present supplied link data in inline, compact and rich layouts without fetching metadata.

### Acceptance details

- Unsafe protocols MUST remain noninteractive while safe links retain their destination, accessible name and keyboard focus.
- Labels, descriptions, optional media and semantic tokens MUST support narrow containers without application-specific URL classification.

## DC-SHA-061 — Spoiler

**Requirement.** Spoiler MUST provide keyboard-accessible controlled conceal and reveal presentation for inline noninteractive content.

### Acceptance details

- Concealed content MUST be hidden from assistive technology and revealed content MUST retain its original text.
- The optional Chat spoilerExtension MUST compose safe post-parse Mira rendering for inline delimiters while leaving code and captured source text intact.
- Particle presentation MUST respect reduced motion and clean up animation frames, observers and listeners on teardown.

## DC-SHA-062 — Relative Time

**Requirement.** RelativeTime MUST present valid dates with relative text and an exact localized date tooltip using an optional supplied clock.

### Acceptance details

- Invalid dates MUST retain a readable fallback and never throw during rendering.
- Live updates MUST stop on disposal while supplied clocks, locale and absolute-date thresholds remain deterministic.
- Interactive accessible names MUST contain the visible date text together with the exact date or host-supplied context label.
