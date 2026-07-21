# Superlist reference capture

This folder holds versioned Superlist observation artifacts for Tasks Visual
Delta overlays. Screenshots are committed and regenerated from the dedicated
**Tasks UI Reference** fixture list.

## Two visual systems

| Surface | Path | Purpose |
| ------- | ---- | ------- |
| Superlist Visual Delta | `/tasks-reference/2026-07-20/screenshots/{pages,components}/` | Design reference overlays (DSF **3**) |
| Playwright baselines | `/visual-baselines/tasks/…` | CI regression of *our* Tasks stories (separate) |

## Capture matrix

[`capture-matrix.json`](./capture-matrix.json) maps every `Tasks/Components/*` and
`Tasks/Pages/*` story id to a capture job:

- **Pages** (`kind: "page"`) — full viewport
- **Components** (`kind: "component"`) — **subject clip only** (required `clip`;
  rejected if the clip covers ≥90% of the viewport unless `allowFullViewport`)

## Commands

```bash
pnpm --dir packages/tasks reference:auth          # once, interactive login
pnpm --dir packages/tasks reference:bootstrap     # fixture list
pnpm --dir packages/tasks reference:migrate:delta # bootstrap PNGs from prior browser/ shots
pnpm --dir packages/tasks reference:capture:delta # live Superlist re-capture @ DSF 3
pnpm --dir packages/tasks reference:verify
```

Live capture writes hi-DPI PNGs, applies avatar/banner placeholder overlays, and
updates `2026-07-20/manifest.json` checksums.

## Chrome MCP playbook (optional)

Use when auth/UI needs a human; day-to-day re-runs prefer `reference:capture:delta`.

1. `list_pages` / navigate to `https://app.superlist.com/` (logged in).
2. Enable Flutter accessibility (`flt-semantics-placeholder` → Enable accessibility).
3. For each matrix entry: `resize_page` to the entry viewport CSS size.
4. Follow `nav` steps (Inbox / Today / … / open fixture task).
5. Inject placeholders for avatar + banner regions (or capture then redact).
6. **Pages:** full-window screenshot → `screenshots/pages/<id>.png`.
7. **Components:** crop to the subject bbox / matrix `clip` — never the full shell —
   → `screenshots/components/<id>.png`.
8. Chrome MCP may only write under the process temp root; copy into
   `packages/tasks/reference/superlist/2026-07-20/` afterward.
9. Re-run `reference:verify` (or re-run migrate checksums via `reference:migrate:delta`
   only when bootstrapping from `screenshots/browser/`).

Device scale: prefer **3** (match shadcn). Prefer the Playwright harness for
correct DSF.

## Placeholders

Before live screenshots, the harness overlays neutral blocks for:

- account avatar
- top banner / promo chrome

Flutter canvas content may still need matrix-driven rect redaction
(`scripts/reference/redact-image.swift`) when overlays miss painted pixels.
