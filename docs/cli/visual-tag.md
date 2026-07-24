---
name: visual-tag
command: ui visual:tag
summary: Add or clear skip-visual and mutually exclusive visual review tags on stories.
---

## Usage

```text
pnpm ui visual:tag skip --component <name>
pnpm ui visual:tag include --component <name>
pnpm ui visual:tag review --status <pending|ready|approved|failed> --component <name>

pnpm ui visual:tag skip --story-id <id>
pnpm ui visual:tag review --status ready --prefix shadcn-button--
pnpm ui visual:tag --help
pnpm ui visual:tag skip --component button --json
```

Aliases: `pnpm ui visual-tag …`, `pnpm ui:visual:tag …`.

Requires a built Storybook index (`pnpm build-storybook` →
`storybook-static/index.json`) when expanding `--component` or `--prefix`.
Single `--story-id` still needs the index so the CSF file can be resolved.

## Actions

| Action    | Effect                                                                                                          |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| `skip`    | Add `skip-visual` on matching stories (clears review tags)                                                      |
| `include` | Remove `skip-visual`                                                                                            |
| `review`  | Set exactly one of `visual-pending` / `visual-ready` / `visual-approved` / `visual-failed` (mutually exclusive) |

## Target selection

Provide **one** of:

| Flag                 | Resolves to                                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `--story-id <id>`    | That leaf story only                                                                                                         |
| `--component <name>` | Recipe story-title prefix when known (e.g. `button`), otherwise treat as story-id head (`shadcn-button` → `shadcn-button--`) |
| `--prefix <p>`       | All leaf stories whose id starts with the normalized prefix                                                                  |

Refuse `*` / `all` for `--component`. Prefer the Visual Delta panel for
interactive one-off edits; use this CLI for bulk / scripted tag updates.

## Examples

```sh
# Mark every Button story ready for human review
pnpm ui visual:tag review --status ready --component button

# Skip flake on one story
pnpm ui visual:tag skip --story-id shadcn-button--default

# Re-include a previously skipped component
pnpm ui visual:tag include --component button

# Bulk skip by story-id prefix (Apps/Beancount)
pnpm ui visual:tag skip --prefix apps-beancount-
```

## Notes

- Review tags are mutually exclusive: setting `ready` clears `failed` / `pending` / `approved` on that story.
- Cannot set review status while a story is `skip-visual` — `include` first.
- Meta-level `tags` on a whole stories file are outside this patcher; it edits
  per-`<Story>` (or object CSF) tags the same way as the panel middleware.
- After tag churn that changes suite membership, rebuild or let the visual
  build gate refresh `storybook-static` before the next Playwright run.
