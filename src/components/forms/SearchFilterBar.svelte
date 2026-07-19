<script lang="ts">
  import "./SearchFilterBar.css";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  let {
    value = "",
    placeholder = "Search...",
    ariaLabel = "Search",
    shortcut = "",
    disabled = false,
    inputId = undefined,
    clearSearchLabel = "Clear search",
    clearAllLabel = "Clear all",
    expandFiltersLabel = "Expand filter options",
    collapseFiltersLabel = "Collapse filter options",
    showActiveQueryChip = false,
    showClearAll = false,
    showFilterToggle = false,
    filtersExpanded = $bindable(false),
    clearAllDisabled = false,
    onValueChange = () => {},
    onClearSearch = () => {},
    onClearAll = () => {},
    filters,
    collapsedFilters,
    actions,
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    shortcut?: string;
    disabled?: boolean;
    inputId?: string;
    clearSearchLabel?: string;
    clearAllLabel?: string;
    expandFiltersLabel?: string;
    collapseFiltersLabel?: string;
    showActiveQueryChip?: boolean;
    showClearAll?: boolean;
    showFilterToggle?: boolean;
    filtersExpanded?: boolean;
    clearAllDisabled?: boolean;
    onValueChange?: (value: string) => void;
    onClearSearch?: () => void | Promise<void>;
    onClearAll?: () => void | Promise<void>;
    filters?: Snippet;
    collapsedFilters?: Snippet;
    actions?: Snippet;
  } = $props();

  let inputElement = $state<HTMLInputElement | null>(null);
  const trimmedValue = $derived(value.trim());
  const hasValue = $derived(trimmedValue.length > 0);
  const hasFilterControls = $derived(Boolean(filters));
  const filtersVisible = $derived(
    Boolean(filters) && (!showFilterToggle || filtersExpanded),
  );
  const collapsedFiltersVisible = $derived(
    Boolean(collapsedFilters) &&
      showFilterToggle &&
      hasFilterControls &&
      !filtersExpanded,
  );

  export function focus() {
    inputElement?.focus();
  }

  function handleInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;
    onValueChange(event.currentTarget.value);
  }

  function toggleFilters() {
    filtersExpanded = !filtersExpanded;
  }
</script>

<div
  class="cv-search-filter-bar"
  data-active={hasValue}
  data-filters-expanded={filtersExpanded}
>
  <div class="cv-search-filter-bar__content">
    <label class="cv-search-filter-bar__label" for={inputId}>
      {ariaLabel}
    </label>

    <div class="cv-search-filter-bar__search-pill">
      <SearchIcon />
      <input
        bind:this={inputElement}
        id={inputId}
        type="search"
        {value}
        {placeholder}
        {disabled}
        aria-label={ariaLabel}
        autocomplete="off"
        oninput={handleInput}
      />
      {#if shortcut && !hasValue && (!showFilterToggle || filtersExpanded)}
        <kbd>{shortcut}</kbd>
      {/if}
      {#if showFilterToggle && hasFilterControls && !filtersExpanded}
        <button
          type="button"
          class="cv-search-filter-bar__filter-toggle cv-search-filter-bar__filter-toggle--inline"
          aria-label={expandFiltersLabel}
          aria-pressed={false}
          title={expandFiltersLabel}
          {disabled}
          onclick={toggleFilters}
        >
          <SlidersHorizontalIcon />
        </button>
      {/if}
      {#if hasValue}
        <button
          type="button"
          class="cv-search-filter-bar__clear-search"
          aria-label={clearSearchLabel}
          title={clearSearchLabel}
          {disabled}
          onclick={() => onClearSearch()}
        >
          <XIcon />
        </button>
      {/if}
    </div>

    {#if collapsedFiltersVisible && collapsedFilters}
      <div class="cv-search-filter-bar__collapsed-filters">
        {@render collapsedFilters()}
      </div>
    {/if}

    {#if showActiveQueryChip && hasValue}
      <button
        type="button"
        class="cv-search-filter-bar__query-chip"
        aria-label={`Clear search for ${trimmedValue}`}
        title={clearSearchLabel}
        {disabled}
        onclick={() => onClearSearch()}
      >
        <span>{trimmedValue}</span>
        <XIcon />
      </button>
    {/if}

    {#if actions || (showFilterToggle && hasFilterControls) || showClearAll}
      <div class="cv-search-filter-bar__actions">
        {#if actions}
          {@render actions()}
        {/if}
        {#if showFilterToggle && hasFilterControls && filtersExpanded}
          <button
            type="button"
            class="cv-search-filter-bar__filter-toggle"
            aria-label={collapseFiltersLabel}
            aria-pressed={filtersExpanded}
            title={collapseFiltersLabel}
            {disabled}
            onclick={toggleFilters}
          >
            <SlidersHorizontalIcon />
          </button>
        {/if}
        {#if showClearAll && !clearAllDisabled}
          <button
            type="button"
            class="cv-search-filter-bar__clear-all"
            aria-label={clearAllLabel}
            title={clearAllLabel}
            {disabled}
            onclick={() => onClearAll()}
          >
            <XIcon />
          </button>
        {/if}
      </div>
    {/if}

    {#if filtersVisible && filters}
      <div class="cv-search-filter-bar__filters">
        {@render filters()}
      </div>
    {/if}
  </div>
</div>
