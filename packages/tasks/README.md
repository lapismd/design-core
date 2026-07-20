# `@stevejuma/tasks`

Implementation-ready reference material for a white-label task and list app.
It records observed shell behavior, responsive states, motion contracts,
synthetic fixtures, and a scoped companion theme before UI components exist.

Read [the product spec](./specs/product.md) first. The capture provenance and
sanitisation rules are in [the reference README](./reference/superlist/README.md).

## Storybook surfaces

- **Tasks/Reference Targets** shows synthetic-fixture desktop, tablet, mobile,
  and interaction evidence.
- **Tasks/Implementation Map** gives the build order and reuse breakdown.
- **Tasks/Pages** and **Tasks/Components** are non-product implementation
  placeholders for every planned composition.
- **Tasks/Component Specs** renders the canonical component specs directly in
  Storybook Docs alongside their implementation placeholders.

## Commands

```text
pnpm --dir packages/tasks reference:auth
pnpm --dir packages/tasks reference:bootstrap
pnpm --dir packages/tasks reference:capture
pnpm --dir packages/tasks reference:verify
```

The package deliberately exports planning surfaces, contracts, and tokens—not a
prematurely implemented Tasks UI. Component implementation follows the specs in
a later slice and must use the host package's shadcn-svelte primitives.
