<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Search from "@lucide/svelte/icons/search";
  import X from "@lucide/svelte/icons/x";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";

  let {
    value = $bindable(""),
    placeholder = "...enter a BQL query. 'help' to list available commands",
    ariaLabel = "BQL query",
    executeLabel = "Execute",
    clearAfterExecute = false,
    onExecute = () => {},
    onFormat = () => {},
    onClear = () => {},
  }: {
    value?: string;
    placeholder?: string;
    ariaLabel?: string;
    executeLabel?: string;
    /** Fava's full Query workspace clears the command after an execution. */
    clearAfterExecute?: boolean;
    /** The adapter owns query evaluation and receives the entered BQL source. */
    onExecute?: (value: string) => void;
    /** The adapter owns BQL formatting and replaces the bound source when requested. */
    onFormat?: (value: string) => void;
    /** Receives the previous text when the controlled command is cleared. */
    onClear?: (value: string) => void;
  } = $props();

  function execute() {
    const submitted = value;
    onExecute(submitted);
    if (clearAfterExecute && submitted.trim()) value = "";
  }

  function clear() {
    const previous = value;
    value = "";
    onClear(previous);
  }
</script>

<form
  class="bc-query-composer"
  aria-label="Query command bar"
  onsubmit={(event) => {
    event.preventDefault();
    execute();
  }}
>
  <Search class="bc-query-composer__search-icon" aria-hidden="true" />
  <Input
    bind:value
    class="bc-query-composer__input"
    aria-label={ariaLabel}
    {placeholder}
  />
  <div class="bc-query-composer__actions">
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="bc-query-composer__options"
      aria-label="Format query"
      title="Format query"
      onclick={() => onFormat(value)}
    >
      <span class="bc-query-composer__format-glyph" aria-hidden="true">A≡</span>
    </Button>
    {#if value.trim()}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-query-composer__clear"
        aria-label="Clear query"
        title="Clear query"
        onclick={clear}
      >
        <X aria-hidden="true" />
      </Button>
    {/if}
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      class="bc-query-composer__execute"
    >
      {executeLabel}
      <ChevronRight
        class="bc-query-composer__execute-icon"
        aria-hidden="true"
      />
    </Button>
  </div>
</form>

<style>
  .bc-query-composer {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    min-height: calc(var(--ui-beancount-space-5) * 2.5);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    padding-inline: var(--ui-beancount-space-3);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-query-composer__search-icon) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    margin-inline-end: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-query-composer__input) {
    height: auto;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding-inline: 0;
    box-shadow: none;
    font-family: var(--font-mono);
  }

  :global(.bc-query-composer__input:focus-visible) {
    box-shadow: none;
  }

  .bc-query-composer__actions {
    display: flex;
    align-items: center;
    margin-inline-start: var(--ui-beancount-space-3);
  }

  :global(.bc-query-composer__options) {
    border-radius: 0;
    border-inline-end: 1px solid var(--ui-beancount-border);
  }

  :global(.bc-query-composer__clear) {
    border-radius: 0;
  }

  .bc-query-composer__format-glyph {
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: -0.08em;
  }

  :global(.bc-query-composer__execute) {
    border-radius: 0;
    padding-inline: var(--ui-beancount-space-3);
    color: var(--ui-beancount-foreground);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-query-composer__execute-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }
</style>
