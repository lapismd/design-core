export const Basic = `<script lang="ts">
  import { FileDiff } from "@lapismd/design-core/diff";

  const oldText = \`export function greet(name: string) {
  return "Hello, " + name;
}
\`;

  const newText = \`export function greet(name: string) {
  return \`Hello, \${name}!\`;
}
\`;
</script>

<FileDiff
  path="src/greet.ts"
  {oldText}
  {newText}
  viewMode="unified"
/>`;

export const Split = `<script lang="ts">
  import { FileDiff } from "@lapismd/design-core/diff";
</script>

<FileDiff
  path="src/note.ts"
  viewMode="split"
  oldText={'export const note = "alpha alpha alpha alpha alpha alpha";\\n'}
  newText={'export const note = "beta beta beta beta beta beta beta";\\n'}
/>`;

export const Wrap = `<script lang="ts">
  import { FileDiff } from "@lapismd/design-core/diff";
</script>

<FileDiff
  path="src/note.ts"
  wrap
  oldText={'export const note = "alpha alpha alpha alpha alpha alpha alpha alpha";\\n'}
  newText={'export const note = "beta beta beta beta beta beta beta beta beta";\\n'}
/>`;

export const Fill = `<script lang="ts">
  import { FileDiff } from "@lapismd/design-core/diff";

  const oldText = Array.from(
    { length: 5 },
    (_, index) => \`old \${index + 1} \${"alpha ".repeat(20).trim()}\`,
  ).join("\\n");
  const newText = Array.from(
    { length: 5 },
    (_, index) => \`new \${index + 1} \${"beta ".repeat(20).trim()}\`,
  ).join("\\n");
</script>

<div style="height: 16rem; width: 24rem">
  <FileDiff path="src/fill.ts" viewMode="split" {oldText} {newText} />
</div>`;

export const Composer = `<script lang="ts">
  import { FileDiffComposer } from "@lapismd/design-core/diff";
</script>

<FileDiffComposer
  viewMode="unified"
  files={[
    {
      path: "src/a.ts",
      oldText: "const a = 1;\\n",
      newText: "const a = 2;\\n",
    },
    {
      path: "src/b.ts",
      oldText: "const b = 1;\\n",
      newText: "const b = 3;\\n",
    },
  ]}
/>`;

export const LineAnnotation = `<script lang="ts">
  import { FileDiff, type FileDiffLineContext } from "@lapismd/design-core/diff";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";

  let activeLine = $state<FileDiffLineContext>();
  let comment = $state("");

  function publishComment(context: FileDiffLineContext, content: string) {
    activeLine = undefined;
    comment = "";
    // Persist the host-owned comment with context.path/lineNumber/variant.
  }
<\/script>

{#snippet lineAction(context: FileDiffLineContext)}
  <Button
    aria-label={\`Comment on line \${context.lineNumber}\`}
    onclick={() => (activeLine = context)}
  >Comment</Button>
{/snippet}

{#snippet lineComment(context: FileDiffLineContext)}
  {#if activeLine?.lineNumber === context.lineNumber && activeLine.variant === context.variant}
    <section aria-label={\`Comment on line \${context.lineNumber}\`}>
      <Textarea bind:value={comment} aria-label="Comment" />
      <Button onclick={() => publishComment(context, comment)}>Comment</Button>
    </section>
  {/if}
{/snippet}

<FileDiff
  path="src/app.ts"
  {oldText}
  {newText}
  lineAccessory={lineAction}
  lineAnnotation={lineComment}
/>`;
