# `@stevejuma/ui`

Private Svelte 5 UI package with Storybook catalog, Storybook Vitest, and local
Playwright visual regression.

## Layout

```text
src/
  lib/utils.ts
  styles.css, theme.css, storybook.css
  shared/
    shadcn/<family>/     # registry filenames + colocated stories
    forms/<family>/      # kebab-case families + colocated stories
    forms/core/          # builders, types, registry (non-visual)
  apps/
    cv/                  # reserved for CV domain UI
    beancount/           # reserved for beancount domain UI
tests/
  visual/                # Playwright visual suite + committed snapshots
```

## Imports

| Path                            | Purpose                            |
| ------------------------------- | ---------------------------------- |
| `@stevejuma/ui/shadcn/<family>` | shadcn family barrel               |
| `@stevejuma/ui/forms`           | forms barrel                       |
| `@stevejuma/ui/forms/core`      | form builders / types / registry   |
| `@stevejuma/ui/apps/cv`         | CV app barrel (placeholder)        |
| `@stevejuma/ui/apps/beancount`  | Beancount app barrel (placeholder) |
| `@stevejuma/ui/styles.css`      | package styles entry               |

Story titles stay `Shadcn/...` and `UI Forms/...` (stable story ids for visual
baselines). App stories use `Apps/CV/...` and `Apps/Beancount/...`.

## Dependency rules

- `shared/shadcn` must not import forms or apps.
- `shared/forms` may import shadcn; must not import apps.
- `apps/*` may import shared; must not import sibling apps.
- App components take props/callbacks — no app routers or workspace context.

## Commands

```text
pnpm storybook              # UI + story tests in Storybook (no visual update)
pnpm storybook:ui           # UI only
pnpm storybook:check        # story tests + build + visual compare
pnpm test:unit              # node unit
pnpm test:storybook         # headless story Vitest once
pnpm test:storybook:watch   # story Vitest watch
pnpm test:visual            # screenshot compare (never writes baselines)
pnpm test:visual:update --component <name>  # guarded baseline update
pnpm test:visual:report     # open Playwright HTML report
pnpm ui:doctor              # generator environment checks
pnpm ui:inspect <name>      # fetch/parse upstream without writing
pnpm ui:add <name> [--overwrite] [--dry-run]
pnpm checks                 # fmt + svelte-check + unit + storybook + build + visual
```

Visual baselines are under `tests/visual/storybook.spec.ts-snapshots/`.
`test:visual` never writes snapshots. Update existing baselines only with
`VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --component <name>`.
Install Chromium once with `pnpm exec playwright install chromium`.

### Native CSS generator

`pnpm ui:add` runs the transactional converter in a detached git worktree:
intake via pinned `shadcn-svelte`, Tailwind CLI expansion, scoped native CSS,
reference/candidate parity, then one binary patch. Failures leave the real
worktree unchanged. v1 supports `button` (`--overwrite` to convert the existing
family).

## Story tags

- `skip-test` — exclude from Storybook Vitest (document reason)
- `skip-visual` — exclude from Playwright visual suite (document reason)
