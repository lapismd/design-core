# Superlist reference capture

This folder holds versioned, **synthetic-fixture** observation artifacts for the Tasks
implementation contract. It is not a product export and must never contain a
real task title, list title, account name, avatar, comment, raw recording, or
authenticated browser state.

## Capture shape

- Desktop: 1680×1000
- Tablet landscape: 1024×768
- Tablet portrait: 768×1024
- Mobile: 390×844
- Device scale factor: 1 for legible diffs and manageable source control size

Each dated capture includes a manifest with sha256 checksums, screenshots, and
motion keyframes. Raw WebM and Playwright trace output remain in the ignored
`.reference-artifacts/` directory. Browser-derived frames are taken only after
the dedicated synthetic task list has been created. At export time, account
navigation and generated audit text are replaced with labelled fixture content;
the committed assets do not use opaque grey bars.

When the authenticated browser cannot expose a real responsive viewport, the
tablet and mobile frames are marked `synthetic fixture contract` in the
manifest. They are implementation references rather than claims of observed
breakpoint behaviour and should be re-captured from a real device before a
pixel-parity milestone.

## Motion evidence

Motion captures record a JSON contract plus deterministic keyframes/contact
sheets. The harness uses CDP touch trajectories for swipes, ordinary click and
double-click inputs, and native pointer drags. A future implementation follows
the timing ranges in `src/lib/reference.ts`, while `prefers-reduced-motion`
uses an instant or short-fade equivalent.

`reference:verify` checks every committed checksum and accepts either a
redacted evidence frame or an explicitly fixture-only frame.

## Local live Chrome captures (not committed)

For side-by-side Visual Delta review against a logged-in Superlist session,
capture PNGs into the gitignored tree:

```text
packages/tasks/.reference-artifacts/live-chrome/<YYYY-MM-DD>/screenshots/
```

Storybook mounts that tree at `/tasks-reference-live` (see `.storybook/main.ts`).
Catalog stories live under **Tasks/Live Reference** and use
`liveReferenceVisualDelta(...)` from `src/lib/story-data.ts`. Chrome DevTools
MCP can only write screenshots under the process temp root; copy files into the
gitignored path afterward. Do not commit live PNGs or `manifest.local.json`.
