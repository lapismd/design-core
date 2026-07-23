<script lang="ts">
  import * as Command from "../../shadcn/command/index.js";
  import type {
    SearchFilterField,
    SearchFilterSyntax,
  } from "../search-filter-bar/search-filter-syntax.js";
  import { matchPowerSearchFields } from "./power-search.js";

  let {
    filterSyntax,
    placeholder = "Add filter…",
    disabled = false,
    ariaLabel = "Add filter",
    onSelectField,
    onCommitText,
  }: {
    filterSyntax: SearchFilterSyntax;
    placeholder?: string;
    disabled?: boolean;
    ariaLabel?: string;
    onSelectField: (field: SearchFilterField) => void;
    /** Enter on non-matching free text (content search). */
    onCommitText?: (text: string) => void;
  } = $props();

  let open = $state(false);
  let query = $state("");
  let rootEl = $state<HTMLDivElement | null>(null);

  const filtered = $derived(matchPowerSearchFields(filterSyntax, query));

  /** Shared name column width so descriptions line up after the longest field. */
  const fieldNameColumnCh = $derived.by(() => {
    let max = 0;
    for (const field of filtered) {
      if (field.name.length > max) max = field.name.length;
    }
    return Math.max(max, 1);
  });

  export function getAnchorRect(): DOMRect {
    return (
      rootEl?.getBoundingClientRect() ??
      new DOMRect(window.innerWidth / 2, 80, 0, 0)
    );
  }

  export function focus() {
    const input = rootEl?.querySelector("input");
    if (input instanceof HTMLInputElement) input.focus();
  }

  export function clearQuery() {
    query = "";
    open = false;
  }

  function selectField(field: SearchFilterField) {
    query = "";
    open = false;
    onSelectField(field);
  }

  function onQueryInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;
    query = event.currentTarget.value;
    if (!disabled) open = true;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      open = false;
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
      return;
    }
    onCommitText?.(trimmed);
    query = "";
    open = false;
  }

  function onWindowPointerDown(event: PointerEvent) {
    if (!open) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (rootEl?.contains(target)) return;
    open = false;
  }
</script>

<svelte:window onpointerdown={onWindowPointerDown} />

<div
  class="ui-power-search__combobox"
  bind:this={rootEl}
  data-ui-part="field-combobox"
>
  <input
    class="ui-power-search__combobox-input"
    type="text"
    role="combobox"
    aria-expanded={open}
    aria-controls="ui-power-search-field-list"
    aria-autocomplete="list"
    aria-label={ariaLabel}
    {placeholder}
    {disabled}
    value={query}
    oninput={onQueryInput}
    onfocus={() => {
      if (!disabled) open = true;
    }}
    onkeydown={onKeydown}
  />
  {#if open && !disabled}
    <div
      class="ui-power-search__combobox-menu"
      id="ui-power-search-field-list"
      style={`--ps-field-name-cols: ${fieldNameColumnCh}ch`}
    >
      <Command.Root shouldFilter={false}>
        <Command.List aria-label="Filter fields">
          <Command.Empty>No matching fields</Command.Empty>
          <Command.Group>
            {#each filtered as field (field.name)}
              <Command.Item
                value={field.name}
                onSelect={() => {
                  selectField(field);
                }}
              >
                <span class="ui-power-search__combobox-field-name"
                  >{field.name}</span
                >
                <span class="ui-power-search__combobox-field-desc"
                  >{field.description}</span
                >
              </Command.Item>
            {/each}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </div>
  {/if}
</div>
