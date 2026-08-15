# Code

Inline `<code>` for short references (APIs, flags, identifiers) inside prose.
Project-authored Astryx-inspired primitive — see `spec/records/code-and-code-block.md`.

## Import

```ts
import { Code } from "@lapismd/design-core/shadcn/code";
```

## Usage

```svelte
<script lang="ts">
  import { Code } from "@lapismd/design-core/shadcn/code";
</script>

<p>Use <Code>const x = 1</Code> to declare a variable.</p>
```

## Props

| Prop       | Type                                    | Default     | Description                 |
| ---------- | --------------------------------------- | ----------- | --------------------------- |
| `color`    | `"primary" \| "secondary" \| "inherit"` | `"primary"` | Text color                  |
| `size`     | `"inherit"`                             | —           | Match surrounding font size |
| `children` | snippet                                 | —           | Code content                |

## Related

- **Code Block** (`@lapismd/design-core/shadcn/code-block`) — fenced multi-line snippets
- **Code Highlighter** (`@lapismd/design-core/forms`) — Lezer parser form previews
