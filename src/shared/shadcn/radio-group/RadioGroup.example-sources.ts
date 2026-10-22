export const Basic = `<script lang="ts">
  import * as RadioGroup from "@lapismd/design-core/shadcn/radio-group";
  import { Label } from "@lapismd/design-core/shadcn/label";
  let value = $state("development");
</script>
<RadioGroup.Root bind:value aria-label="Environment">
  <div><RadioGroup.Item id="development" value="development" /><Label for="development">Development</Label></div>
  <div><RadioGroup.Item id="production" value="production" /><Label for="production">Production</Label></div>
</RadioGroup.Root>`;
export const Preview = Basic;
