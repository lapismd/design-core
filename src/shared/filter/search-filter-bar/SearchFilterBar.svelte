<script lang="ts">
  import "./SearchFilterBar.css";
  import { filterQuery } from "../filter-query/index.js";
  import {
    acceptCompletion,
    autocompletion,
    completionKeymap,
    startCompletion,
  } from "@codemirror/autocomplete";
  import { syntaxHighlighting } from "@codemirror/language";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import {
    Compartment,
    EditorState,
    Prec,
    type Extension,
  } from "@codemirror/state";
  import {
    drawSelection,
    EditorView,
    keymap,
    placeholder as placeholderExtension,
  } from "@codemirror/view";
  import SearchIcon from "@lucide/svelte/icons/search";
  import SlidersHorizontalIcon from "@lucide/svelte/icons/sliders-horizontal";
  import XIcon from "@lucide/svelte/icons/x";
  import { mount, type Snippet, unmount } from "svelte";
  import { searchFilterHighlightStyle } from "./search-filter-highlight.js";
  import {
    formatTermExpr,
    predicateChipEditHandler,
    searchFilterPredicateChips,
    type PredicateChipEditSession,
    type PredicateTermParts,
  } from "./search-filter-predicate-chips.js";
  import {
    searchFilterCompletion,
    searchFilterCompletionStage,
    type SearchFilterSyntax,
  } from "./search-filter-syntax.js";
  import SearchFilterAutocompleteScrollArea from "./SearchFilterAutocompleteScrollArea.svelte";
  import SearchFilterPredicateEditor from "./SearchFilterPredicateEditor.svelte";

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

  let editor = $state<EditorView | null>(null);
  let plainInput = $state<HTMLInputElement | null>(null);
  let replacing = false;
  let chipEditSession = $state<PredicateChipEditSession | null>(null);
  const editableCompartment = new Compartment();
  const placeholderCompartment = new Compartment();
  const autocompleteCompartment = new Compartment();

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

  function autocompleteExtension(): Extension {
    if (!filterSyntax || disabled || inputMode !== "filter-query") return [];
    return [
      autocompletion({
        override: [searchFilterCompletion(filterSyntax)],
        icons: false,
        activateOnTyping: true,
        activateOnTypingDelay: 0,
        interactionDelay: 0,
        activateOnCompletion: (completion) =>
          completion.type === "property" || completion.type === "operator",
        tooltipClass: (state) =>
          searchFilterCompletionStage(
            filterSyntax,
            state.doc.toString(),
            state.selection.main.head,
          ) === "value"
            ? "cv-search-filter-bar__autocomplete--values"
            : "",
      }),
      // CodeMirror prevents the browser's normal Tab navigation when this
      // command accepts an open completion, but preserves Tab otherwise.
      Prec.highest(
        keymap.of([{ key: "Tab", run: acceptCompletion }, ...completionKeymap]),
      ),
    ];
  }

  function shouldStartAutocomplete(view: EditorView) {
    if (!filterSyntax || disabled || inputMode !== "filter-query") {
      return false;
    }

    const query = view.state.doc.toString();
    if (!query) return true;

    const stage = searchFilterCompletionStage(
      filterSyntax,
      query,
      view.state.selection.main.head,
    );
    return stage === "operator" || stage === "value";
  }

  function scheduleAutocomplete(view: EditorView) {
    queueMicrotask(() => {
      if (view.hasFocus && shouldStartAutocomplete(view)) {
        startCompletion(view);
      }
    });
  }

  /**
   * CodeMirror owns and replaces the listbox. Mount a shadcn ScrollArea only
   * around its dynamic-value lists, and remount it whenever CodeMirror swaps
   * the list for a new completion stage.
   */
  function autocompletePopup(node: HTMLDivElement) {
    let mounted: Record<string, unknown> | null = null;
    let mountedList: HTMLUListElement | null = null;

    function cleanup() {
      if (mounted) void unmount(mounted);
      mounted = null;
      mountedList = null;
    }

    function refresh() {
      const tooltip = node.querySelector<HTMLElement>(
        ".cm-tooltip-autocomplete",
      );
      const shouldScrollValues = tooltip?.classList.contains(
        "cv-search-filter-bar__autocomplete--values",
      );
      const list = tooltip?.querySelector<HTMLUListElement>(":scope > ul");

      if (!tooltip || !shouldScrollValues) {
        cleanup();
        return;
      }
      if (!list || list === mountedList) return;

      cleanup();
      mountedList = list;
      mounted = mount(SearchFilterAutocompleteScrollArea, {
        target: tooltip,
        props: { list },
      });
    }

    const observer = new MutationObserver(refresh);
    observer.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });
    refresh();

    return {
      destroy() {
        observer.disconnect();
        cleanup();
      },
    };
  }

  export function focus() {
    if (inputMode === "plain") {
      plainInput?.focus();
      return;
    }
    editor?.focus();
  }

  function toggleFilters() {
    filtersExpanded = !filtersExpanded;
  }

  function openPredicateChipEditor(session: PredicateChipEditSession) {
    if (disabled) return;
    chipEditSession = session;
  }

  function closePredicateChipEditor() {
    chipEditSession = null;
  }

  function applyPredicateChipEdit(parts: PredicateTermParts) {
    const session = chipEditSession;
    const view = editor;
    chipEditSession = null;
    if (!session || !view) return;
    const next = formatTermExpr(parts.field, parts.operator, parts.value);
    view.dispatch({
      changes: { from: session.from, to: session.to, insert: next },
    });
  }

  function clearEditor() {
    chipEditSession = null;
    if (inputMode === "plain") {
      if (value) onValueChange("");
      void onClearSearch();
      return;
    }
    if (editor && editor.state.doc.length > 0) {
      replacing = true;
      editor.dispatch({
        changes: { from: 0, to: editor.state.doc.length, insert: "" },
      });
      replacing = false;
    }
    void onClearSearch();
  }

  function handlePlainInput(event: Event) {
    if (!(event.currentTarget instanceof HTMLInputElement)) return;
    onValueChange(event.currentTarget.value);
  }

  function filterQueryEditor(node: HTMLDivElement, source: string) {
    const view = new EditorView({
      state: EditorState.create({
        doc: source,
        extensions: [
          filterQuery(),
          syntaxHighlighting(searchFilterHighlightStyle, { fallback: true }),
          searchFilterPredicateChips(),
          predicateChipEditHandler.of(openPredicateChipEditor),
          history(),
          drawSelection(),
          EditorView.lineWrapping,
          editableCompartment.of(EditorView.editable.of(!disabled)),
          placeholderCompartment.of(placeholderExtension(placeholder)),
          autocompleteCompartment.of(autocompleteExtension()),
          EditorView.contentAttributes.of({
            role: "searchbox",
            "aria-label": ariaLabel,
            "aria-invalid": error ? "true" : "false",
            ...(inputId ? { id: inputId } : {}),
          }),
          EditorView.editorAttributes.of({
            class: "cv-search-filter-bar__cm",
          }),
          EditorView.theme({
            ".cm-content": {
              caretColor:
                "var(--code-caret, var(--ui-form-foreground, currentColor))",
            },
            "&.cm-focused .cm-cursor": {
              borderLeftColor:
                "var(--code-caret, var(--ui-form-foreground, currentColor))",
              borderLeftWidth: "2px",
            },
          }),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !replacing) {
              onValueChange(update.state.doc.toString());
            }
            if (
              (update.focusChanged && update.view.hasFocus) ||
              (update.selectionSet && !update.docChanged)
            ) {
              scheduleAutocomplete(update.view);
            }
          }),
          ...editorExtensions,
        ],
      }),
      parent: node,
    });
    editor = view;

    return {
      update(next: string) {
        if (view.state.doc.toString() === next) return;
        replacing = true;
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: next },
        });
        replacing = false;
      },
      destroy() {
        view.destroy();
        if (editor === view) editor = null;
        chipEditSession = null;
      },
    };
  }

  $effect(() => {
    editor?.dispatch({
      effects: editableCompartment.reconfigure(
        EditorView.editable.of(!disabled),
      ),
    });
  });

  $effect(() => {
    editor?.dispatch({
      effects: autocompleteCompartment.reconfigure(autocompleteExtension()),
    });
  });

  $effect(() => {
    editor?.dispatch({
      effects: placeholderCompartment.reconfigure(
        placeholderExtension(placeholder),
      ),
    });
  });
</script>

<div
  class="cv-search-filter-bar"
  data-active={hasValue}
  data-filters-expanded={filtersExpanded}
  data-invalid={error ? "" : undefined}
  data-input-mode={inputMode}
>
  <div class="cv-search-filter-bar__content">
    <label class="cv-search-filter-bar__label" for={inputId}>
      {ariaLabel}
    </label>

    <div class="cv-search-filter-bar__search-pill">
      <SearchIcon />
      {#if inputMode === "plain"}
        <input
          bind:this={plainInput}
          class="cv-search-filter-bar__plain-input"
          type="search"
          id={inputId}
          {value}
          {placeholder}
          {disabled}
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : undefined}
          autocomplete="off"
          spellcheck="false"
          oninput={handlePlainInput}
        />
      {:else}
        <div
          class="cv-search-filter-bar__editor"
          use:filterQueryEditor={value}
          use:autocompletePopup
        ></div>
      {/if}
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
          onclick={clearEditor}
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
        <summary>{filterSyntax.title ?? "Search syntax"}</summary>
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

    {#if error}
      <p class="ui-form-control-error cv-search-filter-bar__error" role="alert">
        {error}
      </p>
    {/if}
  </div>

  {#if chipEditSession}
    {#key `${chipEditSession.from}:${chipEditSession.to}:${chipEditSession.field}`}
      <SearchFilterPredicateEditor
        session={chipEditSession}
        {filterSyntax}
        {disabled}
        onCancel={closePredicateChipEditor}
        onApply={applyPredicateChipEdit}
      />
    {/key}
  {/if}
</div>
