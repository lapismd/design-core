<script lang="ts">
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
    onCommit?: (value: string) => void | Promise<void>;
    onEmptyBackspace?: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
  } = $props();

  let input = $state<HTMLInputElement | null>(null);
  let open = $state(false);
  let activeIndex = $state(0);
  const listId = `autocomplete-list-${Math.random().toString(36).slice(2)}`;

  const normalizedSuggestions = $derived.by(() => {
    const seen = new Set<string>();
    const needle = value.trim().toLowerCase();
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

  function chooseSuggestion(suggestion: string) {
    value = suggestion;
    if (!forceOpen) open = false;
    activeIndex = 0;
    void onCommit(suggestion);
  }

  function commitValue() {
    const committed = value.trim();
    if (!committed) return;
    if (!forceOpen) open = false;
    void onCommit(committed);
  }

  function closeList() {
    if (forceOpen) return;
    open = false;
    activeIndex = 0;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      open = true;
      activeIndex = Math.min(
        activeIndex + 1,
        Math.max(normalizedSuggestions.length - 1, 0),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
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

<div class="autocomplete-input">
  <input
    {id}
    bind:this={input}
    bind:value
    {placeholder}
    aria-label={ariaLabel}
    aria-autocomplete="list"
    aria-controls={listId}
    aria-expanded={listVisible ? "true" : "false"}
    role="combobox"
    onfocus={() => (open = true)}
    oninput={() => {
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
  {#if listVisible}
    <div id={listId} class="autocomplete-list" role="listbox">
      {#each normalizedSuggestions as suggestion, index (suggestion)}
        <button
          type="button"
          role="option"
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
  {/if}
</div>

<style>
  .autocomplete-input {
    position: relative;
    min-width: 0;
  }

  input {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  .autocomplete-list {
    position: absolute;
    top: calc(100% + 0.35rem);
    left: 0;
    z-index: 30;
    display: grid;
    gap: 0.5rem;
    width: min(18rem, 80vw);
    max-height: 14rem;
    overflow: auto;
    border: 1px solid var(--ui-form-border);
    border-radius: 0.45rem;
    background: var(--ui-form-popover);
    box-shadow: 0 14px 30px
      var(--ui-form-shadow);
    padding: 0.25rem;
  }

  .autocomplete-list button {
    border: 0;
    border-radius: 0.3rem;
    background: transparent;
    color: var(--ui-form-foreground);
    cursor: pointer;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 800;
    padding: 0.45rem 0.55rem;
    text-align: left;
  }

  .autocomplete-list button:hover,
  .autocomplete-list button.active,
  .autocomplete-list button.force-hover {
    background: color-mix(
      in srgb,
      var(--ui-form-accent) 12%,
      transparent
    );
    color: var(--ui-form-accent);
  }
</style>
