<script lang="ts">
  import * as Select from "../select/index.js";
  let {
    label,
    value,
    options,
    onValueChange,
    disabled = false,
    invalid = false,
    describedBy,
  }: {
    label: string;
    value: string;
    options: readonly { value: string; label: string }[];
    onValueChange: (value: string) => void;
    disabled?: boolean;
    invalid?: boolean;
    describedBy?: string | undefined;
  } = $props();
</script>

<Select.Root type="single" {value} {onValueChange} {disabled}>
  <Select.Trigger
    aria-label={label}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    class="filter-builder__select"
  >
    {options.find((option) => option.value === value)?.label ?? "Choose…"}
  </Select.Trigger>
  <Select.Content align="start">
    <Select.Group>
      {#each options as option (option.value)}
        <Select.Item value={option.value} label={option.label}
          >{option.label}</Select.Item
        >
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
