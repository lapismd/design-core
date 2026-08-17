<script lang="ts" module>
  import type { SelectRootProps } from "bits-ui";

  export type WorkspaceSettingSelectItem = {
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  };

  type SharedSelectProps = {
    id?: string;
    items?: WorkspaceSettingSelectItem[];
    placeholder?: string;
    ariaLabel?: string;
    disabled?: boolean;
  } & Omit<
    SelectRootProps,
    "disabled" | "items" | "type" | "value" | "onValueChange"
  >;

  export type WorkspaceSettingSingleSelectProps = SharedSelectProps & {
    type?: "single";
    value?: string;
    onValueChange?: (value: string) => void;
  };

  export type WorkspaceSettingMultipleSelectProps = SharedSelectProps & {
    type: "multiple";
    value?: string[];
    onValueChange?: (value: string[]) => void;
  };

  export type WorkspaceSettingSelectProps =
    | WorkspaceSettingSingleSelectProps
    | WorkspaceSettingMultipleSelectProps;
</script>

<script lang="ts">
  import * as Select from "@lapismd/design-core/shadcn/select";
  import WorkspaceSettingMultiSelect from "./WorkspaceSettingMultiSelect.svelte";

  const SelectRoot: any = Select.Root;

  let {
    id,
    items = [],
    type = "single",
    value,
    placeholder = "Select...",
    ariaLabel,
    disabled = false,
    onValueChange,
    ...rest
  }: WorkspaceSettingSelectProps = $props();

  const uid = $props.id();
  let optionsId = $derived(id ? `${id}-options` : `${uid}-options`);

  let selectedValue = $state<string | string[] | undefined>();

  $effect(() => {
    selectedValue = value;
  });

  let triggerContent = $derived.by(() => {
    if (Array.isArray(selectedValue)) {
      const selected = items
        .filter((item) => selectedValue?.includes(item.value))
        .map((item) => item.label);
      return selected.length ? selected.join(", ") : placeholder;
    }
    return (
      items.find((item) => item.value === selectedValue)?.label ?? placeholder
    );
  });
</script>

{#if type === "multiple"}
  <WorkspaceSettingMultiSelect
    {id}
    {items}
    value={Array.isArray(selectedValue) ? selectedValue : []}
    {placeholder}
    {ariaLabel}
    {disabled}
    onValueChange={onValueChange as ((next: string[]) => void) | undefined}
  />
{:else}
<SelectRoot
  {...rest}
  type="single"
  {disabled}
  bind:value={selectedValue}
  onValueChange={onValueChange as ((next: string) => void) | undefined}
>
  <Select.Trigger
    {id}
    role="combobox"
    aria-label={ariaLabel}
    aria-controls={optionsId}
  >
    <span class="ui-workspace-setting-select__value">{triggerContent}</span>
  </Select.Trigger>
  <Select.Content
    id={optionsId}
    aria-label={ariaLabel ? `${ariaLabel} options` : undefined}
  >
    <Select.Group>
      {#each items as item (item.value)}
        <Select.Item
          value={item.value}
          label={item.label}
          disabled={item.disabled}
        />
      {/each}
    </Select.Group>
  </Select.Content>
</SelectRoot>
{/if}
