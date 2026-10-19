# Single-line captured tool paths

DC-CHAT-006; enclosing Jujutsu change; 2026-10-19.

The user refines the long-tool-title repair: captured vault paths must truncate
on one line, with a shadcn tooltip showing the complete path. TranscriptTool
accepts an optional host-owned `path`. Hosts supplying it request the bounded
title presentation and tooltip on hover/focus. Other titles retain wrapping.
The path is inert captured data; the component never resolves it or performs IO.

ChatTools composes the existing Tooltip around the actual inspector/disclosure
button, retaining keyboard activation, status descriptions and the independent
inline-source chevron. Its path title takes available flex width and ellipsizes;
the tooltip wraps the exact path to the available popup width. Accessible names,
captured source, IDs, comments, disclosures and host authority are retained.

Before: `pnpm test:storybook src/shared/chat/transcript/Transcript.readonly.stories.svelte -t Narrow`
fails both Document and Classic cases because the title occupies multiple lines
(Classic 448.5px rather than one 19.5px line). `truncated-path-before.log`.
The exact rerun passes both after the component change; `truncated-path-after.log`.
Tests assert bounded prose, nonzero title width, ellipsis overflow, single-line
height and the exact tooltip path on both hover and keyboard focus.

Follow-up verification uses the same three affected transcript story files,
source type check, canonical checks and prepared public archive as the preceding
long-title slice. The Desktop consumer records the exact source revision,
checksum and its focused read-projection and shell acceptance separately.
All 12 affected interaction/accessibility stories pass, followed by both final
WebKit narrow cases. Source types report zero errors/warnings and
`pnpm spec:check` passes all three lanes. Logs under `.local/verification/footer`:
`truncated-path-{affected,webkit,types,spec}.log`.
`packLocal` suffix `-tool-path-tooltip` passes preparation and audits 254 CSS
files with zero utility references; `truncated-path-pack.log`. Changed-file
Prettier checks pass.

Milestone review: DC-CHAT-006 remains In progress. This additive presentation
field grants no native, filesystem, execution or persistence capability.
Original history/streaming and release qualification remain pending. Broad
catalog, pointer, static and visual matrices remain deferred under the user's
minimal-testing direction; no baseline is changed.
