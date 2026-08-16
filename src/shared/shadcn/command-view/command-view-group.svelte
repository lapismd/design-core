<script lang="ts">
  import type { ComponentProps } from "svelte";
  import * as Command from "../command/index.js";

  let props: ComponentProps<typeof Command.Group> = $props();
</script>

<Command.Group {...props} />
