<script lang="ts">
  import RichToolCallDetail from "./RichToolCallDetail.svelte";
  import type { ToolCallDetailProps } from "./rich-tool-call-detail.types.js";

  let {
    view = $bindable("formatted"),
    maximized = $bindable(false),
    ...props
  }: ToolCallDetailProps = $props();
</script>

<RichToolCallDetail {...props} bind:view bind:maximized />
