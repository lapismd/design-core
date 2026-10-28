# Avatar image request lifetime

Status: source repair qualified; not released.

The shared hosted History stories exposed `derived_inert` during teardown.
The diagnostic was reproduced in the owning Avatar family: dirty parent identity
state is destroyed while an outstanding image failure is delivered. Its handler
read the current `src` prop after that owner had closed. A second case proves
that an old request cannot select fallback for a replacement image.

Avatar now keys the image by source and reads the failed source from the event's
own image element. It never consults live parent identity in that callback.
Public props, fallback semantics and presentation remain unchanged.

Exact command:

```sh
pnpm exec vitest run --project storybook src/shared/shadcn/avatar/Avatar.stories.svelte -t 'Late|Replacement'
```

Before: two failed cases, including one retained fatal runtime diagnostic.
After: two passed cases, zero errors. The run uses Svelte 5.56.6 and Vitest
4.1.11; no warning guard or accessibility rule was changed.

An earlier aggregate stopped on an incorrectly combined acceptance bullet;
that authoring failure is repaired by the atomic DC-SHA-063 contract. The nonvisual aggregate completed governance, formatting/types, 859 unit cases,
16 release/style script cases, 899 Storybook interactions with accessibility,
static Storybook, 16 Workspace pointer cases, 11 Shell pointer cases, three AI
browser cases and 146 Shadcn Chromium cases (one existing skip). Seven WebKit
cases could not launch because Playwright's WebKit binary was absent. After
`pnpm exec playwright install webkit`, the exact missing project passed all
seven via `pnpm test:shadcn:pointer --project=webkit`.

The packed source intake uses `scripts/pack-local.mjs` with prepared browser CSS.
The History source consumer passed all 11 shared Repository scenarios with
accessibility and fatal runtime diagnostics enabled. Broader plugin and Desktop
intake remain owned by their migration records. Visual approval and publication
remain separate; no snapshots, warning guards or runtime checks were weakened.
