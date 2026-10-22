# Chat

Transcript captured-file headings and disclosures compose FileTypeIcon from an explicit block path. Default tool titles use their captured target path; host-supplied icons and error/running status indicators take precedence. Pathless context labels and host-owned reference/suggestion content are not treated as filenames. Labelled tool disclosure bodies MUST expose a group role so their accessible names remain valid.

Chat is the host-neutral presentation family. Existing stable AI chat primitives
remain implemented in their current owners and are re-exported through `/chat`,
including ToolCallDetail, RichToolCallDetail and their normalized presentation types
(DC-AI-025).

### Presentation notes

Classic presentation uses the shared Message primitive with an author/role header,
larger avatar and hover surface while retaining the document's mounted readers.
Classic user prompts retain a rounded primary-tinted surface, including on hover
and keyboard focus; assistant messages keep the ordinary hover treatment.
Document presentation does not acquire the Classic prompt background.
Optional metadata includes edited state, reply participants/count and a host reply
callback, with display timestamps separate from valid machine-readable dates.
Reply contexts have one padded outer border around the quote and comment list.
Jump to end focuses the enabled composer when present, otherwise the last item.
The full-conversation example retains multiline Enter in either view.
Label-only context items (no blocks and no error severity) use the shared
SystemMessage divider: centered status text and icon on a tinted background
between two horizontal separators in both views. Host timestamps use the shared
RelativeTime component underneath, including its full-date tooltip;
warnings retain their tone, without a disclosure, duplicate body or avatar.

### Composition notes

MarkdownComposer can expose its live formatting/emoji actions through a bound
snippet for a fixed footer, removing the inline duplicate while retaining editor
selection and releasing the snippet on teardown. Read-only composer content
and avatars retain full opacity; disabled action controls keep their own state
styles without reducing the readable draft below text-contrast requirements.
Generic Composer retains its default disabled opacity of 0.6 through the public
`--ui-ai-chat-composer-disabled-opacity` token; MarkdownComposer sets it to 1.
The formatting strip follows jj-store: selected formatting trigger, close,
separator and actions expand rightward on the same footer row. Overflow stays
within the action strip on narrow surfaces; the transcript clips reader
overflow at its bounded scroll region so focus cannot scroll an outer workspace
or displace its fixed footer. Host controls and send remain
reachable without increasing footer height. Long queued messages use the
compact fold row with a trailing divider.

## Public surface coverage

| Surface                             | Public boundary             | Requirement |
| ----------------------------------- | --------------------------- | ----------- |
| Markdown Content                    | `@lapismd/design-core/chat` | DC-CHAT-001 |
| Markdown Composer                   | `@lapismd/design-core/chat` | DC-CHAT-002 |
| Message Actions                     | `@lapismd/design-core/chat` | DC-CHAT-003 |
| Reactions                           | `@lapismd/design-core/chat` | DC-CHAT-004 |
| Comment Composer                    | `@lapismd/design-core/chat` | DC-CHAT-005 |
| Transcript                          | `@lapismd/design-core/chat` | DC-CHAT-006 |
| Transcript Comments                 | `@lapismd/design-core/chat` | DC-CHAT-007 |
| Comment Queue                       | `@lapismd/design-core/chat` | DC-CHAT-008 |
| Transcript Footer and Message Queue | `@lapismd/design-core/chat` | DC-CHAT-009 |
| Prompt Context                      | `@lapismd/design-core/chat` | DC-CHAT-010 |
| Sent Context                        | `@lapismd/design-core/chat` | DC-CHAT-011 |
| Versioned comment editing           | `@lapismd/design-core/chat` | DC-CHAT-012 |

| Composer Suggestions | `@lapismd/design-core/chat` | DC-CHAT-013 |
| Thread Panel | `@lapismd/design-core/chat` | DC-CHAT-014 |
| Inline Reference | `@lapismd/design-core/chat` | DC-CHAT-016 |

## DC-CHAT-001 — Markdown Content

**Requirement.** MarkdownContent MUST compose Mira's public embedded preview with safe HTML and host-owned link, asset and extension hooks.

### Acceptance details

- The Chat entry point MUST re-export stable chat primitives without breaking existing AI imports.
- Mira MUST own MarkdownContent typography, lists, quotes, tables, images and block spacing without Chat content overrides; the enclosing message owns its optional wrapper inset.
- Markdown MUST retain left-aligned full-width presentation with optional token-driven wrapper padding, streaming updates, public preview hooks and late stylesheet loading without copying Mira internals.
- Published Mira 0.0.5 MUST be qualified before the new preview is added; domain-specific references and authorization remain consumer extensions.

## DC-CHAT-002 — Markdown Composer

**Requirement.** MarkdownComposer MUST compose the existing Composer shell and public Mira editor APIs with controlled drafts and host-owned submission intent.

Hosts MAY supply a supplementary `drawer` snippet inside the Composer shell;
`interactiveDrawerWhenDisabled` keeps its controls usable while editing and
submission remain blocked. Reply context and host drawer content compose without
remounting the editor or changing the draft.

Catalog collapse assertions await the closed drawer layout while retaining
their existing geometry bounds and deadlines.

Hosts MAY attach status to either edge with `statusPosition` (`top` by default),
including a bottom warning behind the framed composer. Document presentation
MUST retain the same opaque framed body and joined banner while status is
attached, restoring its ordinary prose surface when that status clears.
`statusContent` MAY compose host metadata/actions inside that same shell, with
custom content owning its accessible announcement semantics. Error feedback
MUST retain its shared red treatment across Default/Lapis light and dark themes.
Custom MessageMetadata MUST use the same typography as ordinary status feedback.

Hosts MAY omit the inline keyboard hint with `showHint=false` when they render
the instruction in their own fixed row; the default hint remains visible.

Editor content MUST retain stock Mira typography, indentation, spacing and focus
styles. Chat MAY remove only note-column centering; shell geometry and custom
reference/suggestion components remain owned by Chat.
The composer MUST disable Mira's line-number extension through `lineNumbers=false`.
The shell owns its compact outer editor inset (0.25rem in Document, 0.5rem in
Classic) and bounds the Classic scroll viewport without overriding content styles.

### Acceptance details

- The component MUST support framed and document presentations with left-aligned editor content, top reply quotes, form serialization, contextual content, host actions, disabled/busy state and bottom formatting actions with accessible tooltips; document presentation uses a transparent prose surface unless status is attached, a host-supplied avatar vertically centred beside the first draft line and a tall writing area
- Formatting, emoji insertion, optional host-owned reply cancellation and presentation changes MUST retain the draft and editor selection through public Mira and CodeMirror APIs, with custom emoji syntax and editor extensions supplied through host hooks.
- Keyboard submission MUST distinguish Enter, Shift+Enter, modifier submission and IME composition, while disabled/busy controls MUST block submission and editing.
- Submission MUST emit the exact draft snapshot without clearing it, leaving acknowledgement, failed delivery feedback, persistence and any clearing to the host.

## DC-CHAT-003 — Message Actions

**Requirement.** MessageActions MUST expose host-supplied message actions through hover, keyboard focus and touch without embedding application policy.

Transcript hover actions MUST compose MessageActions, use an icon-only Comment,
and omit the toolbar when no enabled action exists. Invisible controls MUST NOT
intercept pointer input; their position MUST leave tool header actions usable.
Hosts MAY disable action tooltips entirely while retaining accessible labels.

### Acceptance details

- Hosts MUST supply action identifiers, labels, availability, optional icons and callbacks, with primary actions and an overflow menu supported.
- Actions MUST remain reachable through keyboard focus and touch, stay visible while their menu or reaction picker is open, and restore trigger focus after dismissal.
- Disabled actions MUST expose their explanations and never invoke host callbacks.
- The component MAY compose the shared emoji picker with custom or explicitly restricted choices, retaining host-owned reaction updates.

## DC-CHAT-004 — Reactions

**Requirement.** The shared ReactionBar MUST present controlled Unicode and custom-image reactions while preserving its experimental import and callback compatibility.

### Acceptance details

- Custom emoji MUST use neutral shared registration records, with accessible reaction counts and independently controlled selected state.
- Explicit restricted choices, including an empty list, MUST remain authoritative over the full picker and registered custom emoji.
- Disabled state MUST block reaction changes and picker opening while host callbacks continue receiving the string and optional custom record.
- The stable Chat and experimental AI imports MUST resolve to the same implementation and retain existing Unicode-only usage.

## DC-CHAT-005 — Comment Composer

**Requirement.** CommentComposer MUST present a controlled compact comment editor with optional captured source context and host-owned navigation and delivery.

An accessible T toggle at the editor's right edge MUST open and close a compact
formatting strip below the input, including the shared emoji picker. It MUST use the same public Mira Markdown
commands as MarkdownComposer, preserve the exact editor/selection and draft,
and block formatting while disabled, pending or read-only.
The T control MUST be the last row action; hover actions MUST stay inside the
same first row before the T and reserve no inline width while hidden. The first
formatting glyph MUST align with the editor text.
Hosts MAY supply emoji palettes and custom emoji serialization through public props.
Plain, non-repeated Backspace on an already empty editable draft MUST request
`onRemove`, falling back to `onDismiss`; deleting the final character MUST keep
the editor open. Modified keys, IME and blocked editors MUST NOT request removal.

### Acceptance details

- Captured code or safe Markdown quotes MUST appear above the avatar/editor card, retain their original text and expose optional source navigation and unavailable-source explanation without relocating anchors.
- Enter MUST insert a newline, modifier+Enter MUST emit the exact nonblank draft without clearing it, and IME composition MUST never submit.
- Optional dismissal and removal MUST request host actions while context changes retain editor identity, draft and selection; disabled, pending and read-only states MUST block edits and submission.
- The family MUST support a bare presentation for composition inside an existing comment card and own native token-driven styles with independent quote/editor typography, compact inline and context presentations, keyboard-accessible actions and representative Storybook examples without requiring an application comment controller.

## DC-CHAT-006 — Transcript and history edge

Hosts MAY request `surface="plain"` on a custom block to omit its default
border and padding while preserving exact text, comments and host interaction.
Other custom blocks retain their frame.

Context, handoff and rootless content readers MUST inherit the transcript prose
font and size (including host overrides), with independent Markdown spacing.
Hosts MAY declare a destructive disclosure tone for captured outcomes without
turning them into execution errors. Its text and icon MUST use readable red in
both themes; a final compact disclosure/tool row MUST retain the ordinary tool
row gap before the composer rather than the full message margin.
Retained unavailable-source comments MUST have a small token-controlled gap
between cards while keeping each status attached to its own quote.
Message `status` MUST appear below its body in the shared metadata row, alongside
the timestamp and explicit host actions. Error labels and details MUST use the
destructive foreground in both views; status presentation never retries a turn.

**Requirement.** Transcript MUST present immutable host-owned conversations in document and classic views, preserving jj-store reference geometry, exact source text and reader identity during streaming and history loading.

Hosts MAY opt into `scrollButton` in either transcript presentation. The shared
Layout Scroll Button MUST appear only beyond the latest-content threshold, sit
above a pinned Classic composer and jump within the owning viewport. Host `busy`
controls its running glyph. Resize and late reader measurement MUST retain a
bottom lock after the user returns, while upward reading keeps its position.
Neither navigation nor the indicator may dispatch work or change source data.

Reader links MUST retain foreground contrast on light/dark host surfaces and an
underline, independently of the primary fill colour. Routing remains host-owned.

GFM tables and complete fenced code blocks MUST render through the existing safe
Markdown reader while keeping the original captured source and offsets.
Incomplete captures remain source content and fenced table examples remain
literal code; reader widgets never write captured text.
Embedded previews MUST reset the reader's whitespace-preserving layout so
renderer formatting whitespace cannot create blank rows around tables.
Rendered code and table cells MUST retain immutable cursor readers and exact
UTF-16 comment selections, including repeated cell text. Code frames MUST show
their language and use one background; nested readers cannot mutate captures.
Embedded readers MUST omit line gutters and document-page padding so ordinary
single-line table rows retain compact geometry.
Table comments MUST appear between their referenced row and the following row,
with unchanged source order and aligned column widths. Comment context MUST
retain the complete captured row and its exact selection independently of the
original source's later availability, using Mira's public table surface.
Fenced code MUST use the captured code/patch reader's syntax, inline line
comments and middle-fold controls. Mapping a fenced body into its captured
Markdown MUST preserve the original anchor identity and UTF-16 selection.
Fences labelled `diff` or `patch` MUST use the existing patch reader so additions,
deletions and hunk headers retain their distinct presentation.
Initially collapsed tool groups MUST reveal their captured child tools when
opened in either conversation view, including with an externally owned
TranscriptController. Inner tool disclosures MUST remain independently usable.
Hosts MAY opt into a fixed Classic composer through `classicComposerPlacement`.
The composer, pending comments and queued messages MUST stay adjacent to the
footer as history scrolls, without remounting the editor or changing Document
placement. The default Classic placement remains inline.
Document composers MUST retain the document's trailing writing space after the
draft: 4rem, or 3rem below 600px, controlled by
`--ui-transcript-composer-trailing-space`. Classic composer spacing is unchanged.
Captured GFM task lists MUST render checked and unchecked read-only checkboxes,
including nested and ordered tasks. Their original markers and UTF-16 comment
offsets MUST remain unchanged; inline and fenced examples stay literal.
Checked and unchecked task controls MUST share consistent vertical alignment
with their text and MUST NOT alter row geometry according to checkbox state.
Inspectable tools MAY supply an inline source projection. Their title MUST open
the host inspector while a separate chevron expands or collapses the source,
retaining syntax highlighting, middle-fold controls and shared exact anchors.
Hosts MAY set `--ui-transcript-body-footer-border` to omit the fixed footer's
separator; its default remains the shared border.
Long tool titles MUST fit within the transcript without widening adjacent prose
or hiding disclosure controls. Host-supplied captured tool paths MUST keep their
title on one truncated line and expose the exact path through a shadcn tooltip
on hover or keyboard focus in both views.
Transcripts with a fixed footer MUST fade the trailing scroll edge into the host
background while more content remains below. The fade MUST sit above any pinned
Classic composer, ignore pointer input and disappear at the end of content.

Nested file disclosures MUST lead with the decorative FileTypeIcon resolved from
the exact captured path, unless the host overrides it. Reasoning MUST retain a
distinct lightbulb icon unless overridden by the host.
Reactive presentation bindings MUST support cleared optional host values under
strict exact-optional-property checking without changing message actions.
Transcript-owned font sizing MUST configure Mira through its public
`--mira-font-size` theme variable, including rootless context and handoff readers;
Mira's content styles MUST remain stock. Hover-only actions MUST become usable
through their owning block's hover or focus state.

Host-marked error or warning notices MUST remain inline with a tinted semantic
surface and circular warning icon. Captured text stays immutable, and trailing
metadata actions request an explicit host retry without dispatching implicitly.

### Acceptance details

- Stable item and block identities MUST retain selection, folds and scroll anchors across append, prepend and source updates, and overlapping inspector readers MUST restore still-mounted source registrations under either teardown order; host extensions own application syntax and authorized navigation.
- Markdown, code, captured line numbers, patches, compact grouped tools with host-supplied icons, uniform disclosure heights and activity gaps, raw captures, metadata and custom blocks MUST use native CSS with family-owned tokens and keyboard-accessible controls, with optional author details/actions through the shared AuthorCard in hover or popover mode across messages, comments, queues and composer avatars.
- HistoryEdge MUST expose loading, empty, load and retry presentation without discarding retained content or executing transport.
- Controlled document/classic switching MUST reuse the same items and controller, retain captured readers, comments, drafts and disclosures, defer through IME composition and supply the applied view to the composer snippet, as demonstrated by the full-conversation example.

## DC-CHAT-007 — Anchored transcript comments

**Requirement.** TranscriptController MUST keep caller-owned comment state attached to exact block IDs, revisions, UTF-16 ranges and quotes without editing captured text or relocating stale anchors.

Custom-section annotation handlers MUST ignore input already handled by a nested editor, retaining each typed or pasted character exactly once.
Hosts setting `canComment` to false MUST omit comment actions, including empty hover-action surfaces, while preserving existing comments and independent reaction or host actions. Commentable hosts MUST retain the disabled waiting-for-source action for unpublished blocks.

Expanded queued/history/reply quotes MUST share their enclosing context background
without an additional prose, list or captured-code highlight. The original
source's selection highlighting MUST remain independent.

### Acceptance details

- Selection, keyboard, typing, paste and IME MUST create equivalent exact anchors; multiple comments and whole-section anchors MUST retain drafts through folding and raw/rich transitions, and collapsed files/tools/sections MUST show only the last nonempty current root comment per anchored discussion, with earlier comments restored on expansion and agent responses retained in their linked messages.
- Changed or missing sources MUST retain quotes and unavailable explanations, and source navigation MUST reveal folded content before restoring selection and focus, while removing a host-owned thread MUST release its rendered quote without reading an absent thread during child teardown.
- Comment editors MUST compose CommentComposer, retain host typography and block edits/submission while disabled or sending.
- Unavailable-source status MUST reuse Composer's curved status banner with host-selected semantic colour and top/bottom placement, while retaining the exact quote and explanation.

## DC-CHAT-008 — Comment queue and reply navigation

**Requirement.** CommentQueue and transcript turn navigation MUST present host-acknowledged submitted snapshots and destinations without owning persistence, retries or agent execution.

### Acceptance details

- Mixed and comments-only submissions MUST preserve exact snapshots and newer edits; only explicit acknowledgement MAY mark submitted entries delivered or clear the corresponding message.
- Rejection and unknown outcomes MUST retain drafts and request identity; an absent outcome MUST never count as delivery.
- Source, queue and reply navigation MUST expose named keyboard/touch targets, reveal disclosures and retain discussion state and opener focus.
- Queue disclosure names MUST include the visible singular/plural comment count verbatim, followed by sent/pending context.

## DC-CHAT-009 — Transcript footer, queued messages and reactions

**Requirement.** Transcript MUST offer host-neutral queued-message and fixed-footer presentation matching jj-store, alongside controlled message reactions.

Hosts MAY set `TranscriptFooter.showStatus=false` when they render the same
feedback beside a fixed send hint. `ComposerStatusBanner.position="standalone"`
MUST round every corner without negative margins or overlap with adjacent controls.
The default attached footer status remains unchanged.

While busy, TranscriptFooter MUST show exactly one submission action when the
host supplies Stop. A pending submission or empty/whitespace-only draft selects
Stop; Queue appears only for nonempty content after submission settles. Pending
content MUST NOT leave a disabled Queue beside Stop. Without host cancellation,
empty or pending active drafts omit Queue. Idle Send availability is unchanged.

### Acceptance details

- TranscriptFooter MUST select Send, Queue or Stop from host-supplied busy/content/pending state, use jj-store's paper-plane icon for idle Send, upward arrow for Queue and square for Stop, preserve accessible names and keyboard activation, and accept custom actions, workspace content and controls without executing agent operations.
- MessageQueue MUST retain exact immutable submission text/comments, recipients, cancellation/error/unknown states and expansion; callbacks request host actions and MUST NOT remove entries or infer delivery.
- Transcript examples MUST show busy-agent message queues, comments-only submission, retained/rejected drafts, extensible footer controls and reaction addition/toggling including custom emoji and disabled controls; the full conversation MUST demonstrate a host-acknowledged stop returning to idle and a new idle submission starting a busy response.
- Footer and reactions MUST work with externally owned TranscriptController instances; MarkdownComposer MUST allow its send control to be omitted when the fixed footer owns sending, without losing editor identity or formatting controls.

## DC-CHAT-012 — Editing acknowledged comments

**Requirement.** TranscriptController MUST preserve acknowledged comments while submitting host-authorized, versioned replacement drafts.

### Acceptance details

- Editing MUST require an available source, an authored current sent/replied comment with a host version and explicit host capability, and MUST resume an existing replacement draft rather than duplicate it.
- Submission MUST include the exact original comment/message/version identity without mutating the acknowledged text or source anchor.
- Only explicit publication acknowledgement MAY retire the replaced version, while rejection, queued delivery and unknown outcomes retain it alongside the replacement draft or pending version.
- Acknowledgement MUST preserve newer draft edits and use host-returned comment versions for subsequent editing, with missing versions preventing another edit until the host supplies one.

## DC-CHAT-010 — XML prompt context

**Requirement.** PromptContext and promptElementsExtension MUST adapt jj-store's inert XML-style context presentation through Mira's public preview extension API.

### Acceptance details

- Arbitrary tag names and attributes MUST remain escaped display text, with nested safe Markdown, compact single-line sections and accessible disclosures; source tags MUST NOT execute HTML, scripts or host commands.
- Inline/fenced code, malformed or excessively nested elements MUST retain their original text without guessed hidden boundaries, while UTF-16 offsets, Unicode and document references remain intact.
- Root Markdown MUST align with top-level tag labels using logical inline padding, while expanded element bodies MUST begin beyond their parent tag label, with each nested body retaining a visible indentation step.
- The extension MUST compose with host-owned Markdown hooks in standalone previews, Transcript context blocks and captured Markdown readers, retaining the exact captured text and anchors independently of rendering; the catalog MUST expose a direct recorded XML/Markdown example and keep that context discoverable in the full transcript.

## DC-CHAT-011 — Sent-context disclosure

**Requirement.** SentContext MUST reproduce jj-store's compact application-context disclosure before authored prompt content, with explicit host-owned delivery and one rendered/raw panel.

### Acceptance details

- Prepared, queued, sent, failed and unknown delivery MUST retain distinct labels, with a trailing expansion chevron, subtle resting surface and neutral hover; absent or blank captured content MUST render no disclosure regardless of raw data.
- Expansion, raw selection and nested XML reader identity MUST survive delivery acknowledgements, raw/rendered switching and collapse/reopen without rewriting captured content; keyboard controls MUST retain visible focus and accessible names.
- The bounded panel MUST use shared ScrollArea, safe PromptContext Markdown/XML and an icon-only raw toggle; hosts supply exact raw text and Markdown hooks without shared schema interpretation, transport or receipt inference.
- TranscriptItem MAY provide this context separately from authored blocks; the disclosure MUST precede message content, and recorded examples MUST distinguish demo context from captured delivery evidence.

## DC-CHAT-013 — Markdown composer suggestions

**Requirement.** MarkdownComposer MUST support neutral asynchronous trigger suggestions through public Mira and CodeMirror APIs.

### Acceptance details

- Suggestions MUST retain existing ComposerTrigger search and insertion contracts with keyboard navigation, selection replacement and host-supplied labels; each label occupies the first row, with its description wrapping beneath it without shrinking the label to zero width or overlapping it.
- Completion tooltips MUST mount outside clipped editor ancestors in the owner document, remain pointer-selectable in Chromium and WebKit, and be removed on teardown, with aborted, stale, disabled or disposed searches unable to replace newer results or mutate the retained draft.
- IME composition and escaped inline or fenced code MUST not trigger unintended insertion or message submission.
- Completion handling MUST claim Enter only for a registered trigger query and accept its selected item with unmodified Tab; Shift+Enter, Shift+Tab, Tab without a selected suggestion and ordinary document newlines MUST retain their existing behavior without submitting a message.

## DC-CHAT-014 — Thread panel

**Requirement.** ThreadPanel MUST compose host-owned nested messages, reactions, history and controlled drafts without owning transport or persistence.

### Acceptance details

- Stable message IDs and explicit parent IDs MUST determine reply order and bounded connector geometry while missing parents and cycles remain readable.
- Reply selection and source navigation MUST focus the retained composer without clearing its draft.
- Submission MUST emit exact text and parent identity while failed or unacknowledged submissions retain the draft and newer edits.
- Message actions, author details, Markdown extensions, loading history and disabled controls MUST compose existing shared primitives.

## DC-CHAT-015 — Reply participant summaries

**Requirement.** Transcript reply metadata MUST reuse the shared AvatarGroup in document and classic presentations with separate participant details and reply navigation controls.

### Acceptance details

- The compact group MUST use the `xs` size and preserve supplied participant order, images, emoji, initials, shape and background.
- The separate labelled reply control MUST own keyboard activation and navigation callbacks while participant details remain outside it without nested buttons.
- Optional author presentation MUST compose the same shared AuthorCard for reply participants, retaining host-owned descriptions, details and actions.
- Reply-link decoration MUST apply only to the count label, leaving participant avatars separate and undecorated.

## DC-CHAT-016 — Inline references

**Requirement.** Chat references MUST share InlineReference/ReferenceChip rendering across composer widgets, Markdown preview and transcript readers through host-supplied codecs and activation callbacks.

Absent chip and suggestion fields MUST be omitted at strict public boundaries;
reactive optional activation and profile values MAY clear to undefined without
weakening exact-optional-property checking.

### Acceptance details

- Public extension and suggestion helpers MUST preserve source text and UTF-16 offsets, ignore code/images and leave unresolved links readable; Markdown serialization is the default and explicit host codecs MUST NOT widen safe-link policy or dispatch work.
- Person/agent mentions MUST retain jj-store's filled inline chip geometry in preview and composer, with optional host profile popovers and exact-range composer removal; mounted references MUST release owned components and selection MUST reveal source.
- Removable references MUST contain their removal button within the filled chip and align inline text baselines; Document composer insets MUST retain fully visible task checkboxes.
- Paired stories MUST render the same source and configuration, including person/agent avatars, repository icons, custom emoji and ordinary links; token defaults and public usage MUST be documented.
