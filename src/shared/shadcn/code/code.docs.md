# Code

Inline `<code>` for short references (APIs, flags, identifiers) inside prose.
Project-authored Astryx-inspired primitive — see `ADD_CODE_BLOCK.md`.

## Import

```ts
import { Code } from "@stevejuma/ui/shadcn/code";
```

## Usage

```svelte
<script lang="ts">
  import { Code } from "@stevejuma/ui/shadcn/code";
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

- **Code Block** (`@stevejuma/ui/shadcn/code-block`) — fenced multi-line snippets
- **Code Highlighter** (`@stevejuma/ui/forms`) — Lezer parser form previews
