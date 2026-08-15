# Shared Code and Code Block

Non-normative implementation and provenance record for the project-authored
`@lapismd/design-core/shadcn/code` and `@lapismd/design-core/shadcn/code-block` families.
The canonical contract is
[`DC-SHA-007` and `DC-SHA-008`](../src/shadcn/actions-and-content.md).

## Classification and provenance

- Layer: generic shared primitives under `src/shared/shadcn/code` and
  `src/shared/shadcn/code-block`.
- Source: project-authored native Svelte and CSS. Public anatomy and behavior
  are adapted from [facebook/astryx](https://github.com/facebook/astryx)
  Content primitives; the React/StyleX implementation is not copied.
- Pinned upstream commit:
  [`bdc7cdee6d17a5630445072ca4a125659e329bf7`](https://github.com/facebook/astryx/tree/bdc7cdee6d17a5630445072ca4a125659e329bf7)
- References:
  - [`packages/core/src/Code`](https://github.com/facebook/astryx/tree/bdc7cdee6d17a5630445072ca4a125659e329bf7/packages/core/src/Code)
  - [`packages/core/src/CodeBlock`](https://github.com/facebook/astryx/tree/bdc7cdee6d17a5630445072ca4a125659e329bf7/packages/core/src/CodeBlock)
  - [`packages/core/src/theme/syntax`](https://github.com/facebook/astryx/tree/bdc7cdee6d17a5630445072ca4a125659e329bf7/packages/core/src/theme/syntax)
  - Docs: https://astryx.atmeta.com/components/Code ,
    https://astryx.atmeta.com/components/CodeBlock
- License: MIT, copyright Meta Platforms, Inc. Community syntax presets carry
  separate MIT attributions in
  `src/shared/shadcn/code-block/syntax/THIRD_PARTY_LICENSES.md`.
- Registry status: no shadcn-svelte registry item. Do not install with the raw
  upstream CLI.
- Dependencies: shared Button for the copy control; Lucide icons.

## Boundary vs forms editors

| Surface                           | Use when                                                                                     |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `Code` / `CodeBlock`              | Inline or fenced presentation; language string; chrome (title, copy, line numbers, collapse) |
| Forms `CodeHighlighter`           | Read-only form preview with a required Lezer `parser`                                        |
| Forms `CodeEditor` / `YamlEditor` | Editable CodeMirror form fields                                                              |

AI markdown/code rendering stays consumer-supplied through Svelte snippets
([`astryx-ai-components.md`](./astryx-ai-components.md)). Hosts may compose these shadcn primitives inside
message content.

## Public contract

### Code (`@lapismd/design-core/shadcn/code`)

- Styled `<code>` with `color?: "primary" | "secondary" | "inherit"` and
  `size?: "inherit"`.
- Children via snippet.

### CodeBlock (`@lapismd/design-core/shadcn/code-block`)

Props aligned with upstream: `code`, `language`, `title`, `hasLanguageLabel`,
`hasLineNumbers`, `highlightLines`, `hasCopyButton`, `onCopy`, `isWrapped`,
`maxHeight`, `size` (`sm` | `md`), `width`, `container` (`card` | `section`),
`tokenizer?`, `highlightMode` (`auto` | `ranges` | `spans`), `syntaxTheme?`,
`isCollapsible`, `collapsibleThreshold`.

Also exports tokenizer helpers, highlight helpers, `defineSyntaxTheme`,
`SyntaxTheme`, and community presets.

## Required behavior

- Span fallback and CSS Custom Highlight API (`ranges`) with Safari → spans in
  `auto` mode.
- Sync/async tokenization with `SYNC_TOKENIZE_THRESHOLD`.
- Copy announces via a polite live region; copy must not toggle collapse.
- Collapsible disclosure: `aria-expanded` / `aria-controls`, region stays
  mounted, `inert` when collapsed.
- Scroll container keyboard-focusable (`role="group"`).

## Verification

- Unit: tokenizer, highlight ranges, Code/CodeBlock behavior.
- Storybook: colocated `Shadcn/Code` and `Shadcn/Code Block` stories with play
  coverage; `skip-visual` until explicit baseline approval.
- `pnpm checks` after the slice lands.
