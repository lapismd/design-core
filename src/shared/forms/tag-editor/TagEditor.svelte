<script lang="ts">
  import ChipAutocomplete from "../chip-autocomplete/ChipAutocomplete.svelte";

  let {
    value = [],
    suggestions = [],
    label = "Tags",
    showLabel = true,
    placeholder = "Add tag...",
    id = undefined,
    embedded = false,
    uppercase = true,
    onChange = () => {},
  }: {
    value?: string[];
    suggestions?: string[];
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    id?: string;
    embedded?: boolean;
    uppercase?: boolean;
    onChange?: (tags: string[]) => void | Promise<void>;
  } = $props();
</script>

<ChipAutocomplete
  {value}
  {suggestions}
  {label}
  {showLabel}
  {placeholder}
  {id}
  {embedded}
  {uppercase}
  {onChange}
/>
