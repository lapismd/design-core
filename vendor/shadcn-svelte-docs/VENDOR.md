# Vendored shadcn-svelte docs sources

Sparse pin of authored docs content and runnable example SFCs from
[huntabyte/shadcn-svelte](https://github.com/huntabyte/shadcn-svelte).

| | |
| --- | --- |
| Upstream | `https://github.com/huntabyte/shadcn-svelte` |
| Pin | See [`PIN.json`](./PIN.json) (`ref` + `commit`) |
| License | MIT (same as upstream repo) |

## Included paths

- `content/components/*.md` — from `docs/content/components/`
- `examples/*.svelte` — top-level files from `docs/src/lib/registry/examples/`  
  (nested `examples/create/` is **not** vendored)
- `blocks/` — full tree from `docs/src/lib/registry/blocks/`  
  (includes nested dirs such as `sidebar-07/`)
- `static/img/` — from `docs/static/img/` (served in Storybook as `/img/…`)

These are the sources the upstream docs site wires via
`<ComponentPreview name="…">` → `examples/<name>.svelte` (and block demos under
`blocks/`). Published `shadcn-svelte.com/docs/components/*.md` LLM pages are a
post-build dump and are **not** the source of truth for `pnpm ui:docs`.

## Refresh

```bash
pnpm ui docs:vendor --ref shadcn-svelte@1.4.2
# or an explicit commit:
pnpm ui docs:vendor --ref bf4f461d88526359d0e96e1950f637912bbeebe7
```

Refresh is explicit; `pnpm ui:docs` only reads this tree.
