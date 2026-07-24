<script lang="ts">
  import LetterText from "@lucide/svelte/icons/letter-text";
  import Play from "@lucide/svelte/icons/play";
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
      variant="secondary"
      size="icon-sm"
      class="bc-query-composer__options"
      aria-label="Format query"
      title="Format query"
      onclick={() => onFormat(value)}
    >
      <LetterText class="bc-query-composer__format-icon" aria-hidden="true" />
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
      variant="secondary"
      size="xs"
      class="bc-query-composer__execute"
    >
      {executeLabel}
      <Play class="bc-query-composer__execute-icon" aria-hidden="true" />
    </Button>
  </div>
</form>

<style>
  .bc-query-composer {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    min-height: calc(
      var(--ui-beancount-compact-control-height) + var(--ui-beancount-space-2) -
        2px
    );
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 35%,
      transparent
    );
    padding-inline: 0;
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-query-composer__search-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    margin-inline-start: var(--ui-beancount-space-3);
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
    align-self: end;
    overflow: hidden;
    margin-inline: 0 var(--ui-beancount-space-1);
    margin-block-end: var(--ui-beancount-space-1);
    border-radius: var(--radius-md);
  }

  :global(.bc-query-composer__options),
  :global(.bc-query-composer__clear) {
    width: calc(
      var(--ui-beancount-compact-control-height) - var(--ui-beancount-space-1)
    );
    min-width: calc(
      var(--ui-beancount-compact-control-height) - var(--ui-beancount-space-1)
    );
    height: calc(
      var(--ui-beancount-compact-control-height) - var(--ui-beancount-space-1)
    );
    border-radius: 0;
  }

  :global(.bc-query-composer__options) {
    border-inline-end: 1px solid var(--ui-beancount-border);
  }

  :global(.bc-query-composer__format-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
  }

  :global(.bc-query-composer__execute) {
    border-radius: 0;
    min-height: calc(
      var(--ui-beancount-compact-control-height) - var(--ui-beancount-space-1)
    );
    height: calc(
      var(--ui-beancount-compact-control-height) - var(--ui-beancount-space-1)
    );
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-foreground);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-query-composer__execute-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }
</style>
