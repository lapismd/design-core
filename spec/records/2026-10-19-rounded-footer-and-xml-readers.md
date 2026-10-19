# Rounded host footer and captured XML readers

DC-WS-028/DC-WS-003 add host-owned safe-area insets without changing the
full-width footer boundary. Public inline-start/end and block-end tokens default
to zero. The footer uses the larger inline inset at both edges to preserve the
application-centred status region. The bottom inset adds to its track rather
than shrinking controls or reserving space inside hosted views. Desktop supplies
its window values; Design Core owns no OS detection.

Exact source regression: `pnpm test:storybook
src/shared/workspace/status-bar/WorkspaceStatusBar.layout.stories.svelte -t
Rounded` fails once before the fix (24px rather than 28px). The first command
used a case-sensitive full name and filtered all six cases; it supplies no pass.
The exact rerun passes after the CSS change. Asymmetric 8px/12px host insets,
4px bottom clearance, full background width and unchanged centre are asserted.
Logs: `.local/verification/footer/safe-area-{before-exact,after}.log`.

DC-CHAT-010 extends the existing inert prompt renderer to captured Markdown
readers. The immutable source document is retained; complete, line-aligned XML
sections use the existing TranscriptMarkdownPreview/PromptElement composition.
The existing prompt parser owns matching, escaping and depth bounds. Literal
code, comments, malformed and inline examples retain source presentation.
Transcript's Markdown extension options now reach its immutable readers through
the existing presentation context. Hosts still own text, IDs, navigation,
authorization, persistence and runtime actions.

Desktop's two preview/saved import regressions fail before wiring the public
extension and remain failing after that wiring alone: Markdown readers had not
rendered XML regions. The first source story then exposes a reactive-proxy
identity diagnostic when comparing extension objects. Compare the existing
extension's semantic name instead. A unit case also identifies Lezer's
CommentBlock node; retain that literal range along with code nodes. Both failures
remain recorded in `xml-reader-source.log` and `safe-xml-units.log`.

Focused verification: exact read-only XML/source footer stories,
the complete affected footer/read-only story files, the range/parser/rich-source
units, four type configurations and canonical/format checks. Public archive
preparation and desktop consumer acceptance follow source qualification.

Milestone review: the footer remains implemented, and host-owned safe insets are
an additive presentation option. XML rendering grants no execution or storage
authority and changes no captured bytes or identities. No native, provider,
release, visual-baseline or other deferred milestone is promoted. The user's
standing minimal-testing instruction defers new aggregate catalog/pointer/static
matrices; only the affected source and consumer cases are selected.

Eighteen units pass across the exact range/parser/rich-source files, followed
by all eleven footer/read-only interaction and accessibility cases. Four source/
consumer type configurations pass. Logs: `safe-xml-units-final.log`,
`safe-xml-stories-final.log` and `safe-xml-types.log`. The first spec run passes
validation/build but flags the missing DC-WS-003 framework chapter; update its
existing footer-track clause to include the host safe-area inset, retaining the
original shell topology and all acceptance gates.

Final source types pass again after the reader repair with zero diagnostics.
`pnpm spec:check` passes all three lanes after the framework mapping update;
Prettier passes every changed file. This qualified source slice is committed
before packing; the consumer handoff records its exact source revision and
archive checksum. New aggregate suites remain deferred as stated above.
