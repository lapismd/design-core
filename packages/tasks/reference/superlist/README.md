# Superlist reference capture

This folder holds versioned Superlist observation artifacts for Tasks Visual
Delta overlays. Screenshots are committed and regenerated from the dedicated
**Tasks UI Reference** fixture list.

## Two visual systems

| Surface | Path | Purpose |
| ------- | ---- | ------- |
| Superlist Visual Delta | `/tasks-reference/2026-07-20/screenshots/{pages,components}/` | Design reference overlays (desktop **1280×900 @3x**) |
| Playwright baselines | `/visual-baselines/tasks/…` | CI regression of *our* Tasks stories (separate) |

## Capture matrix

[`capture-matrix.json`](./capture-matrix.json) maps every `Tasks/Components/*` and
`Tasks/Pages/*` story id to a capture job:

- **Pages** (`kind: "page"`) — full viewport
- **Components** (`kind: "component"`) — **subject clip only** (required `clip`;
  rejected if the clip covers ≥90% of the viewport unless `allowFullViewport`)

## Commands

```bash
pnpm --dir packages/tasks reference:bootstrap     # fixture list (once)
pnpm --dir packages/tasks reference:migrate:delta # bootstrap PNGs from prior browser/ shots
pnpm --dir packages/tasks reference:ingest:delta  # land Chrome MCP staging PNGs @ DSF 3
pnpm --dir packages/tasks reference:capture:delta # optional Playwright live re-capture
pnpm --dir packages/tasks reference:verify
```

## Primary: Chrome MCP playbook

Use **`user-chrome-devtools`** against your normal logged-in Chrome. Do **not**
redact or overlay placeholders — capture the viewport exactly as shown.

1. Prefer a focused Superlist tab (close Cursor sidebars / other overlays if
   Flutter clicks seem ignored).
2. `list_pages` / `new_page` → `https://app.superlist.com/` (already signed in).
3. Enable Flutter accessibility:
   `document.querySelector('flt-semantics-placeholder')?.click()`
4. `emulate` viewport **`1280x900x3`** — same CSS size and DSF as Playwright
   visual baselines (`VISUAL_VIEWPORT` / `VISUAL_DEVICE_SCALE_FACTOR`).
   Page PNGs are therefore **3840×2700** max for desktop.
5. Follow matrix `nav` steps. For task detail, open the fixture list, hover the
   row, then click the **Open task details** arrow (right edge of the row) until
   the URL contains `/tasks/<uuid>` and Due date / Assignee / Priority show.
6. `take_screenshot` with `filePath` under **`os.tmpdir()/tasks-live-chrome/<id>.png`**
   only (workspace paths are denied by the MCP server).
7. Ingest into the committed tree:

```bash
pnpm --dir packages/tasks reference:ingest:delta -- \
  --dir="$TMPDIR/tasks-live-chrome" \
  --ids=page-desktop-task-detail-open,comp-detail-open \
  --from-page=page-desktop-task-detail-open
```

- **Pages:** staging `<id>.png` is resized to viewport × DSF 3.
- **Components:** cropped from `--from-page` (or a staged clip PNG) using the
  matrix `clip`, then sized to clip × DSF 3.
8. `pnpm --dir packages/tasks reference:verify`

## Optional: Playwright headed capture

`reference:auth` / `reference:capture:delta` / `reference:debug:delta` remain for
scripted re-runs, but headed Chromium is often unusable for login/click. Prefer
Chrome MCP for live Superlist observation.
