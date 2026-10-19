# Captured transcript diff fences

2026-10-19; enclosing Jujutsu change umvvsmqt; DC-CHAT-006.

Notes' captured-session Storybook showed a `diff` fence as uncoloured code.
`RichCodeBlock` always selected `kind: code`, so the existing patch line
decorations were never enabled. It now selects the existing patch reader for
`diff` and `patch` fences (case-insensitive). Source text, fence offsets,
anchors, immutable-reader behaviour, folding and copy remain unchanged.

`Transcript.readonly.stories.svelte` adds a passive highlighted-captures example
with a TypeScript file read and a diff containing context, hunk, removal and
addition lines. This is review data, not provider evidence. The owning contract
clarifies this existing code/patch presentation obligation.

The user explicitly paused automated checks during UI review. No tests, type
checks, spec checks or visual-baseline commands have run for this change. The
source fix is unqualified and remains uncommitted pending resumed checks. A
temporary source-owned archive is prepared for the Notes Storybook review only;
no publication or native application refresh is authorized by this slice.

Preview preparation: `packLocal` from `scripts/pack-local.mjs` with suffix
`-transcript-highlighting` emitted prepared public exports and ordinary CSS
(3 compiled stylesheets, 252 audited during packaging, no remaining utilities).
Archive SHA256: `bd5ba7a6c68428c3ba6c455097a84145e3c3a218cf137c1db17d17cd74968d02`.
Packaging is not test qualification. Notes retains its ignored archive manifest
and refreshes only its Storybook server on port 7491.
