# Trailing history fade above fixed footer

DC-CHAT-006; enclosing Jujutsu change; 2026-10-19.

The user requests a small fade at the bottom of Document and Classic history,
before content disappears behind the fixed footer. Transcript now renders a
private, non-interactive gradient only for hosts supplying that footer. It uses
the host background and `--ui-transcript-scroll-fade-size` (default 2rem).

The fade follows the viewport, sits above the pinned Classic composer and is
hidden when no content remains below. It cannot intercept pointer input and
never covers footer controls. Passive scroll handling schedules one animation
frame; viewport/content/composer ResizeObservers track layout. All listeners,
observers and pending frames are released with the owned scrollport. Captures,
scroll ownership, editor identity and host action/persistence authority remain
unchanged.

Exact regression:
`pnpm test:storybook src/shared/chat/transcript/Transcript.composer-layout.stories.svelte -t Fading`
fails before because the fade is absent, then passes after. One interaction case
switches both views, scrolls history, checks the gradient and pointer policy,
asserts alignment above footer or pinned composer and verifies removal at the
end. Logs: `.local/verification/footer/transcript-fade-{before,after}.log`.

Selected follow-up: the composer-layout and read-only transcript story files,
source types/spec checks, prepared public archive, and Desktop's long-path
shell review. Source and consumer evidence remain separate. Milestone review:
DC-CHAT-006 stays In progress; no history/streaming, native/provider, release or
visual-baseline gate is promoted. Aggregate matrices remain deferred under the
user's minimal-testing direction; no baseline changes.

All 11 affected composer-layout/read-only interaction and accessibility cases
pass in a fresh process. The exact Fading case also passes in WebKit. Source
types have zero errors/warnings and `pnpm spec:check` passes three lanes. Logs:
`transcript-fade-{affected,webkit,types,spec}.log`. Public preparation using
`packLocal` suffix `-transcript-footer-fade` succeeds with 255 CSS files audited
and zero utility references (`transcript-fade-pack.log`). Changed-file Prettier
passes. Desktop records the final source revision and archive checksum.
