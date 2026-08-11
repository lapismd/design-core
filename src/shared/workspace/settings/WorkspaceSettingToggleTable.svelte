<script lang="ts">
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import * as Table from "@lapismd/design-core/shadcn/table";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import type { WorkspaceToggleTableSettingGroup } from "./types.js";

  let {
    controller,
    group,
  }: {
    controller: WorkspaceSettingsController;
    group: WorkspaceToggleTableSettingGroup;
  } = $props();
</script>

<div
  class="ui-workspace-setting-toggle-table"
  data-ui-part="setting-toggle-table"
  data-settings-group-id={group.id}
>
  <Table.Root>
    <Table.Header>
      <Table.Row>
        <Table.Head class="ui-workspace-setting-toggle-table__feature"
          >Feature</Table.Head
        >
        <Table.Head class="ui-workspace-setting-toggle-table__enabled"
          >Enabled</Table.Head
        >
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each group.fields as field (field.id)}
        <Table.Row
          data-setting-id={field.id}
          data-setting-control-kind="toggle"
          data-invalid={Boolean(controller.validationErrors[field.id])}
        >
          <Table.Cell class="ui-workspace-setting-toggle-table__feature">
            <label for={`setting-${field.id}`}>{field.title}</label>
            {#if field.description}<p>{field.description}</p>{/if}
            {#if field.deprecated}<p>{field.deprecated}</p>{/if}
            {#if controller.validationErrors[field.id]}
              <p class="ui-workspace-setting-item__error" role="alert">
                {controller.validationErrors[field.id]}
              </p>
            {/if}
          </Table.Cell>
          <Table.Cell class="ui-workspace-setting-toggle-table__enabled">
            <Switch
              id={`setting-${field.id}`}
              aria-label={field.title}
              checked={controller.get(field.id) === true}
              disabled={field.disabled}
              onCheckedChange={(checked) =>
                controller.update(field.id, checked)}
            />
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
