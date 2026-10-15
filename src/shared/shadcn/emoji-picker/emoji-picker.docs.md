# Emoji Picker

Import `{ EmojiPicker }` from `@lapismd/design-core/shadcn/emoji-picker`.
This project-authored family composes the existing Button and Popover. It is
not a registry conversion. The old AI experimental import re-exports the same
component, `EmojiOption`, and `DEFAULT_EMOJIS` suggestions.

Omit `emojis` for the full Emoji Mart Unicode catalog, search, categories and
skin tones. The library and bundled dataset load only when that picker opens;
there is no remote emoji-data request. Supply `emojis` to restrict selection to
an exact searchable list; `[]` deliberately offers no choices. `presetsOnly`
with `presets` provides a small reaction chooser without loading Emoji Mart.

`open` is bindable. `disabled` blocks opening and closes the popup. `trigger`
replaces the trigger's decorative content; `triggerLabel` supplies its name.
`ref`, native attributes and `class` refer to the popup's panel. Opening focuses
search; closing restores the trigger. A delayed library import never moves
focus away from a preset or another control. Failed ES-module downloads are
cached by browsers: loading failures explain refresh recovery and offer Close,
without reloading the application or risking its drafts.
The full picker is a non-modal popover so its shadow-DOM search and keyboard
navigation own focus. Escape closes it and restores the trigger; the restricted
light-DOM grid retains the Popover focus trap.

`customEmojis` accepts `{ id, shortcode, url, label? }` records. `onSelect`
receives the Unicode string or custom shortcode as its first argument and the
unchanged custom record as its optional second argument. Hosts own asset URLs,
identity, reactions and storage. No account, repository or protocol is required.

`theme` accepts `light`, `dark` or `auto` (OS default). Applications with an
explicit theme should pass their resolved light/dark value. Font and interaction
tokens inherit from Design Core; no Tailwind tooling or AI stylesheet is needed.

| Token                                | Default                            |
| ------------------------------------ | ---------------------------------- |
| `--ui-emoji-picker-width`            | `28rem`, capped to available width |
| `--ui-emoji-picker-restricted-width` | `18rem`, capped to available width |
| `--ui-emoji-picker-height`           | `27rem`, capped to viewport height |
| `--ui-emoji-picker-emoji-size`       | `1.125rem` for restricted choices  |
| `--ui-emoji-picker-font-size`        | `0.875rem`                         |
| `--ui-emoji-picker-hover`            | foreground mixed with transparency |

## Examples

### Full

### Restricted

### Custom

### Presets

Use `presentation="inline"` to embed the same panel in an existing editor. The
panel has no trigger or popup and stays visible after selection. The full library
still loads on panel mount; an AvatarPicker can mount it only on its Emoji tab.
Restricted lists and custom emoji records work in both presentations.
