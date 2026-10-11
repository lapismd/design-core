export const Basic = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";

  let resolved = $state("");
</script>

<MergeEditor
  mode="three-way"
  path="src/name.ts"
  left={'const name = "Grace";\\n'}
  base={'const name = "Ada";\\n'}
  right={'const name = "Alan";\\n'}
  onResolvedChange={(state) => {
    resolved = state.content;
  }}
/>`;

export const OneWay = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="one-way"
  path="src/hello.ts"
  left={"hello\\nworld\\n"}
  right={"hello\\nthere\\n"}
/>`;

export const Wrap = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="one-way"
  path="src/note.ts"
  wrap
  left={'export const note = "alpha alpha alpha alpha alpha alpha";\\n'}
  right={'export const note = "beta beta beta beta beta beta beta";\\n'}
/>`;

export const Fill = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";

  const left = Array.from(
    { length: 5 },
    (_, index) => \`left \${index + 1} \${"alpha ".repeat(20).trim()}\`,
  ).join("\\n");
  const right = Array.from(
    { length: 5 },
    (_, index) => \`right \${index + 1} \${"beta ".repeat(20).trim()}\`,
  ).join("\\n");
</script>

<div style="height: 20rem; width: 36rem">
  <MergeEditor mode="one-way" path="src/fill.ts" {left} {right} />
</div>`;

export const Editable = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";

  let resolved = $state("");
</script>

<MergeEditor
  mode="three-way"
  path="src/name.ts"
  editable
  left={'const name = "Grace";\\n'}
  base={'const name = "Ada";\\n'}
  right={'const name = "Alan";\\n'}
  onResolvedChange={(state) => {
    resolved = state.content;
  }}
/>`;

export const MatchingSides = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="three-way"
  path="src/hello.ts"
  editable
  left={"hello\\n"}
  base={"hello\\n"}
  right={"hello\\n"}
/>`;

export const OneWayEditable = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="one-way"
  path="src/hello.ts"
  editable
  left={"hello\\n"}
  right={"hello\\n"}
/>`;

export const MismergeQuicksort = `<script lang="ts">
  import { MergeEditor, mismergeQuicksortFixture } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="three-way"
  editable
  path={mismergeQuicksortFixture.path}
  language="c"
  left={mismergeQuicksortFixture.left}
  base={mismergeQuicksortFixture.base}
  right={mismergeQuicksortFixture.right}
  leftLabel={mismergeQuicksortFixture.leftLabel}
  baseLabel={mismergeQuicksortFixture.baseLabel}
  rightLabel={mismergeQuicksortFixture.rightLabel}
/>`;

export const Quicksort = `<script lang="ts">
  import { MergeEditor, quicksortFixture } from "@lapismd/design-core/diff";
</script>

<MergeEditor
  mode="three-way"
  editable
  path={quicksortFixture.path}
  language="c"
  left={quicksortFixture.left}
  base={quicksortFixture.base}
  right={quicksortFixture.right}
  leftLabel={quicksortFixture.leftLabel}
  baseLabel={quicksortFixture.baseLabel}
  rightLabel={quicksortFixture.rightLabel}
/>`;

export const Demo = `<script lang="ts">
  import { MergeEditor, quicksortFixture } from "@lapismd/design-core/diff";

  let ignoreWhitespace = $state(false);
  let ignoreCase = $state(false);
</script>

<MergeEditor
  mode="three-way"
  editable
  path={quicksortFixture.path}
  language="c"
  ignoreWhitespace={ignoreWhitespace}
  ignoreCase={ignoreCase}
  left={quicksortFixture.left}
  base={quicksortFixture.base}
  right={quicksortFixture.right}
  leftLabel={quicksortFixture.leftLabel}
  baseLabel={quicksortFixture.baseLabel}
  rightLabel={quicksortFixture.rightLabel}
/>`;

export const HeaderCenter = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
  import { Button } from "@lapismd/design-core/shadcn/button";

  let version = $state(1);
</script>

<MergeEditor
  mode="one-way"
  path="src/example.ts"
  left={"first\\nkeep\\nlast\\n"}
  right={"changed\\nkeep\\ndifferent\\n"}
>
  {#snippet headerCenter()}
    <Button size="xs" variant="outline" onclick={() => version++}>
      Version {version}
    </Button>
  {/snippet}
  {#snippet headerActions()}
    <Button size="icon-xs" variant="ghost" aria-label="Merge options">⋮</Button>
  {/snippet}
</MergeEditor>`;

export const ComparisonPreferences = `<script lang="ts">
  import { MergeEditor } from "@lapismd/design-core/diff";
  import { Button } from "@lapismd/design-core/shadcn/button";
  let ignoreWhitespace = $state(false);
  let ignoreCase = $state(false);
</script>

<MergeEditor path="src/settings.ts" left={"Left\\n"} base={"base\\n"} right={"Right\\n"} editable editableSides={["base"]} {ignoreWhitespace} {ignoreCase}>
  {#snippet headerActions()}
    <Button size="xs" variant="outline" aria-pressed={ignoreWhitespace} onclick={() => ignoreWhitespace = !ignoreWhitespace}>Ignore whitespace</Button>
    <Button size="xs" variant="outline" aria-pressed={ignoreCase} onclick={() => ignoreCase = !ignoreCase}>Ignore case</Button>
  {/snippet}
</MergeEditor>`;
