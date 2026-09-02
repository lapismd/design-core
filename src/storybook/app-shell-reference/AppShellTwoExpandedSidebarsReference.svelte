<script lang="ts">
  import { AppShell } from "../../shared/shell/app-shell/index.js";
  import { AppShellController } from "../../shared/shell/app-shell/app-shell-controller.svelte.js";
  import AppShellBodyDemo from "../../shared/shell/app-shell/examples/AppShellBodyDemo.svelte";
  import AppShellConversationDemo from "../../shared/shell/app-shell/examples/AppShellConversationDemo.svelte";
  import AppShellSidebarDemo from "../../shared/shell/app-shell/examples/AppShellSidebarDemo.svelte";
  import AppShellToolbarDemo from "../../shared/shell/app-shell/examples/AppShellToolbarDemo.svelte";
  import "./AppShellTwoExpandedSidebarsReference.css";

  let {
    controller = new AppShellController(),
  }: {
    controller?: AppShellController;
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
      <AppShellSidebarDemo {controller} side="left" />
    </AppShell.Sidebar>
    <AppShell.Main>
      <AppShell.Toolbar>
        <AppShellToolbarDemo />
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
