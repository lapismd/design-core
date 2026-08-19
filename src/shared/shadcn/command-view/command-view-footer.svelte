<script lang="ts">
  import type { Snippet } from "svelte";

  let { children }: { children?: Snippet } = $props();
</script>

<div
  data-ui-component="command-view"
  data-ui-part="footer"
  data-slot="command-view-footer"
>
  {@render children?.()}
</div>
