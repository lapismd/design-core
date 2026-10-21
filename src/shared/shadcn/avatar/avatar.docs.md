# Avatar

Import `{ Avatar }` from `@lapismd/design-core/shadcn/avatar`. Supply `src` for
an image, `emoji` for a glyph, or `name`/`initials` for fallback text. A failed
image falls back without changing host data. `decorative` removes duplicate
accessible content; otherwise name and optional presence form its label.

Choose `circle` or `rounded`, and `xs`, `sm`, `md`, `lg`, `xl`, `2xl` or `3xl`. Presence accepts
`online`, `away`, `busy` or `offline`. No account or agent identity model is used.

Public tokens: `--ui-avatar-size`, `--ui-avatar-radius`, `--ui-avatar-background`,
`--ui-avatar-foreground`, `--ui-avatar-online` and `--ui-avatar-away`.

Solid three- or six-digit hex `background` values automatically select readable
black or white initials. `--ui-avatar-foreground` takes precedence. Other CSS
background values retain the theme foreground; supply that token when needed.

## Avatar groups

`AvatarGroup` composes ordered `AvatarIdentity` records (`id`, `name`, optional
Avatar display props). `max` optionally collapses the suffix behind a named
count tooltip. Size follows Avatar and defaults to md (32px); `--ui-avatar-group-overlap` defaults to
.5rem and `--ui-avatar-group-overflow-size` follows the selected avatar size.

Supported group sizes are `xs` (20px), `sm` (24px), `md` (32px), `lg` (48px),
`xl` (80px), `2xl` (128px) and `3xl` (160px). The overflow count uses the same
size. See **Participant group sizes** in the Avatar catalog for a comparison.

Compose the group beside a labelled reply or navigation button. Participant
buttons retain their names and tooltips while the separate reply button owns
navigation. Transcript reply indicators use this composition at `xs`.

Hovered members rise above their neighbours; keyboard focus keeps the focused
member visible too. Reply-link decoration stays on the separate count label.

Supply the optional `avatar(person, size)` snippet to replace each member's name
tooltip with shared AuthorCard presentation. The snippet owns its accessible
trigger, so the group does not add a second button or tooltip. Omitting it keeps
the default member tooltips. **Author card participants** demonstrates both states.
