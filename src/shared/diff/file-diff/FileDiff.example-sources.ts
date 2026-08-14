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
  path="src/greet.ts"
  oldText={"export const n = 1;\\n"}
  newText={"export const n = 2;\\n"}
  viewMode="split"
/>`;

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
