<script lang="ts">
  import "./AutocompleteInput.css";
  import * as Popover from "@lapismd/design-core/shadcn/popover";

  let {
    id = undefined,
    value = $bindable(""),
    suggestions = [],
    placeholder = "",
    ariaLabel = "Autocomplete",
    autofocus = false,
    /** Keep the suggestion list open (visual-state stories). */
    forceOpen = false,
    /**
     * Force a suggestion row into the hover style (visual-state stories).
     * Independent of keyboard `activeIndex` so active + hover can be shown together.
     */
    forceHoverIndex = undefined,
    commitOnComma = false,
    commitOnBlur = false,
    commitOnTab = false,
    /** Validation message; sets aria-invalid and renders below the input. */
    error = null,
    onCommit = () => {},
    onEmptyBackspace = () => {},
    onCancel = () => {},
  }: {
    id?: string;
    value?: string;
    suggestions?: string[];
    placeholder?: string;
    ariaLabel?: string;
    autofocus?: boolean;
    forceOpen?: boolean;
    forceHoverIndex?: number;
    commitOnComma?: boolean;
    commitOnBlur?: boolean;
    commitOnTab?: boolean;
    error?: string | null;
    onCommit?: (value: string) => void | Promise<void>;
    onEmptyBackspace?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
  } = $props();

  let input = $state<HTMLInputElement | null>(null);
  let open = $state(false);
  let editing = $state(false);
  let filterValue = $state("");
  let activeIndex = $state(0);
  const listId = `autocomplete-list-${Math.random().toString(36).slice(2)}`;

  const normalizedSuggestions = $derived.by(() => {
    const seen = new Set<string>();
    const needle = (editing ? filterValue : value).trim().toLowerCase();
    return suggestions
      .map((suggestion) => suggestion.trim())
      .filter(Boolean)
      .filter((suggestion) => {
        const key = suggestion.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return !needle || key.includes(needle);
      })
      .slice(0, 8);
  });

  const listVisible = $derived(
    (forceOpen || open) && normalizedSuggestions.length > 0,
  );

  $effect(() => {
    if (!autofocus) return;
    requestAnimationFrame(() => {
      input?.focus();
      input?.select();
    });
  });

  function setPopoverOpen(next: boolean) {
    if (forceOpen) return;
    if (next) {
      beginEditing();
    } else {
      closeList();
    }
  }

  function beginEditing() {
    editing = true;
    filterValue = "";
    open = true;
    activeIndex = 0;
    requestAnimationFrame(() => {
      const currentInput = input;
      if (
        currentInput &&
        currentInput.ownerDocument.activeElement === currentInput
      ) {
        currentInput.select();
      }
    });
  }

  function chooseSuggestion(suggestion: string) {
    value = suggestion;
    if (!forceOpen) open = false;
    editing = false;
    filterValue = "";
    activeIndex = 0;
    void onCommit(suggestion);
  }

  function commitValue() {
    const committed = value.trim();
    if (!committed) return;
    if (!forceOpen) open = false;
    editing = false;
    filterValue = "";
    void onCommit(committed);
  }

  function closeList() {
    if (forceOpen) return;
    open = false;
    editing = false;
    filterValue = "";
    activeIndex = 0;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) beginEditing();
      open = true;
      activeIndex = Math.min(
        activeIndex + 1,
        Math.max(normalizedSuggestions.length - 1, 0),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) beginEditing();
      open = true;
      activeIndex = Math.max(activeIndex - 1, 0);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (listVisible && normalizedSuggestions[activeIndex]) {
        chooseSuggestion(normalizedSuggestions[activeIndex]);
      } else {
        commitValue();
      }
      return;
    }
    if (commitOnComma && event.key === ",") {
      event.preventDefault();
      commitValue();
      return;
    }
    if (event.key === "Tab") {
      if (commitOnTab && value.trim()) {
        commitValue();
      }
      closeList();
      return;
    }
    if (event.key === "Backspace" && !value) {
      void onEmptyBackspace();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      open = false;
      void onCancel();
    }
  }
</script>

<div
  class="ui-autocomplete-input"
  data-ui-component="autocomplete-input"
  data-ui-part="autocomplete-input"
>
  <Popover.Root open={listVisible} onOpenChange={setPopoverOpen}>
    <input
      {id}
      bind:this={input}
      bind:value
      type="text"
      {placeholder}
      aria-label={ariaLabel}
      aria-autocomplete="list"
      aria-controls={listId}
      aria-expanded={listVisible ? "true" : "false"}
      aria-haspopup="listbox"
      aria-invalid={error ? "true" : undefined}
      role="combobox"
      onfocus={beginEditing}
      onclick={() => {
        if (!open) beginEditing();
      }}
      oninput={() => {
        editing = true;
        filterValue = value;
        open = true;
        activeIndex = 0;
      }}
      onkeydown={handleKeydown}
      onblur={() => {
        if (commitOnBlur) {
          commitValue();
        }
        closeList();
      }}
    />
    <Popover.Content
      class="ui-autocomplete-input__popover"
      align="start"
      sideOffset={6}
      customAnchor={input}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={(event) => event.preventDefault()}
    >
      <div id={listId} class="ui-autocomplete-input__list" role="listbox">
        {#each normalizedSuggestions as suggestion, index (suggestion)}
          <button
            type="button"
            role="option"
            class="ui-autocomplete-input__item"
            class:active={index === activeIndex}
            class:force-hover={forceHoverIndex === index}
            aria-selected={index === activeIndex}
            onmousedown={(event) => event.preventDefault()}
            onclick={() => chooseSuggestion(suggestion)}
          >
            {suggestion}
          </button>
        {/each}
      </div>
    </Popover.Content>
  </Popover.Root>
  {#if error}
    <p class="ui-form-control-error" role="alert">{error}</p>
  {/if}
</div>
