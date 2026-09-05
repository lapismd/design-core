# @lapismd/design-core

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
