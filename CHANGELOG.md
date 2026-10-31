# @lapismd/design-core

## 0.7.2

### Patch Changes

- [#43](https://github.com/lapismd/design-core/pull/43) [`48f9820`](https://github.com/lapismd/design-core/commit/48f9820f5216f6a4b65b0dd6f9e37bc80994328c) Thanks [@stevejuma](https://github.com/stevejuma)! - Preserve mounted status controls during metadata updates and keep Explorer
  reveal flashes from stealing later input focus. Use theme foreground on outline
  and ghost buttons, and fit nested or transparent column content while excluding
  hidden subtrees.

  Consume the patched Minimatch release for editor associations while preserving
  matching and specificity behavior.

## 0.7.1

### Patch Changes

- [#38](https://github.com/lapismd/design-core/pull/38) [`e03b677`](https://github.com/lapismd/design-core/commit/e03b6776d20e7506eacb6e048c9726a0bc77d64c) Thanks [@stevejuma](https://github.com/stevejuma)! - Fence composer completion callbacks after their owning editor is destroyed so
  conversation switching and comment teardown do not read retired reactive state.

- [#40](https://github.com/lapismd/design-core/pull/40) [`86f0182`](https://github.com/lapismd/design-core/commit/86f01828f129eae21536b1ea94a01897c3081649) Thanks [@stevejuma](https://github.com/stevejuma)! - Restore the latest focus target without reading destroyed surface-owner props,
  and retain accessible selected Filter Command Picker text in Lapis dark mode.

- [#40](https://github.com/lapismd/design-core/pull/40) [`3b0392c`](https://github.com/lapismd/design-core/commit/3b0392ca4a15a2e88cc7ce43a3bf4f0ea58e99fa) Thanks [@stevejuma](https://github.com/stevejuma)! - Retain the transcript's bottom lock when a delayed scroll event arrives after
  captured output grows, while preserving deliberate upward reading.

## 0.7.0

### Minor Changes

- [#33](https://github.com/lapismd/design-core/pull/33) [`1ec9aec`](https://github.com/lapismd/design-core/commit/1ec9aecb9127770fe20c42f1614b742712575c7b) Thanks [@stevejuma](https://github.com/stevejuma)! - Add the themed Radio Group foundation for single-choice forms, with native CSS,
  public styling tokens and accessible keyboard interaction. Retain compound style
  ownership and semantic FieldLabel relationships during registry conversion.

- [#33](https://github.com/lapismd/design-core/pull/33) [`7e19dba`](https://github.com/lapismd/design-core/commit/7e19dbac457068094af452634575ffa3c7380260) Thanks [@stevejuma](https://github.com/stevejuma)! - Support custom statusContent in Composer and MarkdownComposer so hosts can compose shared message metadata inside the attached footer. Custom content owns its accessible announcement, and error banners use semantic red text and icons on a tinted background. Dark themes use a lighter semantic red for readable error contrast; shared MessageMetadata inherits the attached footer typography so it matches ordinary composer status feedback.

- [#33](https://github.com/lapismd/design-core/pull/33) [`acf9a53`](https://github.com/lapismd/design-core/commit/acf9a53c935d91233893f29b78da135557100019) Thanks [@stevejuma](https://github.com/stevejuma)! - Add shared source-preserving chat reference rendering and host codecs, inline comment suggestions, and configurable transcript actions using MessageActions. Keep icon-only comment actions clear of tool controls and omit wholly unavailable hover bars.

  Retain jj-store's filled author chip in preview and composer, optional host
  profile hover cards, and source-preserving composer removal.

- [#33](https://github.com/lapismd/design-core/pull/33) [`ce47a52`](https://github.com/lapismd/design-core/commit/ce47a523ab90bf83e1aa74bb2239d3526095b835) Thanks [@stevejuma](https://github.com/stevejuma)! - Add a CommentComposer actions slot and keep transcript hover controls in the same row before the formatting toggle. Hidden controls reserve no width, and visible controls stay within the comment without covering its text.

- [#33](https://github.com/lapismd/design-core/pull/33) [`19bd7f8`](https://github.com/lapismd/design-core/commit/19bd7f8ded14d6eade213f97c417ebd69b79c5a5) Thanks [@stevejuma](https://github.com/stevejuma)! - Add a right-aligned formatting toggle to CommentComposer using shared Markdown actions and public Mira commands. Support semantic destructive disclosure tones and compact trailing tool/disclosure spacing in Transcript.

- [#33](https://github.com/lapismd/design-core/pull/33) [`b70c26f`](https://github.com/lapismd/design-core/commit/b70c26fcc7a393040a86cce9143f5f43466ad46d) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep comment formatting controls at the far right without hidden hover-action width, align toolbar glyphs with the text, and include the shared emoji picker with optional host palettes and custom emoji serialization.

- [#33](https://github.com/lapismd/design-core/pull/33) [`0620055`](https://github.com/lapismd/design-core/commit/0620055347d8c6aa3efc7a35b1163976d5f0f407) Thanks [@stevejuma](https://github.com/stevejuma)! - Extend diff collections with host content, intrinsic sizing, continuous sections, complete header disclosure, unchanged-context folding, conflict indicators and aggregate directory statistics. Preserve selected frames and opaque sticky headers.

  Isolate nested AppShell responsive styles, support Column Canvas fit/default-width toggling, honor document composer host minima, retain retry after rejected Explorer opens, and improve warning-tag and themed search-placeholder contrast.

- [#33](https://github.com/lapismd/design-core/pull/33) [`625f2da`](https://github.com/lapismd/design-core/commit/625f2da80084a76e51625846a1c4cfe1088bd185) Thanks [@stevejuma](https://github.com/stevejuma)! - Add a filename-based FileTypeIcon with xs, s, md and lg sizes, native styling tokens and a curated Material artwork subset covering developer and personal-vault files. Use it in default file listings, diff and merge headers, captured chat files, normalized tool read/edit/search results and default Explorer file rows while preserving host icon overrides, status indicators and exact navigation targets.

- [#33](https://github.com/lapismd/design-core/pull/33) [`4bca9ab`](https://github.com/lapismd/design-core/commit/4bca9ab6e4d06d05fcd1a9bdc9bcc517d5945230) Thanks [@stevejuma](https://github.com/stevejuma)! - Add opt-in responsive topbar placement, attached sidebar surfaces and shared rail
  sections, plus overlay-page footer and close controls with child-owned scrolling
  and responsive inset tokens. Retain existing shell defaults and persistence.
  Coalesce shell geometry measurements to prevent ResizeObserver loop diagnostics.

### Patch Changes

- [#33](https://github.com/lapismd/design-core/pull/33) [`6fe8ef0`](https://github.com/lapismd/design-core/commit/6fe8ef0c5ca5650c86320261fd5beacc2460ced3) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep Avatar image failures scoped to their original image request. Late failures no longer read destroyed parent state or replace a newer image with initials.

- [#33](https://github.com/lapismd/design-core/pull/33) [`525b4bb`](https://github.com/lapismd/design-core/commit/525b4bb98aa1f29db98c13ed52e3496688933d2f) Thanks [@stevejuma](https://github.com/stevejuma)! - Retain the captured comment thread while its Markdown quote is being removed.

- [#33](https://github.com/lapismd/design-core/pull/33) [`1c49b33`](https://github.com/lapismd/design-core/commit/1c49b33cf81a008b30b3cdcd0ff5d174d9d1ec4e) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep the Document MarkdownComposer input framed while an attached status is present, so warning/error banners join the same opaque body as Classic view. Restore the prose surface when feedback clears without remounting the editor or losing drafts.

- [#33](https://github.com/lapismd/design-core/pull/33) [`36110ae`](https://github.com/lapismd/design-core/commit/36110ae43a965ed590dba8e795c15e06149060eb) Thanks [@stevejuma](https://github.com/stevejuma)! - Make expanded transcript comment quotes share their enclosing context background.
  Request host removal on plain Backspace in an already empty editable comment,
  retaining the editor when deleting its final character and protecting blocked or
  composing editors.

## 0.6.0

### Minor Changes

- [`c7c042f`](https://github.com/lapismd/design-core/commit/c7c042f24e54ca8af7b03da938cbd00cba33b218) Thanks [@stevejuma](https://github.com/stevejuma)! - Add avatar groups, author cards, reference chips, link previews, spoilers, relative timestamps, exact unit-aware numeric inputs, Markdown composer suggestions and nested thread presentation using host-owned data and callbacks.

- [`b7473b0`](https://github.com/lapismd/design-core/commit/b7473b04c29eb4d9102c3eda1b79917ef0882ac3) Thanks [@stevejuma](https://github.com/stevejuma)! - Add shared Transcript, HistoryEdge, exact-anchor comment coordination and comment
  queue/reply navigation with jj-store presentation and host-owned delivery.

- [`a007abd`](https://github.com/lapismd/design-core/commit/a007abd0fd8c50957cb868f7872c45246a753df3) Thanks [@stevejuma](https://github.com/stevejuma)! - Add host-owned transcript footer, queued-message presentation, XML prompt context, sent-context disclosures, reactions and author popovers with shared status banners and tighter Markdown parity.

### Patch Changes

- Keep visible values, avatar initials, counts and complete rich-row text in accessible control names across Forms, Filter, Shell, Workspace and AI presentation.
- Pin the already qualified Vaul Svelte Drawer preview instead of the floating next tag.

- [`fd2a327`](https://github.com/lapismd/design-core/commit/fd2a327f65c7177d7aa82acbe7ec6f7e2e504af8) Thanks [@stevejuma](https://github.com/stevejuma)! - Use compact shared AvatarGroup presentation beside Transcript reply links,
  retain participant tooltips and hover stacking, and document all supported sizes.
  Keep reply underlines on the count text and use a consistent compact rhythm for
  transcript tool and file disclosures.

  Allow AuthorCard member composition in AvatarGroup and reuse optional shared
  AuthorCards for all Transcript identities, with configurable hover/click behavior.

- [`a57a38e`](https://github.com/lapismd/design-core/commit/a57a38e24c0f79a5702e2666b5e35041d6babdf4) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep default syntax highlighting and small error-status labels readable in dark mode while preserving explicit syntax themes. Retain complete visible tool-disclosure labels and accessible execution status in the 0.5 package.

  Retain readable tool-failure text and deletion counts on Lapis light and dark surfaces.

- [`714f487`](https://github.com/lapismd/design-core/commit/714f487764b35d550b36255711c3c28b4b6b3fc6) Thanks [@stevejuma](https://github.com/stevejuma)! - Await admitted App Shell plugin transitions and persistence before stopping plugins, and expose a host flush boundary.

- [`bb8b341`](https://github.com/lapismd/design-core/commit/bb8b34103902f45f26e2a752a5c38beae951427a) Thanks [@stevejuma](https://github.com/stevejuma)! - Surround the FilePathInput path and Browse button with one shared focus ring,
  including keyboard navigation, invalid fields and forced-colors presentation.

- [`f4b01a3`](https://github.com/lapismd/design-core/commit/f4b01a3c0415bb59f88b669698ec079f2e66b26a) Thanks [@stevejuma](https://github.com/stevejuma)! - Use PanelToggleIcon in Workspace, AppShell, Sidebar and mobile visibility controls,
  preserving controller behavior and each surface's sizing. Sidebar.Trigger accepts
  an optional left/right side.

- [`9a6bfa1`](https://github.com/lapismd/design-core/commit/9a6bfa196e698a693227ab718c0468e82204e6d0) Thanks [@stevejuma](https://github.com/stevejuma)! - Indent expanded XML prompt-context bodies beyond their parent tag labels, keeping
  nested Markdown and child sections visually inside their owning element.

- [`068a97b`](https://github.com/lapismd/design-core/commit/068a97b0ad90250444fbb5e31390712ddc429ef4) Thanks [@stevejuma](https://github.com/stevejuma)! - Align root Markdown in prompt context with the top-level XML tag labels without
  adding extra indentation to nested bodies.

- [`f81d890`](https://github.com/lapismd/design-core/commit/f81d8909b17962eb57b42c98dcbc2ba775a42b3c) Thanks [@stevejuma](https://github.com/stevejuma)! - Consume published Mira 0.1 with table readers, refresh Visual Delta readiness tooling, and update patched Storybook/Vite development tools. Keep screenshot comparison outside CI.

- [`b3fb5ea`](https://github.com/lapismd/design-core/commit/b3fb5ea7cf2556e8eea35da2eb00dd1a4465806f) Thanks [@stevejuma](https://github.com/stevejuma)! - Match search focus borders and rings to shadcn Input and stack sans-serif suggestion labels above descriptions.

- [`187194b`](https://github.com/lapismd/design-core/commit/187194b3a6c6f2502712c44d79e377205e0a367b) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep closed AppShell sidebars out of the layout when consumer visibility is restored after Settings navigation.

- [`e0ca382`](https://github.com/lapismd/design-core/commit/e0ca382fd43f0dd32f131c3fedfa3269e999dba5) Thanks [@stevejuma](https://github.com/stevejuma)! - Restore compact Workspace tab hit targets so selection, native dragging and
  insertion remain stable while hovering menu and close controls.

- [`fd2a327`](https://github.com/lapismd/design-core/commit/fd2a327f65c7177d7aa82acbe7ec6f7e2e504af8) Thanks [@stevejuma](https://github.com/stevejuma)! - Use the shared PanelToggle's default button styling and hover/focus behavior for
  Workspace sidebar and bottom-panel controls. Keep standard icons fixed at 16px
  when expanded and preserve controller actions, labels, hints and drag exclusions.

## 0.5.1

### Patch Changes

- [#29](https://github.com/lapismd/design-core/pull/29) [`41efbc9`](https://github.com/lapismd/design-core/commit/41efbc9b68652c03ad92d15353e8c13b4f827492) Thanks [@stevejuma](https://github.com/stevejuma)! - Preserve text and keyboard caret movement when typing begins before an
  autocomplete's deferred opening selection. This also prevents the first
  character of a new chip value from being replaced.

## 0.5.0

### Minor Changes

- [#27](https://github.com/lapismd/design-core/pull/27) [`24e6c27`](https://github.com/lapismd/design-core/commit/24e6c2774ae3f6ded9937f831f5df2b1ab73ae89) Thanks [@stevejuma](https://github.com/stevejuma)! - Add a compact TagList with measured ordered overflow, optional icons, semantic
  tones, controlled active states, accessible tooltips and an all-tags popover.
  Compose existing chip primitives with native CSS and host-owned callbacks.

## 0.4.0

### Minor Changes

- [#25](https://github.com/lapismd/design-core/pull/25) [`ed1b35f`](https://github.com/lapismd/design-core/commit/ed1b35f7e1b36986309be386ce93e8612b3ac90c) Thanks [@stevejuma](https://github.com/stevejuma)! - Add controlled MarkdownComposer and host-supplied MessageActions to Chat, and
  extend ReactionBar with custom-image emoji and disabled/restricted selection
  while retaining experimental imports. Composer can retain submitted drafts.
  Add CommentComposer for compact inline and captured-source comment drafts.

### Patch Changes

- [#25](https://github.com/lapismd/design-core/pull/25) [`ed1b35f`](https://github.com/lapismd/design-core/commit/ed1b35f7e1b36986309be386ce93e8612b3ac90c) Thanks [@stevejuma](https://github.com/stevejuma)! - Prepare plain browser CSS and licensed font assets in published archives so
  consumers do not need Tailwind compilation or source scanning. Keep authoring
  tools in development dependencies and audit packaged CSS for utility leakage.

  Repair compound component selectors and reject utility leakage in source and
  archive checks. Preserve compact cards, disabled fields, tab indicators and
  joined toggles; expose semantic section dividers without utility classes.

- [#25](https://github.com/lapismd/design-core/pull/25) [`ed1b35f`](https://github.com/lapismd/design-core/commit/ed1b35f7e1b36986309be386ce93e8612b3ac90c) Thanks [@stevejuma](https://github.com/stevejuma)! - Add ResponsiveTabs, Avatar, AvatarPicker and AppShell.Topbar with native CSS,
  controlled host-owned values and public review examples. Introduce the Chat
  entry point and safe Mira MarkdownContent while preserving existing AI imports.
  Qualify the published Mira 0.0.5 dependency and expose Chat in the offline catalog.

  Add normalized rich tool details with formatted/raw switching and shell, file,
  diff and search presentation, plus optional ToolCalls presentation data.

- [#25](https://github.com/lapismd/design-core/pull/25) [`ed1b35f`](https://github.com/lapismd/design-core/commit/ed1b35f7e1b36986309be386ce93e8612b3ac90c) Thanks [@stevejuma](https://github.com/stevejuma)! - Add a shared EmojiPicker with a lazily loaded full catalog, search, categories,
  skin tones, suggested reactions and custom-image emoji. Preserve explicit
  restricted lists, string selection callbacks and existing AI experimental imports.

  Provide controlled opening, custom trigger content, explicit themes and native
  component CSS without requiring Tailwind tooling.

## 0.3.5

### Patch Changes

- [#23](https://github.com/lapismd/design-core/pull/23) [`dde430a`](https://github.com/lapismd/design-core/commit/dde430a6854a0d303bc56d73e646ede22864137e) Thanks [@stevejuma](https://github.com/stevejuma)! - Allow controlled full-width Settings adapters to place header controls beside their label. Keep file inputs and their native file-selection button within the shared Settings control height.

## 0.3.4

### Patch Changes

- [#21](https://github.com/lapismd/design-core/pull/21) [`81c077a`](https://github.com/lapismd/design-core/commit/81c077a4eda3fa669e36007ee72edbb5904a4afc) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep Settings labels readable at constrained widths and place action feedback across the full row below its controls.

## 0.3.3

### Patch Changes

- [#19](https://github.com/lapismd/design-core/pull/19) [`9732cad`](https://github.com/lapismd/design-core/commit/9732cad5a2c526ecf9b9e649a9964bc28ed08d8a) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep the visible mobile tab count in the accessible action name without punctuation separating the count from its action.

- [#19](https://github.com/lapismd/design-core/pull/19) [`05ebff3`](https://github.com/lapismd/design-core/commit/05ebff382e0848f9ebcf8df0eaece3a88d3e8fde) Thanks [@stevejuma](https://github.com/stevejuma)! - Include visible status segments and shortened copyable values in their accessible names while retaining tooltip context and the full copy payload.

## 0.3.2

### Patch Changes

- [#17](https://github.com/lapismd/design-core/pull/17) [`54e7bac`](https://github.com/lapismd/design-core/commit/54e7bacf1261bb5450bbb16a72c367d74eb86674) Thanks [@stevejuma](https://github.com/stevejuma)! - Use bold section headings in Lapis workspace settings and allow hosts to reserve the full native window-controls inset when a tab group is maximized.

- [#17](https://github.com/lapismd/design-core/pull/17) [`fd6bd54`](https://github.com/lapismd/design-core/commit/fd6bd54b9357f4358d8858b20b0ce771c5cce6f4) Thanks [@stevejuma](https://github.com/stevejuma)! - Align line-tab selection indicators with the divider and remove teleported mobile sidebar content when its owning shell is destroyed.

  The dev catalog and browser runner share explicit runtime/icon prebundling.
  Pointer suites wait for the client compiler to prepare shared entries before
  starting their existing interaction readiness clocks.
  Workspace pointer acceptance runs serially, matching the catalog's existing
  lifecycle policy and other pointer lanes, so concurrent cold compilation cannot
  starve a second scenario's unchanged readiness deadline.

## 0.3.1

### Patch Changes

- [#16](https://github.com/lapismd/design-core/pull/16) [`f94fb98`](https://github.com/lapismd/design-core/commit/f94fb9852f6c3e54ea57f89c2f185b6f00c68e35) Thanks [@stevejuma](https://github.com/stevejuma)! - Release the Composer Input handle correctly through reactive consumer bindings during teardown while preserving replacement handles. Keep Svelte runtime diagnostics fatal even when component cleanup catches the immediate error.

- [#13](https://github.com/lapismd/design-core/pull/13) [`5f533e6`](https://github.com/lapismd/design-core/commit/5f533e656601015b5a5dd3a680f5e97fd13cd1d2) Thanks [@stevejuma](https://github.com/stevejuma)! - Preserve emoji-grid keyboard focus when delayed popover opening frames complete.

- [#15](https://github.com/lapismd/design-core/pull/15) [`02756cb`](https://github.com/lapismd/design-core/commit/02756cb32a5405db45cb47cae9e28d448d20651f) Thanks [@stevejuma](https://github.com/stevejuma)! - Require Bits UI 2.19.5 to prevent Scroll Area resize callbacks and text-selection pointer handlers from reading destroyed Svelte state. Make Svelte runtime diagnostics fatal in Storybook tests and preserve the editing Dialog Frame example's initial field focus.

## 0.3.0

### Minor Changes

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Support application-controlled notification toasts with stable records, severity icons and colors, dismissal/action callbacks and interaction-aware timers. The optional viewport portal retains modal keyboard access and cleans up on teardown; the existing app-backed API remains compatible.

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Add `inputMode="custom"` to SearchFilterBar and SearchFilterInput for host-provided CodeMirror grammars, highlighting and completions. Reactive extension changes retain the draft, selection and undo history while using the shared accessible input and error chrome.

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Add optional borderless search focus, multiline editor semantics and clearer invalid-query feedback.

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Add delayed collapsed-column previews, interactive trailing canvas content,
  compact panel toggles, lazy and virtualized file listings, and merge header
  controls that preserve drafts and scrolling. Preserve strict consumer types,
  host-controlled tool-call presentation, and settings heading typography.

  Refresh Mira's range to admit compatible pre-1.0 patches, and move validation to
  the published optional-search Spec Validator and maintained Changesets toolchain.

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Support fixed Column Canvas layouts inside styled Scroll Areas, including sticky
  return rails. Add explicit scroll strategies to column bodies, Command View
  lists and FileDiff panes, and an opt-in filled Scroll Area content layout.
  Keep inactive tab labels opaque.
  Allow hosts to distinguish split diff pane landmarks, and cancel queued canvas
  measurements after teardown.

  Expose opt-in native File Listing file and directory drag callbacks and host
  eligibility predicates while retaining ordinary selection and disclosure.

### Patch Changes

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Expose the AI chat typography scale token without changing geometry and accept the host native Scroll Area strategy for safe view teardown.

- [#10](https://github.com/lapismd/design-core/pull/10) [`eeb8cdf`](https://github.com/lapismd/design-core/commit/eeb8cdf0bb9a2688e3c4ca74e16f18102fb2336a) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep the App Shell mobile stage semantically neutral so consumer landmarks contain all accessible application content.

## 0.2.0

### Minor Changes

- [#7](https://github.com/lapismd/design-core/pull/7) [`737c657`](https://github.com/lapismd/design-core/commit/737c65727a6beaeb6955a652aba67c42b882b222) Thanks [@stevejuma](https://github.com/stevejuma)! - Add composable same-side App Shell panels, responsive main-surface replacement, transparent rails, external controller toggles, and structural surface layers.

### Patch Changes

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Relicense the published Design Core package to Apache 2.0.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Tighten shared Tooltip padding and type so compact overlays no longer inherit oversized content chrome.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Expose controlled multi-file review state, host-owned line annotations, leading file headers, and gutter line actions. Diff helpers stay compatible with strict TypeScript consumers.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep mobile App Shell panels visible while focus moves between the trigger and the opened surface.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Add opt-in `MessageList` virtualization while keeping the default unvirtualized chat layout. History scrolling now preserves user intent across measurements, state saves, and parent updates.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Add shared dialog frames, inset large frames, and retryable confirmations. Portal updates keep dialog controls mounted, and dialog headings stay out of document landmarks.

- [#7](https://github.com/lapismd/design-core/pull/7) [`80937e0`](https://github.com/lapismd/design-core/commit/80937e0f01e8dda50cbbed45da4948736ec3035b) Thanks [@stevejuma](https://github.com/stevejuma)! - Export shared `ToolCallDetail` presentation so hosts can render tool payloads, summaries, and expandable detail without forking chat markup.

## 0.1.2

### Patch Changes

- [#2](https://github.com/lapismd/design-core/pull/2) [`af3a0b3`](https://github.com/lapismd/design-core/commit/af3a0b3aaabd24be368acea795b150af8f4e5b89) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep workspace menu close handling lifecycle-safe when an action callback destroys its owning view.

- [#4](https://github.com/lapismd/design-core/pull/4) [`d153167`](https://github.com/lapismd/design-core/commit/d15316795ce7601a483796bce23f78bfc37188ae) Thanks [@stevejuma](https://github.com/stevejuma)! - Allow App Shell body content and body sidebar regions to configure scroll, hover, or always-on scrollbar visibility independently.

- [#4](https://github.com/lapismd/design-core/pull/4) [`31c7a2c`](https://github.com/lapismd/design-core/commit/31c7a2cb438213d75a5ef3193e957cd7c35dc34f) Thanks [@stevejuma](https://github.com/stevejuma)! - Inset vertical and horizontal Scroll Area thumbs by one pixel from their outer edge.

- [#4](https://github.com/lapismd/design-core/pull/4) [`24a6e98`](https://github.com/lapismd/design-core/commit/24a6e989354b9d00d2d93786e4255da088812ee9) Thanks [@stevejuma](https://github.com/stevejuma)! - Expose the canonical two-expanded-sidebars App Shell fixture, including bounded content extension points and an optional right-sidebar toggle, for downstream Storybook catalogs. Keep the focused Search Filter Bar source export compatible with strict consumers.

- [#4](https://github.com/lapismd/design-core/pull/4) [`413139d`](https://github.com/lapismd/design-core/commit/413139d1269d5f939d20c1f00de45f151372eae0) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep composed Shadcn, AI, and Filter source exports compatible with strict consumers that enable exact optional properties and unchecked indexed access.

- [#4](https://github.com/lapismd/design-core/pull/4) [`61fa863`](https://github.com/lapismd/design-core/commit/61fa86315a840717c39f0a0701d8cb208a187cb2) Thanks [@stevejuma](https://github.com/stevejuma)! - Keep the public App Shell source compatible with consumers that enable exact optional-property semantics.

## 0.1.1

### Patch Changes

- [`d1dc4a8`](https://github.com/lapismd/design-core/commit/d1dc4a8fb13eec9b59075712f964a89cee18a1a8) Thanks [@stevejuma](https://github.com/stevejuma)! - Allow custom settings pages to contribute dynamic search entries and reveal the selected row before Design Core scrolls to and highlights it.

## 0.1.0

### Initial public release

- Publish the Svelte 5 Design Core package boundary for shadcn, forms, filter,
  AI, diff, shell, workspace, styles, themes, and catalog layout imports.
- Include canonical styling guidance and public source exports while omitting
  Storybook stories, tests, examples, local caches, and generated catalog output
  from the npm artifact.
- Keep Visual Delta comparison available as an explicit review command while
  removing it from release-blocking aggregate checks for the initial npm
  bootstrap.
