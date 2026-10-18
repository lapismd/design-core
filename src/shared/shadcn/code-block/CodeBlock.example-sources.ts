export const Basic = `<script lang="ts">
  import { CodeBlock } from "@lapismd/design-core/shadcn/code-block";

  const code = \`import { Button } from '@lapismd/design-core/shadcn/button';

export function App() {
  return <Button>Hello</Button>;
}\`;
</script>

<CodeBlock {code} language="tsx" />`;

export const DarkDefaults = `<script lang="ts">
  import { CodeBlock, dracula } from "@lapismd/design-core/shadcn/code-block";
</script>

<div class="dark">
  <CodeBlock code="const answer = 42;" language="javascript" highlightMode="spans" />
  <CodeBlock code="const answer = 42;" language="javascript" highlightMode="spans"
    syntaxTheme={dracula} />
</div>`;
