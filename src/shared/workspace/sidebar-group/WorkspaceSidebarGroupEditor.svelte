<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as Dialog from "@lapismd/design-core/shadcn/dialog";
  import * as Field from "@lapismd/design-core/shadcn/field";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import type { WorkspaceSidebarGroup } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import "./WorkspaceSidebarGroupEditor.css";

  const ICON_CHOICES = [
    "archive",
    "book-open",
    "bookmark",
    "boxes",
    "calendar",
    "chart-no-axes-combined",
    "circle-help",
    "clipboard-list",
    "file",
    "files",
    "folder",
    "folder-open",
    "folder-tree",
    "history",
    "inbox",
    "layout-list",
    "link",
    "list-tree",
    "notebook-tabs",
    "panel-top",
    "panels-top-left",
    "search",
    "settings",
    "star",
    "tags",
    "terminal",
  ] as const;

  let {
    controller,
    group,
    open = $bindable(false),
  }: {
    controller: WorkspaceShellController;
    group: WorkspaceSidebarGroup;
    open?: boolean;
  } = $props();

  let title = $state("");
  let icon = $state("");
  let iconQuery = $state("");
  let wasOpen = false;
  let filteredIcons = $derived(
    ICON_CHOICES.filter((name) =>
      name.includes(iconQuery.trim().toLowerCase()),
    ),
  );

  $effect(() => {
    if (open && !wasOpen) {
      title = group.title;
      icon = group.icon ?? "";
      iconQuery = "";
    }
    wasOpen = open;
  });

  function submit(event: SubmitEvent) {
    event.preventDefault();
    controller.updateSidebarGroup(group.id, { title, icon });
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="ui-workspace-sidebar-group-editor">
    <Dialog.Header>
      <Dialog.Title>Edit sidebar group</Dialog.Title>
      <Dialog.Description>
        Choose the label and icon shown in the sidebar tab strip.
      </Dialog.Description>
    </Dialog.Header>

    <form
      class="ui-workspace-sidebar-group-editor__form"
      id={`workspace-sidebar-group-editor-${group.id}`}
      onsubmit={submit}
    >
      <Field.Field>
        <Field.Label for={`workspace-sidebar-group-title-${group.id}`}>
          Name
        </Field.Label>
        <Input
          id={`workspace-sidebar-group-title-${group.id}`}
          bind:value={title}
          autocomplete="off"
        />
      </Field.Field>

      <Field.Field>
        <Field.Label for={`workspace-sidebar-group-icon-${group.id}`}>
          Icon
        </Field.Label>
        <div class="ui-workspace-sidebar-group-editor__icon-toolbar">
          <span
            class="ui-workspace-sidebar-group-editor__icon-preview"
            aria-hidden="true"
          >
            <WorkspaceIcon name={icon || "panels-top-left"} />
          </span>
          <Input
            id={`workspace-sidebar-group-icon-${group.id}`}
            bind:value={iconQuery}
            placeholder="Search icons"
            autocomplete="off"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onclick={() => (icon = "")}
          >
            Clear
          </Button>
        </div>
        <div
          class="ui-workspace-sidebar-group-editor__icon-grid"
          role="listbox"
          aria-label="Sidebar group icon"
        >
          {#each filteredIcons as iconName (iconName)}
            <Button
              type="button"
              variant={icon === iconName ? "secondary" : "ghost"}
              size="icon-sm"
              class="ui-workspace-sidebar-group-editor__icon-option"
              aria-label={`Use ${iconName} icon`}
              aria-selected={icon === iconName}
              role="option"
              title={iconName}
              onclick={() => (icon = iconName)}
            >
              <WorkspaceIcon name={iconName} />
            </Button>
          {:else}
            <p class="ui-workspace-sidebar-group-editor__empty">
              No matching icons.
            </p>
          {/each}
        </div>
      </Field.Field>
    </form>

    <Dialog.Footer>
      <Button type="button" variant="outline" onclick={() => (open = false)}>
        Cancel
      </Button>
      <Button type="submit" form={`workspace-sidebar-group-editor-${group.id}`}>
        Save
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
