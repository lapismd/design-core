<script lang="ts">
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
  >
    {#if showLabel}
      <label for={inputId}>{label}</label>
    {/if}
    <div
      class="chip-autocomplete-box"
      role="group"
      aria-label={label}
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
              <XIcon />
            </button>
          </span>
          <Tooltip.Content side="top" sideOffset={4} class="chip-tooltip-content">
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

<style>
  .chip-autocomplete {
    display: grid;
    min-width: 0;
    gap: 0.25rem;
    color: var(--ui-form-accent);
    font-size: 0.72rem;
    font-weight: 950;
    text-transform: uppercase;
  }

  .chip-autocomplete label {
    width: fit-content;
    cursor: pointer;
  }

  .chip-autocomplete-box {
    position: relative;
    display: flex;
    min-height: 2.45rem;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem;
    border: 0;
    border-radius: 0.25rem;
    background: var(--ui-form-background);
    padding: 0.32rem 0.4rem;
  }

  .chip-autocomplete.is-embedded .chip-autocomplete-box {
    min-height: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 0.15rem 0;
  }

  .chip {
    display: inline-flex;
    max-width: 12rem;
    min-width: 0;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 1;
    border: 1px solid
      color-mix(
        in srgb,
        var(--ui-form-accent) 22%,
        transparent
      );
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--ui-form-accent) 8%,
      var(--ui-form-background)
    );
    color: var(--ui-form-accent);
    font-size: 0.72rem;
    font-weight: 900;
    line-height: 1;
    padding: 0.27rem 0.32rem 0.27rem 0.55rem;
    text-transform: uppercase;
  }

  .chip-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip-autocomplete.is-normal-case .chip {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: none;
  }

  .chip button {
    display: grid;
    flex: 0 0 auto;
    width: 1.05rem;
    height: 1.05rem;
    place-items: center;
    border: 0;
    border-radius: 999px;
    background: color-mix(
      in srgb,
      var(--ui-form-accent) 12%,
      transparent
    );
    color: inherit;
    cursor: pointer;
    padding: 0;
  }

  .chip :global(svg) {
    width: 0.72rem;
    height: 0.72rem;
  }

  .chip-input {
    min-width: 8rem;
    flex: 1;
    color: var(--ui-form-foreground);
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.2;
    text-transform: none;
  }

  .chip-input :global(input) {
    border: 0 !important;
    box-shadow: none !important;
    outline: 0;
    padding: 0.2rem;
  }

  .chip-autocomplete.is-embedded .chip-input :global(input) {
    padding: 0;
  }

  .chip-tooltip-content {
    z-index: 50;
    max-width: min(22rem, calc(100vw - 2rem));
    border-radius: 0.375rem;
    background: var(--foreground);
    color: var(--background);
    font-size: 0.75rem;
    font-weight: 700;
    line-height: 1.25;
    overflow-wrap: anywhere;
    padding: 0.38rem 0.65rem;
    text-transform: none;
  }
</style>
