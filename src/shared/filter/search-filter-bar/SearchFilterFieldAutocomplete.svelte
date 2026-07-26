<script lang="ts">
  import { untrack } from "svelte";
  import * as Command from "../../shadcn/command/index.js";
  import type {
    SearchFilterField,
    SearchFilterSyntax,
  } from "./search-filter-syntax.js";

  let {
    value,
    filterSyntax = undefined,
    disabled = false,
    onValueChange,
  }: {
    value: string;
    filterSyntax?: SearchFilterSyntax;
    disabled?: boolean;
    onValueChange: (next: string) => void;
  } = $props();

  let open = $state(false);
  let query = $state(untrack(() => value));
  let rootEl = $state<HTMLDivElement | null>(null);

  const fieldOptions = $derived.by(() => {
    const fields = [...(filterSyntax?.fields ?? [])];
    if (
      value &&
      !fields.some(
        (field) => field.name.toLocaleLowerCase() === value.toLocaleLowerCase(),
      )
    ) {
      fields.unshift({
        name: value,
        description: value,
        operators: [],
      } satisfies SearchFilterField);
    }
    return fields;
  });

  const filtered = $derived.by(() => {
    const needle = query.trim().toLocaleLowerCase();
    const committed = value.trim().toLocaleLowerCase();
    // Keep the full list while the input still mirrors the current field.
    if (!needle || needle === committed) return fieldOptions;
    return fieldOptions.filter((field) => {
      if (field.name.toLocaleLowerCase().includes(needle)) return true;
      if (
        field.aliases?.some((alias) =>
          alias.toLocaleLowerCase().includes(needle),
        )
      ) {
        return true;
      }
      return field.description.toLocaleLowerCase().includes(needle);
    });
  });

  /** Shared name column width so descriptions line up after the longest field. */
  const maxNameLen = $derived.by(() => {
    let max = 0;
    for (const field of filtered) {
      if (field.name.length > max) max = field.name.length;
    }
    return Math.max(max, 1);
  });

  function closeMenu() {
    open = false;
    query = value;
  }

  function selectField(field: SearchFilterField) {
    onValueChange(field.name);
    query = field.name;
    open = false;
  }

  function onQueryInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;
    query = event.currentTarget.value;
    if (!disabled) open = true;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      if (!open) return;
      event.stopPropagation();
      closeMenu();
      return;
    }
    if (event.key !== "Enter") return;
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    const exact = filtered.find(
      (field) =>
        field.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase() ||
        field.aliases?.some(
          (alias) => alias.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
        ),
    );
    if (exact) {
      selectField(exact);
      return;
    }
    if (filtered.length === 1) {
      selectField(filtered[0]!);
    }
  }

  function onWindowPointerDown(event: PointerEvent) {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (rootEl?.contains(target)) return;
    closeMenu();
  }
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

<div class="cv-search-filter-bar__field-autocomplete" bind:this={rootEl}>
  <input
    class="cv-search-filter-bar__field-autocomplete-input"
    type="text"
    role="combobox"
    aria-expanded={open}
    aria-controls="cv-search-filter-field-list"
    aria-autocomplete="list"
    aria-label="Field"
    placeholder="Field"
    {disabled}
    value={open ? query : value}
    oninput={onQueryInput}
    onfocus={(event) => {
      if (disabled) return;
      query = value;
      open = true;
      const input = event.currentTarget;
      queueMicrotask(() => {
        if (input instanceof HTMLInputElement) input.select();
      });
    }}
    onkeydown={onKeydown}
  />
  {#if open && !disabled}
    <div
      class="cv-search-filter-bar__field-autocomplete-menu"
      id="cv-search-filter-field-list"
      style={`--ps-field-name-cols: ${maxNameLen}ch`}
    >
      {#key value}
        <Command.Root shouldFilter={false} {value}>
          <Command.List aria-label="Field options">
            <Command.Empty>No matching fields</Command.Empty>
            <Command.Group>
              {#each filtered as field (field.name)}
                <Command.Item
                  value={field.name}
                  onSelect={() => {
                    selectField(field);
                  }}
                >
                  <span
                    class="cv-search-filter-bar__field-autocomplete-field-name"
                    >{field.name}</span
                  >
                  <span
                    class="cv-search-filter-bar__field-autocomplete-field-desc"
                    >{field.description}</span
                  >
                </Command.Item>
              {/each}
            </Command.Group>
          </Command.List>
        </Command.Root>
      {/key}
    </div>
  {/if}
</div>
