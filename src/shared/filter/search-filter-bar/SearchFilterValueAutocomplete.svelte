<script lang="ts">
  import { untrack } from "svelte";
  import * as Command from "../../shadcn/command/index.js";
  import {
    searchFilterFieldValues,
    type SearchFilterField,
  } from "./search-filter-syntax.js";

  let {
    value = $bindable(""),
    field,
    disabled = false,
    allowCustom = true,
    placeholder = "Enter value...",
  }: {
    value?: string;
    field: SearchFilterField;
    disabled?: boolean;
    /** When false, only values from `field.values` may be committed. */
    allowCustom?: boolean;
    placeholder?: string;
  } = $props();

  let open = $state(false);
  let query = $state(untrack(() => value));

  const suggestions = $derived(searchFilterFieldValues(field));
  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return suggestions;
    return suggestions.filter((item) => {
      const label = (item.label ?? item.value).toLocaleLowerCase();
      return (
        label.includes(needle) ||
        item.value.toLocaleLowerCase().includes(needle)
      );
    });
  });

  function syncFromValue(next: string) {
    value = next;
    query = next;
  }

  function commit(next: string) {
    const trimmed = next.trim();
    if (!trimmed) {
      syncFromValue("");
      open = false;
      return;
    }
    if (!allowCustom) {
      const match = suggestions.find(
        (item) =>
          item.value.toLocaleLowerCase() === trimmed.toLocaleLowerCase() ||
          (item.label ?? "").toLocaleLowerCase() ===
            trimmed.toLocaleLowerCase(),
      );
      if (!match) return;
      syncFromValue(match.value);
      open = false;
      return;
    }
    syncFromValue(trimmed);
    open = false;
  }

  function onQueryInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;
    query = event.currentTarget.value;
    if (allowCustom) value = query;
    if (!disabled) open = true;
  }
</script>

<div class="cv-search-filter-bar__value-autocomplete">
  <input
    class="cv-search-filter-bar__value-autocomplete-input"
    type="text"
    role="combobox"
    aria-expanded={open}
    aria-controls="cv-search-filter-value-list"
    aria-autocomplete="list"
    aria-label="Value"
    {placeholder}
    {disabled}
    value={query}
    oninput={onQueryInput}
    onfocus={() => {
      if (!disabled) open = true;
    }}
    onkeydown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit(query);
      }
      if (event.key === "Escape") {
        event.stopPropagation();
        open = false;
      }
    }}
  />
  {#if open && !disabled}
    <div
      class="cv-search-filter-bar__value-autocomplete-menu"
      id="cv-search-filter-value-list"
    >
      <Command.Root shouldFilter={false}>
        <Command.List aria-label="Value suggestions">
          <Command.Empty>No matching values</Command.Empty>
          <Command.Group>
            {#each filtered as item (item.value)}
              <Command.Item
                value={item.value}
                onSelect={() => {
                  commit(item.value);
                }}
              >
                {item.label ?? item.value}
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </div>
  {/if}
</div>
