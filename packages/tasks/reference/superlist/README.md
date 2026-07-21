# Superlist reference capture

This folder holds versioned observation artifacts for the Tasks implementation
contract. Screenshots under `screenshots/browser/` are committed browser
captures of the dedicated **Tasks UI Reference** fixture list (not a product
export). Do not add unrelated personal tasks or private list content.

## Capture shape

- Desktop: 1680×1000
- Tablet landscape: 1024×768
- Tablet portrait: 768×1024
- Mobile: 390×844
- Device scale factor: 1 for legible diffs and manageable source control size

Each dated capture includes a manifest with sha256 checksums, screenshots, and
motion keyframes. Raw WebM and Playwright trace output remain in the ignored
`.reference-artifacts/` directory.

## Two visual systems

| Surface | Path | Purpose |
| ------- | ---- | ------- |
| Reference overlays | `/tasks-reference/2026-07-20/screenshots/browser/` | Full-page Superlist captures for Visual Delta on Reference Targets / page stories |
| Component baselines | `/visual-baselines/tasks/components/…` | Playwright `toHaveScreenshot` clips of story subjects (shadcn-style) |

Update component baselines only with explicit approval:

```bash
VISUAL_UPDATE_APPROVED=1 pnpm test:visual:update --story-id tasks-components-… --allow-dirty
```

## Motion evidence

Motion captures record a JSON contract plus deterministic keyframes/contact
sheets. The harness uses CDP touch trajectories for swipes, ordinary click and
double-click inputs, and native pointer drags.

`reference:verify` checks every committed checksum and accepts either a
redacted evidence frame or an explicitly fixture-only frame.
