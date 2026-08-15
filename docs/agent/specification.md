---
id: specification
title: Canonical specification and search
summary: Spec-first authority, authoring, validation, and QMD discovery.
sources:
  - AGENTS.md
  - spec/src/index.md
  - spec/src/spec-governance.md
  - spec/src/verification.md
---

# Canonical specification and search

`spec/src` is the source of truth for Design Core public behavior. Generated
mdBook pages, QMD indexes, Storybook mirrors, Docs MCP documents, README prose,
and migration trackers are discovery or progress surfaces, not authorities.

## Before changing a protected surface

1. Search with `pnpm spec:search -- "<topic or DC-ID>"`.
2. Open the returned canonical Markdown file at the reported line.
3. Find the path owner in `spec/src/spec-governance.md#change-map`.
4. Update the requirement before or with the implementation.
5. Update its single row in `spec/src/verification.md`.
6. Run `pnpm spec:check` and the focused source checks.

Use `--semantic` only for conceptual discovery because it downloads and runs
the pinned embedding models. Lexical search refreshes the local index on every
query. JSON output is available with `--json`, and `--limit N` bounds results.
QMD is only a discovery cache; always read the canonical source it returns.

If QMD, a native binary, its configuration, or a model fails, use the exact
`rg` fallback printed by the wrapper. A Node ABI mismatch requires reinstalling
or rebuilding QMD under the active Node version.

## Requirement shape

- Use a unique `DC-<AREA>-NNN` heading.
- Write one normative statement with `MUST`, `MUST NOT`, `SHOULD`,
  `SHOULD NOT`, or `MAY`.
- Keep it within 80 prose words and four sentences.
- Add two to four atomic acceptance bullets.
- Map the public surface exactly once and add one verification row.

The stable validator diagnostics include an error code, governing rule, path,
line, affected identifier when available, and a corrective message.

## Commands

```text
pnpm spec:validate
pnpm spec:build
pnpm spec:first [-- --base <rev> --head <rev>]
pnpm spec:index [-- --semantic]
pnpm spec:search -- [--semantic] [--limit N] [--json] "<query or DC-ID>"
pnpm spec:check
pnpm spec:serve
```
