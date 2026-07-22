<script lang="ts">
  import * as Popover from "@stevejuma/ui/shadcn/popover";

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

  function setPopoverOpen(next: boolean) {
    if (forceOpen) return;
    open = next;
    if (!next) activeIndex = 0;
  }

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

<div class="ui-autocomplete-input">
  <Popover.Root open={listVisible} onOpenChange={setPopoverOpen}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <input
          {...props}
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
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="ui-autocomplete-input__popover"
      align="start"
      sideOffset={6}
      onOpenAutoFocus={(event) => event.preventDefault()}
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

<style>
  .ui-autocomplete-input {
    position: relative;
    display: grid;
    min-width: 0;
    gap: 0.25rem;
  }

  .ui-autocomplete-input :global(input) {
    width: 100%;
    min-width: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    outline: none;
  }

  :global(.ui-autocomplete-input__popover) {
    z-index: 80;
    width: min(18rem, 80vw);
    min-width: 14rem;
    gap: 0;
    overflow: hidden;
    border: 1px solid var(--ui-form-border);
    border-radius: 0.75rem;
    background: var(--ui-form-popover, var(--ui-form-background));
    color: var(--ui-form-foreground);
    padding: 0;
    box-shadow: 0 1rem 2rem rgb(15 23 42 / 12%);
    outline: 0;
  }

  .ui-autocomplete-input__list {
    display: grid;
    gap: 0.125rem;
    max-height: 14rem;
    overflow: auto;
    outline: 0;
    padding: 0.25rem;
  }

  .ui-autocomplete-input__item {
    display: flex;
    min-width: 0;
    align-items: center;
    border: 0;
    border-radius: 0.25rem;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    padding: 0.375rem 0.5rem;
    text-align: left;
    outline: 0;
    user-select: none;
  }

  .ui-autocomplete-input__item:hover,
  .ui-autocomplete-input__item:focus-visible,
  .ui-autocomplete-input__item.active,
  .ui-autocomplete-input__item.force-hover {
    background: color-mix(
      in srgb,
      var(--ui-form-accent) 9%,
      var(--ui-form-muted-surface, var(--ui-form-background))
    );
    color: var(--ui-form-foreground);
    outline: 0;
  }

  .ui-form-control-error {
    margin: 0;
    color: var(--destructive, #dc2626);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.3;
  }
</style>
