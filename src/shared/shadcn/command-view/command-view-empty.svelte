<script lang="ts">
  import type { ComponentProps } from "svelte";
  import * as Command from "../command/index.js";

  let props: ComponentProps<typeof Command.Empty> = $props();
</script>

<Command.Empty
  role="option"
  aria-disabled="true"
  aria-selected="false"
  {...props}
/>
