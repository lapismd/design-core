<script lang="ts">
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import * as Popover from "../popover/index.js";
  import * as Command from "../command/index.js";
  import { Button } from "../button/index.js";
  import type { FilterField } from "./filter-builder-types.js";
  let {
    fields,
    value,
    onValueChange,
    disabled,
  }: {
    fields: readonly FilterField[];
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
  } = $props();
  let open = $state(false);
  const listId = $props.id();
</script>

<Popover.Root bind:open>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        {disabled}
        class="filter-builder__field"
        aria-label={"Filter field: " +
          (fields.find((field) => field.id === value)?.label ?? "Choose field")}
      >
        <span
          >{fields.find((field) => field.id === value)?.label ??
            "Choose field"}</span
        >
        <ChevronsUpDown data-icon="inline-end" />
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content align="start" class="filter-builder__field-menu">
    <Command.Root>
      <Command.Input
        aria-label="Find filter field"
        aria-controls={listId}
        placeholder="Find a field…"
      />
      <Command.List id={listId}>
        <Command.Empty>No fields found.</Command.Empty>
        <Command.Group>
          {#each fields as field (field.id)}
            <Command.Item
              value={field.id + " " + field.label}
              onSelect={() => {
                onValueChange(field.id);
                open = false;
              }}
            >
              {field.label}
            </Command.Item>
          {/each}
        </Command.Group>
      </Command.List>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
