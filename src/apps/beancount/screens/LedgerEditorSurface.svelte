<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";

  export type LedgerEditorTokenTone =
    | "comment"
    | "keyword"
    | "property"
    | "punctuation"
    | "string"
    | "value";

  export type LedgerEditorToken = {
    /** Display-ready source fragment supplied by the application adapter. */
    value: string;
    /** Semantic syntax role; the catalog maps this to normalized tokens. */
    tone?: LedgerEditorTokenTone;
  };

  export type LedgerEditorLine = {
    /** Stable host-owned line identifier. */
    id: string;
    /** One-based display line number. */
    number: number;
    /** Source fragments already classified by the application adapter. */
    tokens: readonly LedgerEditorToken[];
    /** Identifies a collapsible source section. */
    section?: string;
    /** Shows a document heading and keeps it visible when sections collapse. */
    heading?: boolean;
  };

  let {
    lines,
    headersCollapsedAll = false,
    activeLineNumber,
    ariaLabel = "Ledger source preview",
  }: {
    /** Display-ready source lines; parsing and editing stay in the application adapter. */
    lines: readonly LedgerEditorLine[];
    /** Controlled heading state provided by the editor host. */
    headersCollapsedAll?: boolean;
    /** Highlights the host-owned active line without creating an editor selection. */
    activeLineNumber?: number;
    ariaLabel?: string;
  } = $props();

  const visibleLines = $derived(
    lines.filter(
      (line) => !headersCollapsedAll || !line.section || line.heading,
    ),
  );
</script>

<section class="bc-ledger-editor-surface" aria-label={ariaLabel}>
  <ol class="bc-ledger-editor-surface__lines">
    {#each visibleLines as line (line.id)}
      <li
        class="bc-ledger-editor-surface__line"
        data-active={line.number === activeLineNumber}
        data-heading={line.heading ?? false}
      >
        <span class="bc-ledger-editor-surface__gutter" aria-hidden="true">
          {line.number}
        </span>
        <code class="bc-ledger-editor-surface__source">
          {#if line.heading}
            {#if headersCollapsedAll}
              <ChevronRight
                class="bc-ledger-editor-surface__fold-icon"
                aria-hidden="true"
              />
            {:else}
              <ChevronDown
                class="bc-ledger-editor-surface__fold-icon"
                aria-hidden="true"
              />
            {/if}
          {/if}
          {#each line.tokens as token}
            <span
              class={`bc-ledger-editor-surface__token bc-ledger-editor-surface__token--${token.tone ?? "normal"}`}
              >{token.value}</span
            >
          {/each}
        </code>
      </li>
    {/each}
  </ol>
  <span class="bc-ledger-editor-surface__ruler" aria-hidden="true"></span>
</section>

<style>
  .bc-ledger-editor-surface {
    /* Match Fava's display-only CodeMirror rhythm without taking ownership of
     * the editor runtime, parser, or dynamic ruler calculation. */
    --bc-ledger-editor-source-size: 0.85rem;
    --bc-ledger-editor-source-line-height: 1.5;
    --bc-ledger-editor-heading-size: calc(
      var(--bc-ledger-editor-source-size) * 1.602
    );
    --bc-ledger-editor-heading-line-height: 1.2;

    position: relative;
    min-width: max-content;
    min-height: 100%;
    overflow: hidden;
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-foreground);
  }

  .bc-ledger-editor-surface__lines {
    margin: 0;
    padding: var(--ui-beancount-space-1) 0;
    list-style: none;
  }

  .bc-ledger-editor-surface__line {
    display: grid;
    grid-template-columns: calc(var(--ui-beancount-space-5) * 2) max-content;
    min-height: calc(
      var(--bc-ledger-editor-source-size) *
        var(--bc-ledger-editor-source-line-height)
    );
    padding-inline-end: var(--ui-beancount-space-5);
    font-family: var(--font-mono);
    font-size: var(--bc-ledger-editor-source-size);
    line-height: var(--bc-ledger-editor-source-line-height);
    white-space: pre;
  }

  .bc-ledger-editor-surface__line[data-active="true"] {
    background: var(--ui-beancount-code-active-line);
  }

  .bc-ledger-editor-surface__line[data-heading="true"] {
    min-height: 0;
    padding-block-start: var(--ui-beancount-space-4);
    font-family: var(--font-sans);
    font-size: var(--bc-ledger-editor-heading-size);
    font-weight: var(--font-weight-semibold);
    line-height: var(--bc-ledger-editor-heading-line-height);
  }

  .bc-ledger-editor-surface__gutter {
    align-self: center;
    padding-inline-end: var(--ui-beancount-space-3);
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1;
    text-align: end;
    user-select: none;
  }

  .bc-ledger-editor-surface__line[data-active="true"]
    .bc-ledger-editor-surface__gutter {
    color: var(--ui-beancount-review);
  }

  .bc-ledger-editor-surface__source {
    display: flex;
    align-items: baseline;
    min-width: 0;
    font: inherit;
  }

  :global(.bc-ledger-editor-surface__fold-icon) {
    flex: none;
    width: 1.25rem;
    height: 1.25rem;
    margin-inline-end: var(--ui-beancount-space-1);
  }

  .bc-ledger-editor-surface__token--comment {
    color: var(--ui-beancount-code-comment);
  }

  .bc-ledger-editor-surface__token--keyword {
    color: var(--ui-beancount-code-keyword);
  }

  .bc-ledger-editor-surface__token--property {
    color: var(--ui-beancount-code-property);
  }

  .bc-ledger-editor-surface__token--punctuation {
    color: var(--ui-beancount-code-punctuation);
  }

  .bc-ledger-editor-surface__token--string {
    color: var(--ui-beancount-code-string);
  }

  .bc-ledger-editor-surface__token--value {
    color: var(--ui-beancount-code-value);
  }

  .bc-ledger-editor-surface__ruler {
    position: absolute;
    inset-block: 0;
    inset-inline-start: calc(
      (var(--ui-beancount-space-5) * 2) + var(--ui-beancount-space-2) + 55ch
    );
    border-inline-end: 1px dotted var(--ui-beancount-code-comment);
    opacity: 0.5;
    pointer-events: none;
  }
</style>
