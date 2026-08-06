<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Checkbox } from "@lapismd/design-core/shadcn/checkbox";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import * as Field from "@lapismd/design-core/shadcn/field";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceSidebarGroupVisibilityDialog.css";

  let {
    controller,
    group,
    open = $bindable(false),
  }: {
    controller: WorkspaceShellController;
    group: WorkspaceSidebarGroup;
    open?: boolean;
  } = $props();

  let visibleByTabId = $state<Record<string, boolean>>({});
  let wasOpen = false;

  $effect(() => {
    if (open && !wasOpen) {
      visibleByTabId = Object.fromEntries(
        group.tabs.map((tab) => [tab.id, !group.hiddenTabIds.includes(tab.id)]),
      );
    }
    wasOpen = open;
  });

  function setVisible(tabId: string, visible: boolean) {
    visibleByTabId = { ...visibleByTabId, [tabId]: visible };
  }

  function submit(event: SubmitEvent) {
    event.preventDefault();
    for (const tab of group.tabs) {
      controller.setSidebarPanelHidden(
        group.id,
        tab.id,
        visibleByTabId[tab.id] === false,
      );
    }
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="ui-workspace-sidebar-group-visibility">
    <Dialog.Header>
      <Dialog.Title>Manage visible panels</Dialog.Title>
      <Dialog.Description>
        Choose which panels are shown in {group.title}.
      </Dialog.Description>
    </Dialog.Header>

    <form
      class="ui-workspace-sidebar-group-visibility__form"
      id={`workspace-sidebar-group-visibility-${group.id}`}
      onsubmit={submit}
    >
      <Field.Group>
        {#each group.tabs as tab (tab.id)}
          <Field.Field
            orientation="horizontal"
            class="ui-workspace-sidebar-group-visibility__field"
          >
            <Checkbox
              id={`workspace-sidebar-group-visible-${tab.id}`}
              checked={visibleByTabId[tab.id] !== false}
              onCheckedChange={(checked) =>
                setVisible(tab.id, Boolean(checked))}
            />
            <Field.Label for={`workspace-sidebar-group-visible-${tab.id}`}>
              <WorkspaceIcon name={tab.icon ?? "file"} />
              <span>{tab.title}</span>
            </Field.Label>
          </Field.Field>
        {/each}
      </Field.Group>
    </form>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Cancel
      </Button>
      <Button
        type="submit"
        form={`workspace-sidebar-group-visibility-${group.id}`}
      >
        Save
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
