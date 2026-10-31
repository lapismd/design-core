# Column canvas fit measures visible overflow first

Date: 2026-10-29  
Revision: enclosing Jujutsu change

## Scope

Agent UI hosted Branches content-fit stayed at the default width (`380`) even
when a truncated bookmark label reported `scrollWidth > clientWidth`. The
structured fit walk used a 4096-node budget and could return before visiting
deep truncated labels inside branch cards.

## Change

`measureColumnContentWidth` now:

1. Scans visible descendants for `scrollWidth > clientWidth + 1` and keeps the
   maximum overflow width.
2. Raises the structured walk budget to 65536.
3. Returns the max of the structured walk and the overflow scan.

## Validation

```shell
pnpm exec vitest run src/shared/shadcn/column-canvas --project unit
```

Focused column-canvas unit/stories remain the owning Design Core lane; Agent UI
browser growth assertion is separately tolerated until consumers take this
release.

## Contract

`DC-SHA-036` fit/reset behavior unchanged; measurement completeness only.
