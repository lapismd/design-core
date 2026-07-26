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

`storybook/` is the immutable **v1** inventory. It contains all 52 reviewed
snapshots copied without hash changes from the validated standalone
workspace-shell slice `b06d1e3f58c3`.

`storybook/provenance.json` records the capture contract, complete inventory
hash, and the initial manual mappings. It remains available for provenance and
must never be rewritten.

`storybook-v2/` is the corrected parity authority pending manual approval. It
contains 52 canonical scenes in both light and dark Lapis modes:

- 1280 × 900 CSS viewport and device scale factor 3;
- the target repository's pinned Chromium build;
- frozen time, awaited fonts, two settled animation frames, and successful
  `storyFinished`;
- an explicit viewport or component capture scope for every scene;
- the exact hashed CY F-Mode and Notifications CSS injected only by the
  external capture harness.
- one isolated Chromium process per story and colour mode;
- per-channel median sampling from three same-context screenshots.

`storybook-v2/crosswalk.json` accounts for all 79 CY stories. The 52 v1-backed
stories are canonical visual scenes; the remaining 27 retain interaction-only
coverage. `manifest.json` and `provenance.json` record every asset hash and the
complete inventory hash.

Normal tests are compare-only. The only command allowed to replace v2 is the
explicitly guarded capture:

```bash
CY0004_STORYBOOK_URL=http://127.0.0.1:6006 \
  pnpm workspace:lapis-reference:update
```

The command also verifies that the read-only source workspace remains pinned to
`b06d1e3f58c3`. It never writes v1.

Expected SHA-256 digests:

| File                        | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `workspace-shell-light.png` | `612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e` |
| `workspace-shell-dark.png`  | `7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985` |
| `provenance.json`           | `853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2` |

The v2 inventory SHA-256 is
`1d6acbaa063bb387095624205d87cb8bf7e12b4e11ea29b9581efffb7fbd620e`.
