---
name: components
command: ui components
summary: List or show local component docs across shadcn, forms, AI, workspace, and apps.
---

## Usage

```text
pnpm ui components
pnpm ui components <name>
pnpm ui components <layer/id>
pnpm ui components --layer forms
pnpm ui components <name> --json
pnpm ui:components <name>
```

## Behavior

Inventories every package surface:

| Layer | Source |
| --- | --- |
| `shadcn` | `*.docs.md` + `*.example-sources.ts` |
| `forms` | colocated `*.mdx` (+ variation story templates) |
| `ai` | stories (+ AI overview) |
| `workspace-shell` | stories |
| `apps` | app stories under `src/apps/*` |
| `workspace` | `@stevejuma/workspace` component stories |

Keys are `layer/id` (e.g. `shadcn/button`, `forms/form-field`). Bare ids work
when unique; ambiguous names require the qualified key.

Shadcn families without `*.docs.md`: run `pnpm ui:docs --component <name>` first.
`ui:docs` remains the sync command — this command only reads local artifacts.

## Options

- `--layer <layer>` — filter list/show to one layer
- `--json` — JSON envelope for agents (`{ ok, command, data }`)
- `--color <when>` — `always` | `never` | `auto` (default `auto`)
- `-h` / `--help` — show this help

## Examples

```sh
pnpm ui components
pnpm ui components --layer forms
pnpm ui components button
pnpm ui components forms/form-field
pnpm ui components workspace/workspace-shell --json
```
