# @lapismd/design-core

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
