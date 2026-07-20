<script lang="ts">
  import { onDestroy, type Snippet } from "svelte";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Collapsible from "@stevejuma/ui/shadcn/collapsible";
  import * as Sidebar from "@stevejuma/ui/shadcn/sidebar";
  import * as ToggleGroup from "@stevejuma/ui/shadcn/toggle-group";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type {
    WorkspaceSidebarGroup,
    WorkspaceSidebarTab,
  } from "../core/types.js";

  let {
    controller,
    side,
    header,
    footer,
    children,
    groups = [],
    groupContent,
    tabs = [],
    tabContent,
  }: {
    controller: WorkspaceController;
    side: "left" | "right";
    header?: Snippet;
    footer?: Snippet;
    children?: Snippet;
    groups?: readonly WorkspaceSidebarGroup[];
    groupContent?: Snippet<[WorkspaceSidebarGroup]>;
    tabs?: readonly WorkspaceSidebarTab[];
    tabContent?: Snippet<[WorkspaceSidebarTab]>;
  } = $props();

  const sidebarState = $derived(controller.layout[side]);
  let resizing = $state(false);
  let startX = 0;
  let startSize = 0;
  const sidebarTabValue = $derived(
    tabs.some((tab) => tab.id === sidebarState.activeTabId)
      ? (sidebarState.activeTabId ?? "")
      : (tabs[0]?.id ?? ""),
  );

  function applySize(delta: number) {
    const signedDelta = side === "left" ? delta : -delta;
    controller.setSidebarSize(side, startSize + signedDelta);
  }

  function startResize(event: PointerEvent) {
    event.preventDefault();
    resizing = true;
    startX = event.clientX;
    startSize = sidebarState.size;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stopResize, { once: true });
  }

  function resize(event: PointerEvent) {
    if (!resizing) return;
    applySize(event.clientX - startX);
  }

  function stopResize() {
    if (!resizing) return;
    resizing = false;
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
    window.removeEventListener("pointermove", resize);
    window.removeEventListener("pointerup", stopResize);
  }

  function resizeFromKeyboard(event: KeyboardEvent) {
    const step = event.shiftKey ? 32 : 16;
    const increase = side === "left" ? "ArrowRight" : "ArrowLeft";
    const decrease = side === "left" ? "ArrowLeft" : "ArrowRight";
    if (event.key === increase) {
      event.preventDefault();
      controller.setSidebarSize(side, sidebarState.size + step);
    } else if (event.key === decrease) {
      event.preventDefault();
      controller.setSidebarSize(side, sidebarState.size - step);
    } else if (event.key === "Home") {
      event.preventDefault();
      controller.setSidebarSize(side, 220);
    } else if (event.key === "End") {
      event.preventDefault();
      controller.setSidebarSize(side, 520);
    }
  }

  onDestroy(stopResize);

  function groupExpanded(groupId: string) {
    return !sidebarState.collapsedGroups[groupId];
  }
</script>

{#if sidebarState.open}
  <div data-ui-component="workspace" data-ui-part="sidebar" data-side={side}>
    {#if side === "right"}
      <button
        type="button"
        aria-label="Resize right sidebar"
        title={`Current width ${sidebarState.size} pixels. Use the arrow keys to resize.`}
        data-ui-component="workspace"
        data-ui-part="sidebar-resizer"
        onpointerdown={startResize}
        onkeydown={resizeFromKeyboard}
      ></button>
    {/if}
    <Sidebar.Root
      open={true}
      aria-label={`Workspace ${side} sidebar`}
      style={side === "left"
        ? `width: max(0px, calc(${sidebarState.size}px - var(--ui-workspace-ribbon-width, 2.75rem)));`
        : `width: ${sidebarState.size}px;`}
      data-workspace-sidebar={side}
    >
      {#if header}
        <Sidebar.Header>{@render header()}</Sidebar.Header>
      {/if}
      {#if tabs.length > 0}
        <div data-ui-component="workspace" data-ui-part="sidebar-tab-strip">
          <ToggleGroup.Root
            type="single"
            size="sm"
            spacing={1}
            value={sidebarTabValue}
            onValueChange={(value) => {
              if (typeof value === "string" && value) {
                controller.selectSidebarTab(side, value);
              }
            }}
            aria-label={`Select ${side} sidebar tab`}
            data-workspace-part="sidebar-tab-list"
          >
            {#each tabs as tab (tab.id)}
              {@const TabIcon = tab.icon}
              <ToggleGroup.Item
                value={tab.id}
                aria-label={tab.label}
                title={tab.label}
                disabled={tab.disabled}
                data-workspace-part="sidebar-tab-trigger"
              >
                <TabIcon data-icon="inline-start" />
              </ToggleGroup.Item>
            {/each}
          </ToggleGroup.Root>
          <div
            data-ui-component="workspace"
            data-ui-part="sidebar-tab-spacer"
          ></div>
        </div>
      {/if}
      <Sidebar.Content>
        {#if tabs.length > 0}
          {#each tabs as tab (tab.id)}
            {#if tab.id === sidebarTabValue}
              <div
                data-ui-component="workspace"
                data-ui-part="sidebar-tab-content"
                role="tabpanel"
                aria-label={tab.label}
              >
                {@render tabContent?.(tab)}
              </div>
            {/if}
          {/each}
        {:else if groups.length > 0}
          {#each groups as group (group.id)}
            {@const expanded = groupExpanded(group.id)}
            <section
              data-ui-component="workspace"
              data-ui-part="sidebar-group"
              data-collapsed={!expanded}
            >
              <Collapsible.Root
                open={expanded}
                onOpenChange={(open) =>
                  controller.setSidebarGroupCollapsed(side, group.id, !open)}
              >
                <div
                  data-ui-component="workspace"
                  data-ui-part="sidebar-group-header"
                >
                  <Collapsible.Trigger>
                    {#snippet child({ props })}
                      <Button
                        {...props}
                        type="button"
                        variant="ghost"
                        data-workspace-part="sidebar-group-trigger"
                      >
                        <ChevronRightIcon
                          data-icon="inline-start"
                          data-workspace-part="group-chevron"
                        />
                        {#if group.icon}
                          {@const Icon = group.icon}
                          <Icon
                            data-icon="inline-start"
                            data-workspace-part="group-icon"
                          />
                        {/if}
                        <span data-workspace-part="group-title"
                          >{group.title}</span
                        >
                      </Button>
                    {/snippet}
                  </Collapsible.Trigger>
                  {#if group.actions?.length}
                    <div
                      data-ui-component="workspace"
                      data-ui-part="sidebar-group-actions"
                    >
                      {#each group.actions as action (action.id)}
                        {@const ActionIcon = action.icon}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={action.label}
                          aria-pressed={action.pressed}
                          disabled={action.disabled}
                          onclick={action.onSelect}
                        >
                          <ActionIcon data-icon="inline-start" />
                        </Button>
                      {/each}
                    </div>
                  {/if}
                </div>
                <Collapsible.Content>
                  <div
                    data-ui-component="workspace"
                    data-ui-part="sidebar-group-body"
                  >
                    {@render groupContent?.(group)}
                  </div>
                </Collapsible.Content>
              </Collapsible.Root>
            </section>
          {/each}
        {:else}
          {@render children?.()}
        {/if}
      </Sidebar.Content>
      {#if footer}
        <Sidebar.Footer>{@render footer()}</Sidebar.Footer>
      {/if}
    </Sidebar.Root>
    {#if side === "left"}
      <button
        type="button"
        aria-label="Resize left sidebar"
        title={`Current width ${sidebarState.size} pixels. Use the arrow keys to resize.`}
        data-ui-component="workspace"
        data-ui-part="sidebar-resizer"
        onpointerdown={startResize}
        onkeydown={resizeFromKeyboard}
      ></button>
    {/if}
  </div>
{/if}

<style>
  [data-ui-component="workspace"][data-ui-part="sidebar"] {
    display: flex;
    min-width: 0;
    min-height: 0;
    background: var(--ui-workspace-sidebar-background, var(--sidebar));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar"]
    :global([data-workspace-sidebar]) {
    min-width: 0;
    height: 100%;
    border-color: var(--ui-workspace-divider, var(--sidebar-border));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar"][data-side="left"]
    :global([data-workspace-sidebar]) {
    border-right: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar"][data-side="right"]
    :global([data-workspace-sidebar]) {
    border-left: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-resizer"] {
    z-index: 1;
    width: 0.5rem;
    margin-inline: -0.25rem;
    border: 0;
    background: transparent;
    cursor: col-resize;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-resizer"]:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: -2px;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-resizer"]:hover::after,
  [data-ui-component="workspace"][data-ui-part="sidebar-resizer"]:focus-visible::after {
    display: block;
    width: 2px;
    height: 100%;
    margin-inline: auto;
    background: var(--ring);
    content: "";
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-tab-strip"] {
    display: flex;
    min-width: 0;
    height: var(--ui-workspace-tab-height, 2.5rem);
    flex: 0 0 var(--ui-workspace-tab-height, 2.5rem);
    align-items: center;
    overflow: hidden;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
    background: var(--ui-workspace-tab-container-background, var(--sidebar));
    padding-inline: 0.375rem;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-tab-strip"]
    :global([data-workspace-part="sidebar-tab-list"]) {
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-tab-strip"]
    :global([data-workspace-part="sidebar-tab-trigger"]) {
    width: 2rem;
    min-width: 2rem;
    height: 2rem;
    padding: 0;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-tab-spacer"] {
    min-width: 0;
    height: 100%;
    flex: 1 1 auto;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-tab-content"] {
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"] {
    min-width: 0;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group-header"] {
    display: flex;
    min-width: 0;
    height: var(--ui-workspace-group-header-height, 2rem);
    align-items: center;
    border-bottom: 1px solid var(--ui-workspace-divider, var(--sidebar-border));
    background: var(--ui-workspace-sidebar-background, var(--sidebar));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"]
    :global([data-workspace-part="sidebar-group-trigger"]) {
    display: flex;
    min-width: 0;
    height: 100%;
    flex: 1 1 auto;
    justify-content: flex-start;
    gap: 0.375rem;
    border-radius: 0;
    padding-inline: 0.5rem;
    color: var(--sidebar-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    text-align: left;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"]
    :global([data-workspace-part="sidebar-group-trigger"]:hover) {
    background: var(--ui-workspace-group-hover, var(--sidebar-accent));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group-actions"] {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 0.125rem;
    padding-inline: 0.25rem;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group-actions"]
    :global(button) {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group-actions"]
    :global(button:hover:not(:disabled)) {
    background: var(--ui-workspace-action-hover, var(--sidebar-accent));
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"]
    :global([data-workspace-part="group-chevron"]) {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
    transition: transform 150ms ease;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"][data-collapsed="false"]
    :global([data-workspace-part="group-chevron"]) {
    transform: rotate(90deg);
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"]
    :global([data-workspace-part="group-icon"]) {
    width: 0.875rem;
    height: 0.875rem;
    flex: 0 0 auto;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group"]
    :global([data-workspace-part="group-title"]) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  [data-ui-component="workspace"][data-ui-part="sidebar-group-body"] {
    min-width: 0;
    background: var(--ui-workspace-group-body, var(--background));
    padding: 0.5rem;
  }
</style>
