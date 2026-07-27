<script lang="ts">
  import { Button } from "../../shadcn/button/index.js";
  import type {
    AppShellController,
    AppShellDisplayMode,
    AppShellSidebarController,
  } from "../app-shell-controller.svelte.js";
  import AppShellCompleteDemo from "./AppShellCompleteDemo.svelte";

  let {
    controller,
    projectSidebar,
  }: {
    controller: AppShellController;
    projectSidebar: AppShellSidebarController;
  } = $props();

  let displayMode = $state<AppShellDisplayMode>("auto");
</script>

<div class="ui-shell-story-mode-demo">
  <div
    class="ui-shell-story-mode-controls"
    role="group"
    aria-label="Shell display mode"
    data-app-shell-gesture-ignore
  >
    {#each ["auto", "desktop", "mobile"] as mode}
      <Button
        type="button"
        size="sm"
        variant={displayMode === mode ? "secondary" : "ghost"}
        aria-pressed={displayMode === mode}
        onclick={() => (displayMode = mode as AppShellDisplayMode)}
      >
        {mode}
      </Button>
    {/each}
  </div>

  <AppShellCompleteDemo {controller} {projectSidebar} {displayMode} />
</div>
