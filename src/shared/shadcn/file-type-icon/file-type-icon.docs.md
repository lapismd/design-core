# File Type Icon

Import `{ FileTypeIcon }` from `@lapismd/design-core/shadcn/file-type-icon`.
Pass `path` as a filename or full POSIX/Windows path. Matching uses the basename,
ignores case, prefers special filenames and then the longest extension. Unknown
or empty names use the Material generic file icon; missing SVG uses Lucide FileText.

Omit `title` beside a filename for a decorative icon. Supply `title` for a named
image. Native span attributes pass through; accessibility and semantic markers
are owned by the component. No network or filesystem access occurs.

| Variable                             | Default                   | Purpose                              |
| ------------------------------------ | ------------------------- | ------------------------------------ |
| `--ui-file-type-icon-size`           | Selected preset           | Explicit override of both dimensions |
| `--ui-file-type-icon-size-xs`        | `0.75rem`                 | XS (12px)                            |
| `--ui-file-type-icon-size-s`         | `0.875rem`                | S (14px)                             |
| `--ui-file-type-icon-size-md`        | `1rem`                    | Default MD (16px)                    |
| `--ui-file-type-icon-size-lg`        | `1.5rem`                  | LG (24px)                            |
| `--ui-file-type-icon-fallback-color` | `var(--muted-foreground)` | Missing-SVG fallback                 |

Material colours are retained. File Listing uses the same component at 14px.
The colocated MDX includes rendered variations, usage, API and composition.

The `size` prop selects `xs`, `s`, `md` (default) or `lg`; an explicit CSS size
variable takes precedence. The curated set retains 113 artworks for developer
and personal-vault files, including PDF/EPUB, office, media, archives and diagrams.
Less-common tools share category icons. The full catalogue is development-only.
`pnpm icons:generate` refreshes assets and `pnpm icons:check` verifies them.
