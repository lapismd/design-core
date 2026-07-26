# Lapis workspace-shell reference

These captures are immutable visual evidence for the reusable Workspace
renderer.

- Source application: Lapis workspace
- Source revision: `a371198e495d9e4e465c2960a04b3a4fd11f4023`
- Fixture: every open leaf normalized to the Lapis empty view
- Viewport: 1440 × 960 CSS pixels
- Device scale factor: 1
- Browser: Playwright pinned Chromium

The exact capture metadata is in `provenance.json`. Normal Storybook and Visual
Delta commands must not update these PNGs. Candidate snapshots live separately
under `tests/visual/storybook.spec.ts-snapshots/workspace/`.

## Source Storybook references

`storybook/` contains all 52 reviewed snapshots from the validated standalone
workspace-shell slice `b06d1e3f58c3`. They use the UI catalog's 1280 × 900 CSS
viewport and device scale factor 3, so mapped component stories can be compared
without resampling.

`storybook/provenance.json` records the capture contract, complete inventory
hash, and the first set of explicit target-story mappings. Visual Delta exposes
those mappings through its **Lapis source** mode, which renders the target story
with the `lapis` brand theme. These files are immutable reference evidence and
are never candidate baseline update targets.

Expected SHA-256 digests:

| File                        | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `workspace-shell-light.png` | `612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e` |
| `workspace-shell-dark.png`  | `7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985` |
| `provenance.json`           | `853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2` |
