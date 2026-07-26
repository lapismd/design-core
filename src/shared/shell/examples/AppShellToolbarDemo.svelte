<script lang="ts">
  import { AppShell } from "../index.js";
  import { useAppShell } from "../app-shell-context.svelte.js";

  let {
    showLeftToggle = true,
    showRightToggle = true,
    leftSidebarName = "left",
  }: {
    showLeftToggle?: boolean;
    showRightToggle?: boolean;
    leftSidebarName?: string;
  } = $props();

  const controller = useAppShell();
  let leftToggleLabel = $derived(
    controller.left.closed
      ? `Open ${leftSidebarName} sidebar`
      : controller.left.collapsed
        ? `Expand ${leftSidebarName} sidebar`
        : `Collapse ${leftSidebarName} sidebar`,
  );
</script>

<div class="ui-shell-story-toolbar-controls">
  {#if showLeftToggle}
    <AppShell.Sidebar.Toggle side="left" label={leftToggleLabel} />
  {/if}

  <strong class="ui-shell-story-toolbar-title">Application workspace</strong>
  <span class="ui-shell-story-toolbar-spacer"></span>

  {#if showRightToggle}
    <AppShell.Sidebar.Toggle side="right" />
  {/if}
</div>
