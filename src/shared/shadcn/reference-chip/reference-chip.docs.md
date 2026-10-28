# Reference Chip

Import `{ ReferenceChip }` from `@lapismd/design-core/shadcn/reference-chip`.

Supply a label, optional icon or AvatarIdentity, and href or onClick. Optional onRemove is a sibling button, preserving native link/button semantics. Disabled controls never navigate or invoke callbacks. Full labels and descriptions remain in keyboard-accessible tooltips; this is an individual reference, not a second TagList.

Use `appearance="mention"` for jj-store's filled, full-size inline author chip.
The sibling removal control shares its background and has a separator. Optional
`preview` supplies host-owned HoverCard content; a preview replaces the tooltip.
The same target retains ordinary link or button semantics and keyboard focus.

## Tokens

The family imports its native CSS. Override --ui-reference-chip-radius (999px), --ui-reference-chip-padding (.12rem .4rem), --ui-reference-chip-font-size (.875em), --ui-reference-chip-max-width (16rem). Colours follow semantic
host tokens and overlays use the existing portal context.

Mention tokens are `--ui-reference-mention-radius` (`calc(var(--radius) - 0.2rem)`),
`--ui-reference-mention-background` (`var(--secondary)`),
`--ui-reference-mention-padding` (`0 0.25em`),
`--ui-reference-mention-font-weight` (`600`) and
`--ui-reference-mention-avatar-size` (`1.25em`).

## Usage

See the colocated ReferenceChip.example-sources.ts for consumer-usable source.
Source attribution is in PROVENANCE.md.
