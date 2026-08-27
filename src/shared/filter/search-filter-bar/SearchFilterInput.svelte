<script lang="ts">
  import "./SearchFilterBar.css";
  import { filterQuery } from "../filter-query/index.js";
  import {
    acceptCompletion,
    autocompletion,
    completionKeymap,
    startCompletion,
  } from "@codemirror/autocomplete";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { syntaxHighlighting } from "@codemirror/language";
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
    tooltips,
  } from "@codemirror/view";
  import SearchIcon from "@lucide/svelte/icons/search";
  import XIcon from "@lucide/svelte/icons/x";
  import { mount, type Snippet, unmount } from "svelte";
  import SearchFilterAutocompleteScrollArea from "./SearchFilterAutocompleteScrollArea.svelte";
  import { searchFilterHighlightStyle } from "./search-filter-highlight.js";
  import {
    formatTermExpr,
    predicateChipEditHandler,
    searchFilterPredicateChips,
    type PredicateChipEditSession,
    type PredicateTermParts,
  } from "./search-filter-predicate-chips.js";
  import SearchFilterPredicateEditor from "./SearchFilterPredicateEditor.svelte";
  import {
    searchFilterCompletion,
    searchFilterCompletionStage,
    type SearchFilterSyntax,
  } from "./search-filter-syntax.js";

  let {
    value = "",
    placeholder = "Search...",
    ariaLabel = "Search",
    shortcut = "",
    disabled = false,
    inputId = undefined,
    inputMode = "plain",
    density = "default",
    showSearchIcon = true,
    showClearButton = true,
    clearSearchLabel = "Clear search",
    error = null,
    editorExtensions = [],
    filterSyntax = undefined,
    onValueChange = () => {},
    onClearSearch = () => {},
    actions,
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    shortcut?: string;
    disabled?: boolean;
    inputId?: string;
    /** `filter-query` uses CodeMirror; `plain` uses a native search input. */
    inputMode?: "filter-query" | "plain";
    /** Compact removes bar-level spacing so the input fits dense form rows. */
    density?: "default" | "compact";
    showSearchIcon?: boolean;
    showClearButton?: boolean;
    clearSearchLabel?: string;
    error?: string | null;
    editorExtensions?: Extension[];
    filterSyntax?: SearchFilterSyntax;
    onValueChange?: (value: string) => void;
    onClearSearch?: () => void | Promise<void>;
    /** Optional controls rendered inside the input after its shortcut. */
    actions?: Snippet;
  } = $props();

  let editor = $state<EditorView | null>(null);
  let plainInput = $state<HTMLInputElement | null>(null);
  let replacing = false;
  let chipEditSession = $state<PredicateChipEditSession | null>(null);
  const editableCompartment = new Compartment();
  const placeholderCompartment = new Compartment();
  const autocompleteCompartment = new Compartment();
  const contentAttributesCompartment = new Compartment();

  const hasValue = $derived(value.trim().length > 0);

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
      Prec.highest(
        keymap.of([{ key: "Tab", run: acceptCompletion }, ...completionKeymap]),
      ),
    ];
  }

  function shouldStartAutocomplete(view: EditorView) {
    if (!filterSyntax || disabled || inputMode !== "filter-query") return false;
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
      if (view.hasFocus && shouldStartAutocomplete(view)) startCompletion(view);
    });
  }

  function observeAutocompletePopup(node: HTMLDivElement) {
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
    if (inputMode === "plain") plainInput?.focus();
    else editor?.focus();
  }

  export function clear() {
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

  function openPredicateChipEditor(session: PredicateChipEditSession) {
    if (!disabled) chipEditSession = session;
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

  function handlePlainInput(event: Event) {
    if (event.currentTarget instanceof HTMLInputElement) {
      onValueChange(event.currentTarget.value);
    }
  }

  function contentAttributes() {
    return EditorView.contentAttributes.of({
      role: "searchbox",
      "aria-label": ariaLabel,
      "aria-invalid": error ? "true" : "false",
      ...(inputId ? { id: inputId } : {}),
    });
  }

  function filterQueryEditor(node: HTMLDivElement, source: string) {
    const tooltipLayer = node.ownerDocument.createElement("div");
    tooltipLayer.className = "cv-search-filter-bar__tooltip-layer";
    tooltipLayer.dataset.uiComponent = "search-filter-bar-tooltip-layer";
    tooltipLayer.dataset.uiPart = "completion-portal";
    node.ownerDocument.body.append(tooltipLayer);
    const popupObserver = observeAutocompletePopup(tooltipLayer);

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
          tooltips({ parent: tooltipLayer }),
          editableCompartment.of(EditorView.editable.of(!disabled)),
          placeholderCompartment.of(placeholderExtension(placeholder)),
          autocompleteCompartment.of(autocompleteExtension()),
          contentAttributesCompartment.of(contentAttributes()),
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
        popupObserver.destroy();
        view.destroy();
        tooltipLayer.remove();
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

  $effect(() => {
    editor?.dispatch({
      effects: contentAttributesCompartment.reconfigure(contentAttributes()),
    });
  });
</script>

<div
  class="cv-search-filter-input"
  data-ui-component="search-filter-input"
  data-density={density}
  data-active={hasValue}
  data-invalid={error ? "" : undefined}
  data-input-mode={inputMode}
>
  <label class="cv-search-filter-bar__label" for={inputId}>{ariaLabel}</label>
  <div class="cv-search-filter-bar__search-pill">
    {#if showSearchIcon}<SearchIcon aria-hidden="true" />{/if}
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
      ></div>
    {/if}
    {#if shortcut && !hasValue}<kbd>{shortcut}</kbd>{/if}
    {#if actions}{@render actions()}{/if}
    {#if showClearButton && hasValue}
      <button
        type="button"
        class="cv-search-filter-bar__clear-search"
        aria-label={clearSearchLabel}
        title={clearSearchLabel}
        {disabled}
        onclick={clear}
      >
        <XIcon aria-hidden="true" />
      </button>
    {/if}
  </div>
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
