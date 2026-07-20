---
id: llms-extraction
title: LLM catalog extraction (deferred)
summary: Why we do not vendor storybook-llms-extractor; optional future source index.
sources:
  - docs/agent/README.md
---

# LLM catalog extraction (deferred)

## Current approach

Agents should use:

1. `pnpm ui guide` / `pnpm ui guide <topic> [--json]` for conventions
2. `pnpm ui components` / `pnpm ui components <layer/id> [--json]` for local
   usage and examples across shadcn (`*.docs.md`), forms (MDX), AI, workspace,
   and apps
3. Storybook MCP when the catalog is running for interactive docs and tests
4. Colocated stories, MDX guidance pages, and `ui:docs` artifacts

The components CLI covers the shadcn-svelte-style **list/get** slice for this
package (adapted local docs with `@stevejuma/ui` / `@stevejuma/workspace`
imports), not only shadcn families. It does **not** replace a full-repo
`llms.txt` dump.

## Why not vendoring storybook-llms-extractor

The [Acring/storybook-llms-extractor](https://github.com/Acring/storybook-llms-extractor)
(Fluent UI fork) is a poor primary fit here:

- React `__docgenInfo` props — weak for Svelte CSF
- Requires `build-storybook` + Playwright Chromium per regenerate
- Writes into `storybook-static/llms/` for deploy/indexers, not a queryable CLI
- Does not encode `ui:add` / visual-baseline conventions

Do **not** vendor it into `packages/`.

## Possible later work

If agents need offline per-component dumps beyond shadcn (forms, apps) without a
running Storybook, prefer a **thin source indexer** over the Playwright build
extractor:

- Walk `*.stories.svelte`, `*.mdx`, and `*.docs.md`
- Emit repo-local `llms.txt` + `docs/llms/*.md`
- Revisit Playwright-against-build extraction only if source indexing is not enough
