<script lang="ts">
  import "./ChipAutocomplete.css";
  import XIcon from "@lucide/svelte/icons/x";

  import * as Tooltip from "../../shadcn/tooltip/index.js";
  import AutocompleteInput from "../autocomplete-input/AutocompleteInput.svelte";

  let {
    value = [],
    suggestions = [],
    label = "Tags",
    showLabel = true,
    placeholder = "Add item...",
    id = undefined,
    embedded = false,
    uppercase = true,
    /** Validation message; forwarded to AutocompleteInput and marks the chip box. */
    error = null,
    onChange = () => {},
  }: {
    value?: string[];
    suggestions?: string[];
    label?: string;
    showLabel?: boolean;
    placeholder?: string;
    id?: string;
    embedded?: boolean;
    uppercase?: boolean;
    error?: string | null;
    onChange?: (items: string[]) => void | Promise<void>;
  } = $props();

  let inputValue = $state("");
  const fallbackInputId = `chip-autocomplete-${Math.random().toString(36).slice(2)}`;
  const inputId = $derived(id ?? fallbackInputId);
  const normalizedItems = $derived(
    value.map((item) => item.trim()).filter(Boolean),
  );
  const availableSuggestions = $derived.by(() => {
    const existing = new Set(normalizedItems.map((item) => item.toLowerCase()));
    const seen = new Set<string>();
    return suggestions
      .map((suggestion) => suggestion.trim())
      .filter(Boolean)
      .filter((suggestion) => {
        const key = suggestion.toLowerCase();
        if (existing.has(key) || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  });

  function commitItem(rawValue = inputValue) {
    const item = rawValue.trim().replace(/^,+|,+$/g, "");
    if (!item) return;
    if (
      normalizedItems.some(
        (current) => current.toLowerCase() === item.toLowerCase(),
      )
    ) {
      inputValue = "";
      return;
    }
    void onChange([...normalizedItems, item]);
    inputValue = "";
  }

  function removeItem(item: string) {
    void onChange(normalizedItems.filter((current) => current !== item));
  }

  function removeLastItem() {
    if (normalizedItems.length) removeItem(normalizedItems.at(-1) ?? "");
  }

  function focusAutocompleteInput(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("button")) return;
    if (!(event.currentTarget instanceof HTMLElement)) return;
    event.currentTarget.querySelector("input")?.focus();
  }
</script>

<Tooltip.Provider delayDuration={200}>
  <div
    class={`chip-autocomplete ${embedded ? "is-embedded" : ""} ${uppercase ? "" : "is-normal-case"}`}
    data-ui-component="chip-autocomplete"
    data-ui-part="chip-autocomplete"
  >
    {#if showLabel}
      <label for={inputId}>{label}</label>
    {/if}
    <div
      class="chip-autocomplete-box"
      role="group"
      aria-label={label}
      data-invalid={error ? "" : undefined}
      onpointerdown={focusAutocompleteInput}
    >
      {#each normalizedItems as item (item)}
        <Tooltip.Root>
          <span class="chip">
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <span class="chip-label" {...props}>{item}</span>
              {/snippet}
            </Tooltip.Trigger>
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onmousedown={(event) => event.stopPropagation()}
              onclick={(event) => {
                event.stopPropagation();
                removeItem(item);
              }}
            >
              <XIcon size={12} strokeWidth={2} aria-hidden="true" />
            </button>
          </span>
          <Tooltip.Content
            side="top"
            sideOffset={4}
            class="chip-tooltip-content"
          >
            {item}
          </Tooltip.Content>
        </Tooltip.Root>
      {/each}
      <div class="chip-input">
        <AutocompleteInput
          id={inputId}
          bind:value={inputValue}
          suggestions={availableSuggestions}
          {placeholder}
          ariaLabel={label}
          {error}
          commitOnComma
          commitOnBlur
          commitOnTab
          onCommit={commitItem}
          onEmptyBackspace={removeLastItem}
        />
      </div>
    </div>
  </div>
</Tooltip.Provider>
