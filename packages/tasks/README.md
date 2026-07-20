# `@stevejuma/tasks`

Implementation-ready reference material for a white-label task and list app.
It records observed shell behavior, responsive states, motion contracts,
synthetic fixtures, and a scoped companion theme before UI components exist.

Read [the product spec](./specs/product.md) first. The capture provenance and
sanitisation rules are in [the reference README](./reference/superlist/README.md).

## Commands

```text
pnpm --dir packages/tasks reference:auth
pnpm --dir packages/tasks reference:bootstrap
pnpm --dir packages/tasks reference:capture
pnpm --dir packages/tasks reference:verify
```

The package deliberately exports contracts and tokens, not a prematurely
implemented Tasks UI. Component implementation follows the specs in a later
slice and must use the host package's shadcn-svelte primitives.
