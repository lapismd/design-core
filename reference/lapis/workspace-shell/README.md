# Lapis workspace-shell reference

These captures are an immutable historical record of the Workspace migration.
They are no longer served by Storybook or used as the active visual acceptance
authority.

- Source application: Lapis workspace
- Source revision: `a371198e495d9e4e465c2960a04b3a4fd11f4023`
- Fixture: every open leaf normalized to the Lapis empty view
- Viewport: 1440 × 960 CSS pixels
- Device scale factor: 1
- Browser: Playwright pinned Chromium

The exact capture metadata is in `provenance.json`. Normal Storybook and Visual
Delta commands must not update these PNGs. The approved component snapshots
under `tests/visual/storybook.spec.ts-snapshots/workspace/` are the current
visual source of truth.

## Source Storybook references

`storybook/` is the immutable **v1** inventory. It contains all 52 reviewed
snapshots copied without hash changes from the validated standalone
workspace-shell slice `b06d1e3f58c3`.

`storybook/provenance.json` records the capture contract, complete inventory
hash, and the initial manual mappings. It remains available for provenance and
must never be rewritten.

`storybook-v2/` is the final corrected parity archive. It contains 52 canonical
scenes in both light and dark Lapis modes:

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

The capture harness and parity-only stories were retired after manual approval
of the migrated component catalog. Both v1 and v2 are read-only provenance and
must not be regenerated.

Expected SHA-256 digests:

| File                        | SHA-256                                                            |
| --------------------------- | ------------------------------------------------------------------ |
| `workspace-shell-light.png` | `612902f9da1b729f94a94e15057296cad752cafeab26435f2bed017a6735a28e` |
| `workspace-shell-dark.png`  | `7b4b1f94d61a7efeb725ddf0c56b024853be5873da76f24be517878c28f09985` |
| `provenance.json`           | `853b8fe4e84fa1915018c3055ea8ed88796aaabec944782fafcff423e70ec5b2` |

The v2 inventory SHA-256 is
`0c52a4a4881d651d98b5d26220ed34568153712d601c36c592014600c658ea63`.
