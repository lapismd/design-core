# Superlist reference capture

This folder holds versioned, **sanitized** observation artifacts for the Tasks
implementation contract. It is not a product export and must never contain a
real task title, list title, account name, avatar, comment, raw recording, or
authenticated browser state.

## Capture shape

- Desktop: 1440×900
- Tablet landscape: 1024×768
- Tablet portrait: 768×1024
- Mobile: 390×844
- Device scale factor: 1 for legible diffs and manageable source control size

Each dated capture includes a manifest with sha256 checksums, screenshots, and
motion keyframes. Raw WebM and Playwright trace output remain in the ignored
`.reference-artifacts/` directory. Before a screenshot is written, the capture
harness overlays every unapproved semantic label; the native evidence helper
uses the same policy as deterministic opaque rectangles. Both approaches permit
only generic navigation, structural controls, and synthetic fixture text.

## Motion evidence

Motion captures record a JSON contract plus deterministic keyframes/contact
sheets. The harness uses CDP touch trajectories for swipes, ordinary click and
double-click inputs, and native pointer drags. A future implementation follows
the timing ranges in `src/lib/reference.ts`, while `prefers-reduced-motion`
uses an instant or short-fade equivalent.

The initial manifest is deliberately pending until an authenticated capture has
run. `reference:verify` accepts that state but will checksum all listed files
once evidence is committed.
