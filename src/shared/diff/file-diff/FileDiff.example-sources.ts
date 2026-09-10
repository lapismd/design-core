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
  import {
    FileDiffComposer,
    type FileDiffComposerFileContext,
    type FileDiffFileScrollTarget,
  } from "@lapismd/design-core/diff";
  import { Button } from "@lapismd/design-core/shadcn/button";

  let collapsedFilePaths = $state<string[]>(["src/a.ts"]);
  let scrollRequest = $state<FileDiffFileScrollTarget>({
    path: "src/b.ts",
    requestId: 0,
  });

  function toggleFile(path: string, collapsed: boolean) {
    collapsedFilePaths = collapsed
      ? [...new Set([...collapsedFilePaths, path])]
      : collapsedFilePaths.filter((candidate) => candidate !== path);
  }
</script>

{#snippet fileHeader(context: FileDiffComposerFileContext)}
  <span>{context.selected ? "Selected" : "Not selected"}</span>
{/snippet}

{#snippet fileHeaderLeading(context: FileDiffComposerFileContext)}
  <Button variant="ghost" size="icon-xs" aria-label={"Toggle related file list for " + context.path}>
    L
  </Button>
{/snippet}

<Button
  variant="outline"
  onclick={() => {
    scrollRequest = {
      path: "src/b.ts",
      requestId: Number(scrollRequest.requestId) + 1,
    };
  }}>Scroll to src/b.ts</Button
>
<FileDiffComposer
  viewMode="unified"
  selectedPath="src/b.ts"
  {collapsedFilePaths}
  scrollToFile={scrollRequest}
  stickyHeaders
  onFileToggle={toggleFile}
  {fileHeaderLeading}
  fileHeaderTrailing={fileHeader}
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
  import MessageSquarePlusIcon from "@lucide/svelte/icons/message-square-plus";

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
    size="icon-xs"
    variant="ghost"
    onclick={() => (activeLine = context)}
  ><MessageSquarePlusIcon aria-hidden="true" /></Button>
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
