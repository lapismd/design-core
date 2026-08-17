<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceEmpty from "../empty/WorkspaceEmpty.svelte";
  import { createWorkspaceEmptyActions } from "../empty/workspace-empty-actions.js";
  import WorkspaceImperativeView from "./WorkspaceImperativeView.svelte";
  import "./WorkspaceViewHost.css";

  let {
    controller,
    tab,
    hostId,
    paneId,
    createTab,
  }: {
    controller: WorkspaceShellController;
    tab: WorkspaceTab;
    hostId: string;
    paneId: string;
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  let definition = $derived(controller.registry.resolve(tab.view.type));
  let context = $derived({
    tab,
    hostId,
    paneId,
    active: controller.activeTabId === tab.id,
    showInlineTitle: controller.showInlineTitle,
    activate: () => controller.selectTab(tab.id),
    close: () => controller.closeTab(tab.id),
    setState: (state: Record<string, unknown>) =>
      controller.updateViewState(tab.id, state),
  });
  let ViewComponent = $derived(
    definition?.kind === "svelte" ? definition.component : null,
  );
  let emptyActions = $derived(
    createWorkspaceEmptyActions(
      controller,
      paneId,
      createTab,
      tab.closable === false ? undefined : tab.id,
    ),
  );
  let missingViewType = $derived.by(() => {
    const persisted = tab.view.state?.["__missingViewType"];
    if (typeof persisted === "string" && persisted.length > 0) {
      return persisted;
    }
    if (tab.view.type !== "empty" && !definition) {
      return tab.view.type;
    }
    return null;
  });
  let missingViewActions = $derived([
    {
      id: "close",
      label: "Close",
      onSelect: () => {
        controller.closeTab(tab.id);
      },
    },
  ]);
</script>

<div
  class="ui-workspace-view-host"
  data-ui-component="workspace-view-host"
  data-type={tab.view.type}
  data-workspace-view-type={tab.view.type}
>
  {#if tab.view.type === "empty" && !missingViewType}
    <WorkspaceEmpty actions={emptyActions} surface="page" />
  {:else if missingViewType}
    <WorkspaceEmpty
      {missingViewType}
      surface="page"
      actions={missingViewActions}
    />
  {:else if definition?.kind === "imperative"}
    <WorkspaceImperativeView {definition} {context} />
  {:else if ViewComponent}
    <ViewComponent {...context} />
  {/if}
</div>
