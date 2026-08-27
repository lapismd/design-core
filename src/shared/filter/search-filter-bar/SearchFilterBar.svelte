<script lang="ts">
  import "./SearchFilterBar.css";
  import type { Extension } from "@codemirror/state";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
  import XIcon from "@lucide/svelte/icons/x";
  import { type Snippet } from "svelte";
  import SearchFilterInput from "./SearchFilterInput.svelte";
  import type { SearchFilterSyntax } from "./search-filter-syntax.js";

  let {
    value = "",
    placeholder = "Search...",
    ariaLabel = "Search",
    shortcut = "",
    disabled = false,
    inputId = undefined,
    /** `filter-query` uses CodeMirror + filter syntax; `plain` is a normal search input. */
    inputMode = "plain",
    clearSearchLabel = "Clear search",
    clearAllLabel = "Clear all",
    expandFiltersLabel = "Expand filter options",
    collapseFiltersLabel = "Collapse filter options",
    showActiveQueryChip = false,
    showClearAll = false,
    showFilterToggle = false,
    filtersExpanded = $bindable(false),
    clearAllDisabled = false,
    /** Validation message shown under the search bar. */
    error = null,
    editorExtensions = [],
    filterSyntax = undefined,
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
    inputMode?: "filter-query" | "plain";
    clearSearchLabel?: string;
    clearAllLabel?: string;
    expandFiltersLabel?: string;
    collapseFiltersLabel?: string;
    showActiveQueryChip?: boolean;
    showClearAll?: boolean;
    showFilterToggle?: boolean;
    filtersExpanded?: boolean;
    clearAllDisabled?: boolean;
    error?: string | null;
    /** Extra CodeMirror extensions (e.g. themed syntax highlighting). */
    editorExtensions?: Extension[];
    /** Optional field, operator, and value completion plus inline syntax help. */
    filterSyntax?: SearchFilterSyntax;
    onValueChange?: (value: string) => void;
    onClearSearch?: () => void | Promise<void>;
    onClearAll?: () => void | Promise<void>;
    filters?: Snippet;
    collapsedFilters?: Snippet;
    actions?: Snippet;
  } = $props();

  let searchInput = $state<{
    focus: () => void;
    clear: () => void;
  } | null>(null);

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
    searchInput?.focus();
  }

  function toggleFilters() {
    filtersExpanded = !filtersExpanded;
  }

  function clearEditor() {
    searchInput?.clear();
  }
</script>

<div
  class="cv-search-filter-bar"
  data-active={hasValue}
  data-filters-expanded={filtersExpanded}
  data-invalid={error ? "" : undefined}
  data-input-mode={inputMode}
>
  <div class="cv-search-filter-bar__content">
    <SearchFilterInput
      bind:this={searchInput}
      {value}
      {placeholder}
      {ariaLabel}
      shortcut={!showFilterToggle || filtersExpanded ? shortcut : ""}
      {disabled}
      {inputId}
      {inputMode}
      {clearSearchLabel}
      {error}
      {editorExtensions}
      {filterSyntax}
      {onValueChange}
      {onClearSearch}
    >
      {#snippet actions()}
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
      {/snippet}
    </SearchFilterInput>

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
        onclick={clearEditor}
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

    {#if filtersVisible && filterSyntax}
      <details class="cv-search-filter-bar__syntax-help">
        <summary>
          <ChevronRightIcon aria-hidden="true" />
          <span>{filterSyntax.title ?? "Search syntax"}</span>
        </summary>
        <div class="cv-search-filter-bar__syntax-help-content">
          {#if filterSyntax.description}
            <p>{filterSyntax.description}</p>
          {/if}
          <dl>
            {#each filterSyntax.fields as field (field.name)}
              <div>
                <dt><code>{field.name}</code></dt>
                <dd>
                  <span>{field.description}</span>
                  <code>{field.operators.join(" ")}</code>
                  {#if field.aliases?.length}
                    <span class="cv-search-filter-bar__syntax-aliases"
                      >Aliases: {field.aliases.join(", ")}</span
                    >
                  {/if}
                </dd>
              </div>
            {/each}
          </dl>
          {#if filterSyntax.examples?.length}
            <ul>
              {#each filterSyntax.examples as example (example.query)}
                <li>
                  <code>{example.query}</code><span>{example.description}</span>
                </li>
              {/each}
            </ul>
          {/if}
          {#if filterSyntax.notes?.length}
            <ul class="cv-search-filter-bar__syntax-notes">
              {#each filterSyntax.notes as note (note)}
                <li>{note}</li>
              {/each}
            </ul>
          {/if}
        </div>
      </details>
    {/if}
  </div>
</div>
