<script lang="ts">
  import "./PowerSearch.css";
  import SearchIcon from "@lucide/svelte/icons/search";
  import XIcon from "@lucide/svelte/icons/x";
  import SearchFilterPredicateEditor from "../search-filter-bar/SearchFilterPredicateEditor.svelte";
  import type {
    SearchFilterField,
    SearchFilterSyntax,
  } from "../search-filter-bar/search-filter-syntax.js";
  import type { PredicateEditSession } from "../search-filter-bar/search-filter-predicate-chips.js";
  import PowerSearchFieldCombobox from "./PowerSearchFieldCombobox.svelte";
  import {
    commitContentSearchToken,
    createPowerSearchToken,
    powerSearchOperatorLabel,
    type PowerSearchToken,
  } from "./power-search.js";

  let {
    tokens,
    filterSyntax,
    onTokensChange,
    placeholder = "Add filter…",
    disabled = false,
    contentSearchFieldKey = undefined,
    resultCount = undefined,
    clearAllLabel = "Clear all",
    ariaLabel = "Power search",
  }: {
    tokens: PowerSearchToken[];
    filterSyntax: SearchFilterSyntax;
    onTokensChange: (tokens: PowerSearchToken[]) => void;
    placeholder?: string;
    disabled?: boolean;
    /** Free-text Enter commits a token on this field (Astryx contentSearchFieldKey). */
    contentSearchFieldKey?: string;
    resultCount?: string | number;
    clearAllLabel?: string;
    ariaLabel?: string;
  } = $props();

  let rootEl = $state<HTMLDivElement | null>(null);
  let combobox = $state<{
    getAnchorRect: () => DOMRect;
    focus: () => void;
    clearQuery: () => void;
  } | null>(null);

  type EditMode =
    | { kind: "add"; field: string; operator: string; value: string }
    | {
        kind: "edit";
        tokenId: string;
        field: string;
        operator: string;
        value: string;
      };

  let editMode = $state<EditMode | null>(null);

  const editSession = $derived.by((): PredicateEditSession | null => {
    if (!editMode) return null;
    const mode = editMode;
    return {
      field: mode.field,
      operator: mode.operator,
      value: mode.value,
      getAnchorRect: () => {
        if (mode.kind === "edit") {
          const chip = rootEl?.querySelector(
            `[data-power-search-token="${CSS.escape(mode.tokenId)}"]`,
          );
          if (chip instanceof HTMLElement) return chip.getBoundingClientRect();
        }
        return (
          combobox?.getAnchorRect() ??
          rootEl?.getBoundingClientRect() ??
          new DOMRect(window.innerWidth / 2, 80, 0, 0)
        );
      },
    };
  });

  function removeToken(id: string) {
    onTokensChange(tokens.filter((token) => token.id !== id));
  }

  function clearAll() {
    onTokensChange([]);
    editMode = null;
  }

  function openAddForField(field: SearchFilterField) {
    if (disabled) return;
    editMode = {
      kind: "add",
      field: field.name,
      operator: field.operators[0] ?? ":",
      value: field.valueKind === "boolean" ? "true" : "",
    };
  }

  function openEditToken(token: PowerSearchToken) {
    if (disabled) return;
    editMode = {
      kind: "edit",
      tokenId: token.id,
      field: token.field,
      operator: token.operator,
      value: token.value,
    };
  }

  function closeEditor() {
    editMode = null;
  }

  function applyEditor(parts: {
    field: string;
    operator: string;
    value: string;
  }) {
    const mode = editMode;
    editMode = null;
    if (!mode) return;
    if (mode.kind === "add") {
      onTokensChange([
        ...tokens,
        createPowerSearchToken({
          field: parts.field,
          operator: parts.operator,
          value: parts.value,
        }),
      ]);
      return;
    }
    onTokensChange(
      tokens.map((token) =>
        token.id === mode.tokenId
          ? {
              ...token,
              field: parts.field,
              operator: parts.operator,
              value: parts.value,
            }
          : token,
      ),
    );
  }

  function handleCommitText(text: string) {
    const token = commitContentSearchToken(
      filterSyntax,
      contentSearchFieldKey,
      text,
    );
    if (!token) return;
    onTokensChange([...tokens, token]);
  }
</script>

<div
  class="ui-power-search"
  class:ui-power-search--disabled={disabled}
  bind:this={rootEl}
  data-ui-component="power-search"
  role="search"
  aria-label={ariaLabel}
>
  <div class="ui-power-search__bar">
    <span class="ui-power-search__icon" aria-hidden="true">
      <SearchIcon />
    </span>

    <div class="ui-power-search__chips">
      {#each tokens as token (token.id)}
        <div class="ui-power-search__chip" data-ui-part="token">
          <button
            type="button"
            class="ui-power-search__chip-body"
            data-power-search-token={token.id}
            {disabled}
            aria-label={`Edit ${token.field} filter`}
            onclick={() => openEditToken(token)}
          >
            <span class="ui-power-search__chip-meta">
              {token.field}: {powerSearchOperatorLabel(token.operator)}
            </span>
            <span class="ui-power-search__chip-value">{token.value}</span>
          </button>
          <button
            type="button"
            class="ui-power-search__chip-remove"
            {disabled}
            aria-label={`Remove ${token.field} filter`}
            onclick={() => removeToken(token.id)}
          >
            <XIcon />
          </button>
        </div>
      {/each}

      <PowerSearchFieldCombobox
        bind:this={combobox}
        {filterSyntax}
        {placeholder}
        {disabled}
        ariaLabel="Add filter field"
        onSelectField={openAddForField}
        onCommitText={contentSearchFieldKey ? handleCommitText : undefined}
      />
    </div>

    {#if tokens.length > 0}
      <button
        type="button"
        class="ui-power-search__clear-all"
        {disabled}
        aria-label={clearAllLabel}
        title={clearAllLabel}
        onclick={clearAll}
      >
        <XIcon />
      </button>
    {/if}
  </div>

  {#if resultCount != null && resultCount !== ""}
    <p class="ui-power-search__result-count" role="status">
      {resultCount}
    </p>
  {/if}

  {#if editSession && editMode}
    {#key `${editMode.kind}:${editMode.kind === "edit" ? editMode.tokenId : editMode.field}`}
      <SearchFilterPredicateEditor
        session={editSession}
        {filterSyntax}
        {disabled}
        onCancel={closeEditor}
        onApply={applyEditor}
      />
    {/key}
  {/if}
</div>
