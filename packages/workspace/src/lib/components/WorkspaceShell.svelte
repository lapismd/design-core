<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type {
    WorkspaceAction,
    WorkspaceSidebarGroup,
    WorkspaceSidebarTab,
    WorkspaceTab,
  } from "../core/types.js";
  import WorkspaceActionBar from "./WorkspaceActionBar.svelte";
  import WorkspaceSidebar from "./WorkspaceSidebar.svelte";
  import WorkspaceSplit from "./WorkspaceSplit.svelte";

  let {
    controller,
    class: className = "",
    actions = [],
    actionFooter,
    left,
    leftHeader,
    leftFooter,
    right,
    rightHeader,
    rightFooter,
    leftGroups = [],
    leftGroupContent,
    rightGroups = [],
    rightGroupContent,
    leftTabs = [],
    leftTabContent,
    rightTabs = [],
    rightTabContent,
    viewHeaderOptions,
    createTab,
  }: {
    controller: WorkspaceController;
    class?: string;
    actions?: readonly WorkspaceAction[];
    actionFooter?: Snippet;
    left?: Snippet;
    leftHeader?: Snippet;
    leftFooter?: Snippet;
    right?: Snippet;
    rightHeader?: Snippet;
    rightFooter?: Snippet;
    leftGroups?: readonly WorkspaceSidebarGroup[];
    leftGroupContent?: Snippet<[WorkspaceSidebarGroup]>;
    rightGroups?: readonly WorkspaceSidebarGroup[];
    rightGroupContent?: Snippet<[WorkspaceSidebarGroup]>;
    leftTabs?: readonly WorkspaceSidebarTab[];
    leftTabContent?: Snippet<[WorkspaceSidebarTab]>;
    rightTabs?: readonly WorkspaceSidebarTab[];
    rightTabContent?: Snippet<[WorkspaceSidebarTab]>;
    /** Consumer-owned controls rendered in every main view header. */
    viewHeaderOptions?: Snippet<[WorkspaceTab]>;
    createTab?: (
      groupId: string,
    ) => WorkspaceTab | null | Promise<WorkspaceTab | null>;
  } = $props();
</script>

<div class={className} data-ui-component="workspace" data-ui-part="shell">
  <WorkspaceActionBar {actions} offsetTop={true} footer={actionFooter} />

  {#if left || leftGroups.length > 0 || leftTabs.length > 0}
    <WorkspaceSidebar
      {controller}
      side="left"
      header={leftHeader}
      footer={leftFooter}
      groups={leftGroups}
      groupContent={leftGroupContent}
      tabs={leftTabs}
      tabContent={leftTabContent}
    >
      {@render left?.()}
    </WorkspaceSidebar>
  {/if}

  <main data-ui-component="workspace" data-ui-part="main">
    <WorkspaceSplit
      {controller}
      node={controller.layout.main}
      {createTab}
      {viewHeaderOptions}
    />
  </main>

  {#if right || rightGroups.length > 0 || rightTabs.length > 0}
    <WorkspaceSidebar
      {controller}
      side="right"
      header={rightHeader}
      footer={rightFooter}
      groups={rightGroups}
      groupContent={rightGroupContent}
      tabs={rightTabs}
      tabContent={rightTabContent}
    >
      {@render right?.()}
    </WorkspaceSidebar>
  {/if}
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="shell"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    overflow: hidden;
    background: var(--background);
    color: var(--foreground);
  }

  [data-ui-component="workspace"][data-ui-part="main"] {
    display: flex;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
    background: var(--background);
  }
</style>
