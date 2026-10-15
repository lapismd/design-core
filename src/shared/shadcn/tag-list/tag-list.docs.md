# Tag List

Import `{ TagList, type TagListItem, type TagListProps }` from
`@lapismd/design-core/shadcn/tag-list`. A measured prefix stays on one line and
the `+N` popover shows **all** tags, in input order, using the shared ScrollArea.
An empty array reserves no visible space. This is display/action presentation,
not the editable Forms ChipAutocomplete.

Items require stable unique `id` and `label`. Optional fields are `icon` (a Svelte
component), existing Badge `variant`, semantic `tone` (`neutral`, `accent`,
`success`, `warning`, `danger`), `tooltip`, `disabled`, controlled `active` and
`onClick(tag, event)`. Passive tags remain text; actions use buttons. Disabled
buttons use `aria-disabled` and suppress callbacks while retaining keyboard
access to their descriptions. Active buttons expose `aria-pressed` without
changing host state on click. Popup actions dismiss before calling the host.

`size` is `sm` (default), `md` or `lg`; `label` defaults to `Tags`. Native root
attributes and `class` compose with the component. Tooltips include the entire
label and optional description. Passive inline tags enter the tab order only
when they have tooltip content. Escape closes the popup and restores focus;
resizing or data updates recover focus when a control disappears. Intentional
host/outside focus is preserved.

Measurements include the actual indicator for each hidden count, with no fixed
visible count or character limit. If needed the first tag shrinks beside `+N`;
an indicator-only row handles smaller containers. Inert measuring elements do
not expose duplicate controls. Container/item resizing, font loading and item
updates trigger coalesced measurements; unmount releases observers and frames.

## Tokens

Each family import includes native CSS. Override `--ui-tag-list-gap` (0.3rem),
`--ui-tag-list-icon-gap` (0.3rem), `--ui-tag-list-icon-size` (0.8rem),
`--ui-tag-list-label-max-width` (16rem), `--ui-tag-list-radius`,
`--ui-tag-list-font-family` and `--ui-tag-list-font-weight` (550).

Size tokens are `--ui-tag-list-height-sm/md/lg` (1.25/1.5/1.75rem),
`--ui-tag-list-font-size-sm/md/lg` (0.75/0.8125/0.875rem) and
`--ui-tag-list-padding-sm/md/lg` (0.4/0.55/0.65rem).
Colour tokens are `--ui-tag-list-accent/success/warning/danger` and
`--ui-tag-list-active-border`. Popup tokens are `--ui-tag-list-popover-width`
(20rem), `--ui-tag-list-popover-max-height` (20rem) and
`--ui-tag-list-popover-gap` (0.5rem). Explicit host token overrides carry through
the existing overlay portal. No Tailwind tooling is required.

## Provenance

Chip presentation adapts jj-store `64790b2b`,
`web/src/lib/ui/community-chip/CommunityChip.svelte`, `props.ts` and `model.ts`
(Apache-2.0, LapisMD contributors). Those files record their Community ancestry
at `d859f33a484a9238bb11f974f4ead8e9be729ec6`. Only generic presentation is
adapted; application state-to-tone mapping, links, models and consumers stay in
their owning application. The chip renderer is private and composes Design
Core's existing Badge and Button implementations.
