# @lapismd/design-core

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
