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
