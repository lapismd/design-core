<script lang="ts">
  import type { Snippet } from "svelte";
  import "./AppShellWorkspace.css";

  let { children }: { children?: Snippet } = $props();
</script>

<div
  class="ui-app-shell__main"
  data-ui-component="app-shell-main"
  data-ui-part="main"
>
  {@render children?.()}
</div>
