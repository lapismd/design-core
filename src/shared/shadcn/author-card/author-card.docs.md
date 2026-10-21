# Author Card

Import `{ AuthorCard }` from `@lapismd/design-core/shadcn/author-card`.

Host-owned display identity, description, handle, role, details snippet and labelled actions. Use `interaction="popover"` for click/touch or `hover` for previews; trigger accepts avatar or mention. `open` is bindable. Disabled actions never invoke callbacks. Profile resolution and navigation remain host-owned.

## Tokens

The family imports its native CSS. Override --ui-author-card-width (15rem), --ui-author-card-radius (.85rem), --ui-author-card-padding (.625rem), and --ui-author-card-avatar-size (2.25rem for the default md trigger). Colours follow semantic
host tokens and overlays use the existing portal context.

## Usage

See the colocated AuthorCard.example-sources.ts for consumer-usable source.
Source attribution is in PROVENANCE.md.

`--ui-author-card-avatar-size` sizes the default trigger's avatar. It does not
shrink the larger identity avatar in the details card. AvatarGroup can compose
AuthorCard through its optional `avatar(person, size)` snippet.
