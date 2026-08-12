<script lang="ts">
  import { DropdownMenu } from "bits-ui";
  import WorkspaceSidebar from "../sidebar/WorkspaceSidebar.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "../menu/WorkspaceMenuItems.css";
  import { getAppShellContext } from "./app-shell-context.svelte.js";
  import type {
    WorkspaceNavigation,
    WorkspaceNavigationItem,
  } from "./workspace-navigation.js";

  let {
    workspaceLabel = "Workspace",
    workspaceNavigation,
    onOpenSettings,
  }: {
    workspaceLabel?: string;
    workspaceNavigation?: WorkspaceNavigation;
    onOpenSettings?: () => void;
  } = $props();

  const { controller, drag } = getAppShellContext();
  let width = $derived(
    controller.appearance.showRibbon
      ? `calc(${controller.renderer.layout.left.size}px - var(--ui-workspace-ribbon-width) + 1px)`
      : `${controller.renderer.layout.left.size}px`,
  );
  let currentLabel = $derived(
    workspaceNavigation?.currentLabel ?? workspaceLabel,
  );
  let pendingNavigationAction: (() => void | Promise<void>) | null = null;

  function selectWorkspace(item: WorkspaceNavigationItem): void {
    if (!workspaceNavigation || item.disabled) return;
    pendingNavigationAction = () => workspaceNavigation?.onSelect(item);
  }

  function manageWorkspaces(): void {
    if (!workspaceNavigation) return;
    pendingNavigationAction = workspaceNavigation.onManage;
  }

  function completeNavigation(open: boolean): void {
    if (open || !pendingNavigationAction) return;
    const action = pendingNavigationAction;
    pendingNavigationAction = null;
    void action();
  }
</script>

<WorkspaceSidebar controller={controller.renderer} side="left" {drag} {width}>
  {#snippet footer()}
    {#if onOpenSettings}
      <footer
        class="ui-workspace-sidebar__footer"
        data-ui-part="sidebar-footer"
      >
        {#if workspaceNavigation}
          <DropdownMenu.Root onOpenChangeComplete={completeNavigation}>
            <DropdownMenu.Trigger
              class="ui-workspace-sidebar__workspace-trigger"
              aria-label={`Current workspace: ${currentLabel}`}
              title={currentLabel}
            >
              <span>{currentLabel}</span>
              <WorkspaceIcon name="chevrons-up-down" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                class="ui-workspace-menu__content ui-workspace-sidebar__workspace-menu"
                data-ui-component="workspace-navigation"
                data-ui-part="content"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div class="ui-workspace-sidebar__workspace-menu-label">
                  {workspaceNavigation.menuLabel ?? "Recent workspaces"}
                </div>
                <DropdownMenu.Separator class="ui-workspace-menu__separator" />
                {#if workspaceNavigation.items.length > 0}
                  {#each workspaceNavigation.items as item (item.id)}
                    <DropdownMenu.Item
                      class="ui-workspace-menu__item ui-workspace-sidebar__workspace-menu-item"
                      disabled={item.disabled}
                      onSelect={() => selectWorkspace(item)}
                    >
                      <span class="ui-workspace-sidebar__workspace-menu-copy">
                        <span class="ui-workspace-menu__label"
                          >{item.label}</span
                        >
                        {#if item.description}
                          <span
                            class="ui-workspace-sidebar__workspace-menu-description"
                          >
                            {item.description}
                          </span>
                        {/if}
                      </span>
                    </DropdownMenu.Item>
                  {/each}
                {:else}
                  <DropdownMenu.Item
                    class="ui-workspace-menu__item"
                    disabled={true}
                  >
                    <span class="ui-workspace-menu__label">
                      {workspaceNavigation.emptyLabel ?? "No recent workspaces"}
                    </span>
                  </DropdownMenu.Item>
                {/if}
                <DropdownMenu.Separator class="ui-workspace-menu__separator" />
                <DropdownMenu.Item
                  class="ui-workspace-menu__item"
                  onSelect={manageWorkspaces}
                >
                  <WorkspaceIcon name="folder-open" />
                  <span class="ui-workspace-menu__label">
                    {workspaceNavigation.manageLabel ?? "Manage workspaces"}
                  </span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        {:else}
          <div
            class="ui-workspace-sidebar__workspace-label"
            aria-label={`Current workspace: ${currentLabel}`}
            title={currentLabel}
          >
            <span>{currentLabel}</span>
          </div>
        {/if}
        <button
          type="button"
          class="ui-workspace-sidebar__settings-trigger"
          aria-label="Open settings"
          title="Open settings"
          onclick={onOpenSettings}
        >
          <WorkspaceIcon name="settings" />
        </button>
      </footer>
    {/if}
  {/snippet}
</WorkspaceSidebar>
