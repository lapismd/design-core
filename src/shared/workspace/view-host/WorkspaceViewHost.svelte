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

  let persistedMissingType = $derived.by(() => {
    const persisted = tab.view.state?.["__missingViewType"];
    return typeof persisted === "string" && persisted.length > 0
      ? persisted
      : null;
  });
  let resolvedViewType = $derived(persistedMissingType ?? tab.view.type);
  let definition = $derived(
    controller.registry.resolve(tab.view.type) ??
      (persistedMissingType
        ? controller.registry.resolve(persistedMissingType)
        : undefined),
  );
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
    if (definition) return null;
    if (persistedMissingType) return persistedMissingType;
    if (tab.view.type !== "empty") return tab.view.type;
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
  data-type={resolvedViewType}
  data-workspace-view-type={resolvedViewType}
>
  {#if definition?.kind === "imperative"}
    <WorkspaceImperativeView {definition} {context} />
  {:else if ViewComponent}
    <ViewComponent {...context} />
  {:else if missingViewType}
    <WorkspaceEmpty
      {missingViewType}
      surface="page"
      actions={missingViewActions}
    />
  {:else if tab.view.type === "empty"}
    <WorkspaceEmpty actions={emptyActions} surface="page" />
  {/if}
</div>
