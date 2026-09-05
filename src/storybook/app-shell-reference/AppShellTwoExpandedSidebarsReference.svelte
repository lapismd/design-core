<script lang="ts">
  import type { Snippet } from "svelte";
  import { AppShell } from "../../shared/shell/app-shell/index.js";
  import { AppShellController } from "../../shared/shell/app-shell/app-shell-controller.svelte.js";
  import AppShellBodyDemo from "../../shared/shell/app-shell/examples/AppShellBodyDemo.svelte";
  import AppShellConversationDemo from "../../shared/shell/app-shell/examples/AppShellConversationDemo.svelte";
  import AppShellSidebarDemo from "../../shared/shell/app-shell/examples/AppShellSidebarDemo.svelte";
  import AppShellToolbarDemo from "../../shared/shell/app-shell/examples/AppShellToolbarDemo.svelte";
  import "./AppShellTwoExpandedSidebarsReference.css";

  let {
    controller = new AppShellController(),
    leftSidebar,
    showRightToggle = true,
  }: {
    controller?: AppShellController;
    leftSidebar?: Snippet<[AppShellController]>;
    showRightToggle?: boolean;
  } = $props();
</script>

<div class="ui-shell-story-frame">
  <AppShell.Root
    {controller}
    displayMode="desktop"
    desktopMinMainWidth={0}
    class="ui-shell-story-surface"
  >
    <AppShell.Sidebar side="left">
      {#if leftSidebar}
        {@render leftSidebar(controller)}
      {:else}
        <AppShellSidebarDemo {controller} side="left" />
      {/if}
    </AppShell.Sidebar>
    <AppShell.Main>
      <AppShell.Toolbar>
        <AppShellToolbarDemo {showRightToggle} />
      </AppShell.Toolbar>
      <AppShell.Body label="Workspace content">
        <AppShellBodyDemo />
      </AppShell.Body>
    </AppShell.Main>
    <AppShell.Sidebar side="right" closeable>
      <AppShellConversationDemo {controller} />
    </AppShell.Sidebar>
  </AppShell.Root>
</div>
