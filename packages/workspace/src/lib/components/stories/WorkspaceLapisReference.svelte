<script lang="ts">
  import type { Snippet } from "svelte";
  import "../../../../reference/lapis/97518d8158a12ade0f9b1a35aa051ffcf5dfe8ac/workspace-reference.css";

  let { children }: { children: Snippet } = $props();
</script>

<!-- Story-only wrapper shared by visual stories and parity checks. -->
<div data-workspace-theme="lapis-reference">
  {@render children()}
</div>

<style>
  [data-workspace-theme="lapis-reference"] {
    display: block;
  }
</style>
