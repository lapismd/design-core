<script lang="ts">
  import { tick } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import * as CommandView from "@lapismd/design-core/shadcn/command-view";
  import * as Popover from "@lapismd/design-core/shadcn/popover";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import {
    filterMultiSelectItems,
    orderSelectedFirst,
    summarizeMultiSelectIds,
    type WorkspaceSettingMultiSelectItem,
  } from "./multiselect.js";

  let {
    id,
    items = [],
    value = [],
    placeholder = "Select options...",
    ariaLabel,
    disabled = false,
    onValueChange,
  }: {
    id?: string;
    items?: WorkspaceSettingMultiSelectItem[];
    value?: string[];
    placeholder?: string;
    ariaLabel?: string;
    disabled?: boolean;
    onValueChange?: (value: string[]) => void;
  } = $props();

  let open = $state(false);
  let query = $state("");
  let trigger = $state<HTMLButtonElement | null>(null);
  let selected = $derived(Array.isArray(value) ? value : []);

  let selectedIds = $derived(
    selected.map((id) => items.find((item) => item.value === id)?.value ?? id),
  );
  let triggerContent = $derived(
    summarizeMultiSelectIds(selectedIds, placeholder),
  );
  let filtered = $derived(
    orderSelectedFirst(filterMultiSelectItems(items, query), selected),
  );

  function toggle(nextValue: string) {
    onValueChange?.(
      selected.includes(nextValue)
        ? selected.filter((entry) => entry !== nextValue)
        : [...selected, nextValue],
    );
  }
</script>

<div
  class="ui-workspace-setting-multiselect"
  data-ui-component="workspace-setting-multiselect"
  data-ui-part="root"
>
  <Popover.Root
    {open}
    onOpenChange={(next) => {
      open = next;
      if (next) {
        query = "";
      } else {
        void tick().then(() => trigger?.focus());
      }
    }}
  >
    <Popover.Trigger>
      {#snippet child({ props })}
        <Button
          {...props}
          bind:ref={trigger}
          {id}
          {disabled}
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          dataUiComponent="workspace-setting-multiselect"
          data-ui-part="trigger"
        >
          <span class="ui-workspace-setting-select__value">{triggerContent}</span>
          <span data-ui-part="chevron">
            <WorkspaceIcon name="chevrons-up-down" />
          </span>
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      align="start"
      style="--ui-popover-width: 22rem; --ui-popover-padding: 0; --ui-popover-gap: 0"
    >
      <div
        data-ui-component="workspace-setting-multiselect"
        data-ui-part="content"
      >
        <CommandView.Root
          shouldFilter={false}
          label={ariaLabel ?? placeholder}
        >
          <CommandView.Input
            bind:value={query}
            placeholder="Search options..."
            autocomplete="off"
            spellcheck="false"
          />
          <CommandView.List aria-label={ariaLabel ? `${ariaLabel} options` : "Options"}>
            <CommandView.Empty>No options found.</CommandView.Empty>
            {#if filtered.length > 0}
              <CommandView.Group>
                {#each filtered as item (item.value)}
                  {@const isSelected = selected.includes(item.value)}
                  <CommandView.Item
                    value={`${item.value} ${item.label} ${item.description ?? ""}`}
                    disabled={item.disabled}
                    data-checked={isSelected ? "true" : undefined}
                    onSelect={() => {
                      if (!item.disabled) toggle(item.value);
                    }}
                  >
                    <CommandView.ItemIcon>
                      {#if isSelected}
                        <WorkspaceIcon name="check" />
                      {/if}
                    </CommandView.ItemIcon>
                    <CommandView.ItemLabel>{item.label}</CommandView.ItemLabel>
                    {#if item.description}
                      <CommandView.ItemDescription>
                        {item.description}
                      </CommandView.ItemDescription>
                    {/if}
                  </CommandView.Item>
                {/each}
              </CommandView.Group>
            {/if}
          </CommandView.List>
        </CommandView.Root>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
