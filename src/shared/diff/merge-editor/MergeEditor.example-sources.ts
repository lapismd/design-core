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
