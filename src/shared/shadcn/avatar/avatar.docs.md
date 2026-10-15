# Avatar

Import `{ Avatar }` from `@lapismd/design-core/shadcn/avatar`. Supply `src` for
an image, `emoji` for a glyph, or `name`/`initials` for fallback text. A failed
image falls back without changing host data. `decorative` removes duplicate
accessible content; otherwise name and optional presence form its label.

Choose `circle` or `rounded`, and `xs`, `sm`, `md`, `lg`, `xl`, `2xl` or `3xl`. Presence accepts
`online`, `away`, `busy` or `offline`. No account or agent identity model is used.

Public tokens: `--ui-avatar-size`, `--ui-avatar-radius`, `--ui-avatar-background`,
`--ui-avatar-foreground`, `--ui-avatar-online` and `--ui-avatar-away`.
