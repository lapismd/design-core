---
id: workspace
title: Workspace framework
summary: Migrate and extend the reusable workspace controller and shell.
sources:
  - AGENTS.md
  - styles.md
  - src/shared/workspace/PLAN.md
  - src/shared/workspace/REFERENCE.md
---

# Workspace framework

Workspace is a first-class shared layer below `src/shared/workspace`. It owns
the application-independent controller, recursive layout, registered views,
settings, commands, static plugins, and composable shell presentation.

## Read first

1. `src/shared/workspace/PLAN.md` for the current slice and acceptance matrix.
2. `src/shared/workspace/REFERENCE.md` for source revision and immutable
   reference hashes.
3. `styles.md` for native CSS and token rules.
4. `docs/agent/testing.md` before changing components or stories.

## Boundary

- Consumers own resources, routes, filesystems, editors, and persistence
  adapters.
- Workspace owns only serializable application-shell state and presentation.
- Production sources do not import shadcn, forms, filter, apps, or Tailwind
  class infrastructure.
- Use semantic HTML, direct Bits UI primitives, Paneforge, and
  `--ui-workspace-*` tokens.
- Each visual family has a colocated Svelte component, CSS, story, docs, and
  index.

## Validation

Run focused tests while iterating. Before committing a workspace slice run:

```text
pnpm check:no-tailwind
pnpm check
```

For visual slices, also preview and run changed Storybook tests, then use the
compare-only Visual Delta suite. Baseline updates require explicit approval.
