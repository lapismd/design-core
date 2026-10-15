# App component promotion — grouped slices 2–5 and rich tool preview

The user grouped the next four planned deliverables into one review checkpoint
above `14c5a135478a4ed5c4a38416062da6e8eb130b4b`, in the isolated
`design-core-plain-css` workspace. Responsive Tabs, Avatar/AvatarPicker,
AppShell.Topbar and Chat MarkdownContent remain separately owned families.
Consumer migrations, publication, subsequent components and the pending Panel
Toggle integration remain outside this batch. The user subsequently brought rich
tool presentation forward for immediate Storybook review.

## Source and ownership

Adaptation/reference source is jj-store at
`aeb3e95e68d3f68fc54ef11b2d240e54b37ca78f`:

- `web/src/lib/ui/store-application/StoreViewTabs.svelte` and `view-tabs.css`:
  measured visible prefix, overflow menu and frame-coalesced observers.
- `web/src/lib/ui/community-avatar-picker/CommunityAvatarPicker.svelte` and
  `image-files.ts`, plus `community-member-avatar/CommunityMemberAvatar.svelte`:
  portable image/emoji/initials presentation and host-owned uploads.
- `web/src/lib/ui/store-application/StoreApplicationHeaderCenter.svelte` and
  `StoreApplicationHeaderActions.svelte`: top-bar composition reference;
  shared code owns geometry and slots, not routes or runtime controllers.
- `web/src/lib/ui/community-markdown-content/CommunityMarkdownContent.svelte`:
  embedded public Mira composition, with application references injected.

jj-store's `docs/ui-provenance.json` records the AvatarPicker and Markdown
Community ancestry at `741b8285e2081f1c9af58afe5a9b72f538fad781`, Apache-2.0,
Copyright LapisMD contributors. Adapted code remains Apache-2.0. Mira is consumed
from npm rather than copied or patched. Domain models, upload endpoints,
identity requirements, storage and authorization remain host-owned.

## Baseline and Mira checkpoint

Before implementation:

`pnpm test:storybook src/shared/shadcn/tabs/Tabs.stories.svelte src/shared/shell/app-shell/AppShell.stories.svelte src/shared/ai/message/Message.stories.svelte`

passed 24 tests across three files, zero failures
(`/tmp/dc-promotion-baseline.log`). Live npm metadata confirmed Mira 0.0.5;
`pnpm add '@lapismd/mira@~0.0.5'` consumed that registry release. Before adding
MarkdownContent, all four `pnpm check:types` lanes passed with zero diagnostics
(`/tmp/dc-promotion-mira-types.log`) and the same 24 stories passed
(`/tmp/dc-promotion-mira-stories.log`).

## Focused implementation evidence

The four new story families plus the complete existing AppShell story file
passed 28 interaction/accessibility tests across five files, zero failures
(`/tmp/dc-promotion-stories-third.log`). New and changed stories are
`visual-pending`; no screenshot baselines were updated.

The native-CSS audit passed including the new Chat root
(`/tmp/dc-promotion-native-css.log`). Strict source-consumer acceptance passed
with zero errors or warnings after repairing the new contracts
(`/tmp/dc-promotion-source-types-retry.log`). The packed consumer additionally
exercises the standard Forms barrel; focused source acceptance uses
`forms/avatar-picker`, following existing focused Forms entry points.

### Iteration findings

- The first implementation check caught one invalid style directive on a
  component; it now uses the component's native style prop.
- The first story run had three failures (asynchronous image fallback, hidden
  sidebar querying and preview first import) and three lifecycle errors during
  late dependency optimization. Explicit preview prebundling removed the reload
  and lifecycle errors. Async fallback now waits for the actual error event;
  hidden-sidebar assertions check absence from the accessible tree.
- A subsequent story run had one real duplicate-banner violation. Topbar is a
  neutral structural container, preserving existing main-toolbar landmarks;
  accessibility then passed without exclusions.
- Fifteen intermediate type errors were fixed in story query options, a test
  payload and fixture cleanup. The expanded strict source check then exposed
  two new optional-property forwarding errors and 30 existing Forms-barrel
  implementation diagnostics. The new errors were repaired; a focused picker
  entry point bounds source acceptance without changing old Forms code or
  relaxing compiler settings. The built Forms barrel remains a packed test target.
- Initial browser acceptance had three failures and two passes: the upload
  scenario exposed an immediate file-input reset conflicting with its bound
  value, and two cases timed out before story readiness. The reset was removed.
  A separate retry ran no tests because its fresh server missed readiness within
  the existing 120-second limit. No timeout or assertion was loosened.
- Browser/Storybook runs, specification generation and package artifact writes
  are serialized. A fresh review server on 9409 is owned by this workspace;
  focused acceptance may explicitly reuse it after readiness, preserving the
  original browser assertions while avoiding repeated catalog startup.

## Known upstream boundary

Mira 0.0.5 safe mode strips relative internal links to plain text before its
link renderer runs. The failing reference scenario established this inherited
limitation; the supported example uses absolute links and public extension
post-processors. MarkdownContent forwards public link/asset/component/extension
hooks and keeps safe HTML mandatory. There is no consumer shim, sanitizer
relaxation, source override or dependency patch. Full safe relative-reference
support needs a Mira-owned fix and published release before adoption; this
remains an explicit review/release gap.

## Browser qualification already completed

`SHADCN_STORYBOOK_PORT=9409 SHADCN_VISUAL_SERVER_PORT=9410 pnpm test:shadcn:pointer tests/shadcn/app-component-promotion.spec.ts`

passed five browser scenarios, zero failures, in 14.3 seconds
(`/tmp/dc-promotion-browser-third.log`): responsive tabs/selection, upload races,
local image/emoji selection, topbar independent panels/focus and narrow Markdown
with late styles. These results precede the rich tool preview.

## Rich tool preview — review before final checks

The user explicitly requested visible components first and final tests after
review. No additional automated baseline or final test lanes ran for this preview.
Before-state inspection found that ToolCallDetail only rendered generic Input,
Output and multiline Error blocks, with no raw switch or rich tool views.

Reference source, read without edits, is jj-store at
`aeb3e95e68d3f68fc54ef11b2d240e54b37ca78f`:
`community-agent-activity/TranscriptToolDetail.svelte`,
`TranscriptToolRichDetail.svelte`, `transcript-tool-rich.ts`, and
`store-agent-chat-body/ChatToolPanel.svelte` (Apache-2.0, LapisMD contributors).
Shared models accept normalized shell, file-read, file-edit and search data.
Provider-name guessing and payload interpretation were not copied. Complete
before/after text and explicit partial captures have distinct types, so a missing
side cannot silently become an added/deleted file. Raw strings are displayed as
captured; capture notices apply in both views. Generic payload props and explicit
ToolCalls snippets remain supported. File authorization/navigation remains a host callback. The user replaced the
duplicate inspector preview with a maximize/restore icon: the same view fills
the page, retains its raw/formatted state and returns inline with Escape.

The live catalog on 9409 shows the tool-type gallery and individual scenarios,
including failed shell, missing path, incomplete/redacted capture and unknown
output. ToolCalls Simple and Rich tool results demonstrate disclosure integration.
The gallery was manually observed rendering all four types, and its raw switch
was observed showing the captured shell record. The icon-only maximize control
was observed filling the page with an edit result; switching to Raw then pressing
Escape restored the same Raw view inline and focused its maximize button. The
control is the rightmost action. This is preview
evidence, not final functional/accessibility or packed-package qualification.

## Deferred qualification

At the user's request, aggregate checks, new tool interaction/accessibility
execution, static Storybook build/metadata audit, cold browser lifecycle checks,
final type/source checks and packed-consumer qualification wait until review.
The batch remains uncommitted until it is verified. No screenshot baselines,
release, publication or consumer migrations were performed.

## Avatar reference review revision

The user supplied five screenshots and requested a reference-style avatar trigger
with an edit-icon cut-out, rounded-square/circular styles, multiple sizes and an
editor that can open inline or in a popover. Before-state source inspection showed
a fixed 3rem plain avatar trigger, popover-only editor, native file input and a
second nested emoji popover. Automated checks remain deferred by the user's
review-first instruction.

The revision adds a transparent radial cut-out and pencil affordance, shared
Avatar sizing including 2xl/3xl, and a single editor composed in either location.
The image panel has a drop/browse surface and icon-prefixed URL field. Emoji
selection is embedded through the public EmojiPicker `presentation="inline"`
extension, retaining custom emoji registration and lazy data loading. Background
swatches, initials, removal and Done share the same controlled values and upload
cancellation guards. Glyph SVGs have square backgrounds so host shape changes
clip correctly rather than retaining an embedded circular image.

New visual-pending stories: Styles and sizes, Inline editor and Popover editor;
EmojiPicker also has an Inline panel story. Existing upload lifecycle examples
remain available. Existing browser assertions were adapted to the explicit inline
emoji lifecycle, but have not been rerun. Preview observation confirms the shape,
size and cut-out gallery plus the embedded full emoji panel render. Aggregate,
final focused interaction/accessibility, type, package and cold-run qualification
remain deferred until review. No baselines or consumers were changed.

Follow-up review requested edit-button hover states and backing colours for all
avatar types. Hover/pressed/focus treatments now apply to the pencil affordance,
with reduced-motion handling. The palette is available on every tab and Avatar
receives the separately bindable background behind transparent images; image URLs
remain unchanged. A Transparent image backgrounds story demonstrates this.
Generated/local image data URLs no longer appear as pasted URLs in the editor.

The user clarified that shape is configuration, not an end-user choice. The
editor's shape controls and the temporary showShapeControl prop were removed;
stories configure shape on the component and retain it while avatar values change.

The user clarified that initials are fallback input rather than an avatar type.
The editor now has Image and Emoji tabs only; `initials` or the supplied name
provides the fallback after image removal or load failure. Size/style examples
include an empty image value to demonstrate that fallback without serializing an
initials avatar. Review qualification remains deferred.

Avatar popovers now compose the shared ScrollArea with explicit styled scrolling,
so the editor no longer sets native overflow scrolling on its outer popover. The
viewport is bounded by available space and scrollbars retain the shared styling.

A manual preview observation found the avatar popover's ScrollArea strategy was
`styled`, its outer overflow was hidden and its viewport bounded at 516px for
724px of content. The editor showed Image and Emoji tabs only. This is a live
preview spot check; no final automated qualification was run.

## Shell and Markdown review revision

The user requested jj-store-inspired shell composition and supplied marked
screenshots. Reference-only source was reread from jj-store's StoreApplication,
CommunityAppShell and their CSS: leading sidebar toggle then history, collapsed
icon navigation, separate document-local and workspace panels, and neutral outer
chrome. No jj-store files were modified or domain controllers copied.

The top-bar example now fills the iframe viewport, keeps page overflow hidden,
and contains long document, navigation, details and team-activity content in
independent shared ScrollAreas. It includes ResponsiveTabs with actual tab
content, optional document outline, document details, an independent workspace
inspector and a far-right tools rail. The left navigation retains named icons
when collapsed. Topbar leading content precedes back/forward; its default
background matches Root's outer surface. The shared Toolbar is the canonical
main/body header and now owns default token-driven padding. Rail resize
indicators stay transparent in the owning Shell stylesheet.

MarkdownContent uses Mira's public preview class and theme tokens for a
transparent, left-aligned surface with a small configurable inset; it does not
change Mira internals, parsing or safe HTML policy. An initial inheritance-only
attempt was insufficient because Mira binds the readable-width token on its own
preview root; the public class composes that token on the correct element.

The user's follow-up avatar screenshot requested a shorter emoji section and
cleaner custom-colour swatch. Avatar editors now use a compact 16rem panel in
both presentations; the native colour input stays keyboard-accessible but its
invisible border/padding no longer participates in the rainbow swatch edge.

A manual live-shell preview rendered the full-height composition and independent
scrolling bodies. New source/runtime qualification and all final test lanes remain
deferred until review; earlier passing counts do not qualify these revisions.
No screenshot baseline, release, package publication or consumer change was made.

Manual DOM observation of the revised 1280×720 shell found page height exactly
720px and page scroll 0, with document content 2883px inside a 533px viewport;
details and inspector had separate bounded viewports. PageDown moved document
scroll while inspector and page remained at 0 and the topbar remained at y=0.
Leading action order was Toggle navigation, Go back, Go forward. The composed
Mira preview background computed transparent and readable-width token was 100%.
These are review spot checks, not execution of the deferred final test lanes.
Existing AppShell scenarios affected by the new shared toolbar padding were
returned to visual-pending; no baselines were updated.

## Body toggle placement and rail border follow-up

The user requested body-local toggles at the body's left/right edges and the
outer workspace-inspector toggle at the document header's right edge. The example
now uses those positions with the same controller callbacks and mobile focus
handling; panel/content insets prevent controls overlapping headings. The
copyable example follows that topology, and the existing story interaction adds
containment assertions for final qualification. The outline reader reference is
bound so its existing section-navigation handler can reach the document.

Before editing, live DOM inspection of the expanded Tools rail found one visual
regression: its border-inline-start was a visible 1px solid theme border even
though the resize handle and indicator backgrounds computed transparent. The
expanded right-sidebar selector had higher specificity than the rail rule. The
owning Shell stylesheet now matches that specificity and targets the actual
indicator data attribute, keeping borders/indicators transparent through hover,
preview and dragging while preserving an explicit keyboard-focus outline.
Final automated qualification remains deferred for the user's review.

Live review spot checks after the fix found the expanded rail border, handle
background and indicator background all rgba(0, 0, 0, 0). Pointer hover and an
active drag retained transparent border/indicator; keyboard resizing retained a
visible 2px focus outline. The two document toggles were 8px inside the body's
respective edges and the inspector toggle rendered in the Document header.
The visible rail-border issue count is 1 before / 0 after in this scenario.
The story also records the expanded-border assertion for final regression
qualification. Formatting completed; no aggregate test or packaging run was
started, and the unverified batch remains uncommitted pending review.

## Deferred qualification resumed

The user requested the deferred gates before MarkdownComposer and message actions/reactions. The eight affected story files initially returned 52 passes and six failures: duplicate tool-gallery landmarks, a stale DOM assertion after raw/formatted remount, failed-exit contrast, and three shell header-alignment regressions. All six are repaired without relaxing geometry assertions or accessibility rules. Toolbar default block padding now fits its declared height, preserving established icon/header alignment. Five invalid Storybook query options were replaced with exact regular-expression names.

A second run exposed two cold lazy-emoji waits at the helper's default one-second boundary; the helper retains its rendered-input assertion with an explicit bounded five-second cold-import wait, matching the asynchronous library/data contract. The complete affected picker/avatar suites were rerun together. The exact eight-file focused command now passes 58/58 stories, zero failures (`/tmp/dc-deferred-focused-final.log`).

The strict source consumer exposed four inherited Diff implementation diagnostics reached through the new rich detail imports; absent optional props are now omitted and indexed merge targets guarded in the owning Diff source. `pnpm check:source-consumer` passes with zero errors/warnings (`/tmp/dc-deferred-strict-after.log`). Specification qualification corrected public-surface and verification rows, the Chat mirror/order, and atomic acceptance formatting; `pnpm spec:check` passed all three lanes (`/tmp/dc-deferred-spec-final.log`).

The complete unit baseline was 740 passed / one failure from the old Mira range assertion; the exact editor-boundary test now passes 4/4 against the deliberately qualified 0.0.5 minimum, retaining rejection of older and incompatible minor versions. A first aggregate attempt stopped because that updated test also needs its mapped Forms/Editors chapter; its cancelled sibling jobs do not count as independent product failures.

After `pnpm storybook:restart`, the exact browser command with `SHADCN_STORYBOOK_PORT=9409 SHADCN_VISUAL_SERVER_PORT=9410` passes 5/5 scenarios in 22.2 seconds (`/tmp/dc-deferred-cold-browser.log`), including upload races, inline emoji selection, independent shell panels/mobile focus, and Markdown reader identity under late stylesheet updates. Aggregate and packed-consumer qualification continue below.

## Final qualification and commit boundary

`pnpm checks` passed all required nonvisual lanes (`/tmp/dc-deferred-checks-after.log`): specification validation/build/spec-first, repository formatting, four type-check lanes with zero errors/warnings, the native-CSS audit, 741/741 units across 115 files, 3/3 Turbo tests, 16/16 release/style tests, static Storybook build and metadata audit, and 731/731 Storybook interaction/accessibility cases across 222 files. Native browser results are Workspace 15/15, Shell 11/11, AI 3/3 and Shadcn 70 passes with one existing Chromium-only WebKit-preference skip, totaling 99 passes / one governed platform skip / zero failures. Non-failing ResizeObserver-loop stderr occurred in tablet shell stories; no functional, accessibility or Svelte-diagnostic gate failed.

`pnpm packages:pack` passed (`/tmp/dc-deferred-packed.log`): the source tarball installs and type-checks in a clean consumer and passes cold development/production CSS, fonts, focus, themes, tokens and lifecycle checks with no Tailwind tooling or Svelte diagnostics. The existing user-approved low-severity KaTeX advisory GHSA-238p-pmpm-9mq7 remains under the unchanged release policy (six propagated packages); full audit evidence is `.release/production-consumer-audit.json`. No new exception was introduced.

The grouped review batch is ready to commit before starting the requested MarkdownComposer and message-action/reaction work. Visual-pending metadata remains in place; no baseline update, publication, release or consumer migration was performed. The safe-relative-link limitation documented above remains an upstream adoption gap.
