<script lang="ts">
  import { AppShell } from "../index.js";

  let {
    showLeftToggle = true,
    showRightToggle = true,
    leftSidebarName = "left",
  }: {
    showLeftToggle?: boolean;
    showRightToggle?: boolean;
    leftSidebarName?: string;
  } = $props();
</script>

<div class="ui-shell-story-toolbar-controls">
  {#if showLeftToggle}
    <AppShell.Sidebar.Toggle side="left" sidebarName={leftSidebarName} />
  {/if}

  <strong class="ui-shell-story-toolbar-title">Application workspace</strong>
  <span class="ui-shell-story-toolbar-spacer"></span>

  {#if showRightToggle}
    <AppShell.Sidebar.Toggle side="right" />
  {/if}
</div>
