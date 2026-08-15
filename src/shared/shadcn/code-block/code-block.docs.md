# Code Block

Fenced, syntax-highlighted code with optional header, line numbers, copy,
collapse, and syntax themes. Project-authored Astryx-inspired primitive — see
`spec/records/code-and-code-block.md`.

## Import

```ts
import {
  CodeBlock,
  defineSyntaxTheme,
  dracula,
} from "@lapismd/design-core/shadcn/code-block";
```

## Usage

```svelte
<script lang="ts">
  import { CodeBlock } from "@lapismd/design-core/shadcn/code-block";

  const code = `const answer = 42;`;
</script>

<CodeBlock {code} language="javascript" title="demo.js" hasLineNumbers />
```

## Key props

| Prop             | Type                            | Default       | Description           |
| ---------------- | ------------------------------- | ------------- | --------------------- |
| `code`           | `string`                        | required      | Source text           |
| `language`       | `string`                        | `"plaintext"` | Tokenizer language id |
| `title`          | `string`                        | —             | Header label          |
| `hasLineNumbers` | `boolean`                       | `false`       | Line gutter           |
| `hasCopyButton`  | `boolean`                       | `true`        | Clipboard control     |
| `highlightMode`  | `"auto" \| "ranges" \| "spans"` | `"auto"`      | Highlight strategy    |
| `syntaxTheme`    | `SyntaxThemeDefinition`         | —             | Per-instance theme    |
| `container`      | `"card" \| "section"`           | `"card"`      | Surface style         |
| `isCollapsible`  | `boolean`                       | `false`       | Collapse long blocks  |

## Related

- **Code** — inline prose references
- **Code Highlighter** (forms) — Lezer/`parser` form previews
- Community presets and licenses:
  `src/shared/shadcn/code-block/syntax/THIRD_PARTY_LICENSES.md`
