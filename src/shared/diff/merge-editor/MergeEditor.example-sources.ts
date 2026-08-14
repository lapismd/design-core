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
