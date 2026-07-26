<script lang="ts">
  import { AppShell } from "../index.js";

  let {
    showRightToggle = true,
  }: {
    showRightToggle?: boolean;
  } = $props();
</script>

<div class="ui-shell-story-toolbar-controls">
  <AppShell.Sidebar.Toggle side="left" />

  <strong class="ui-shell-story-toolbar-title">Application workspace</strong>
  <span class="ui-shell-story-toolbar-spacer"></span>

  {#if showRightToggle}
    <AppShell.Sidebar.Toggle side="right" />
  {/if}
</div>
