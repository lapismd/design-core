<script lang="ts">
  import type { ReferencePreviewItem } from "../core/reference-utils";

  let {
    title = "",
    meta = "",
    items = [],
  }: {
    title?: string;
    meta?: string;
    items?: ReferencePreviewItem[];
  } = $props();

  function isListHighlighted(
    highlightedIndexes: number[] | undefined,
    index: number,
  ) {
    return highlightedIndexes?.includes(index) ?? false;
  }
</script>

<section class="cv-reference-preview-group">
  {#if title || meta}
    <header>
      {#if title}
        <h4>{title}</h4>
      {/if}
      {#if meta}
        <p>{meta}</p>
      {/if}
    </header>
  {/if}
  <div class="cv-reference-preview-group-body">
    {#each items as item, itemIndex (`${item.kind}-${item.label}-${itemIndex}`)}
      {#if item.kind === "list"}
        <div class="cv-reference-preview-list">
          <span>{item.label}</span>
          <div>
            {#if (item.items?.length ?? 0) > 0}
              {#each item.items ?? [] as listItem, index (`${item.label}-${index}`)}
                <p
                  class:highlighted={isListHighlighted(
                    item.highlightedIndexes,
                    index,
                  )}
                >
                  {listItem || " "}
                </p>
              {/each}
            {:else}
              <p></p>
            {/if}
          </div>
        </div>
      {:else}
        <div
          class:highlighted={item.highlighted ?? false}
          class="cv-reference-preview-row"
        >
          <span>{item.label}</span>
          <p>{item.value || " "}</p>
        </div>
      {/if}
    {/each}
  </div>
</section>

<style>
  .cv-reference-preview-group {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .cv-reference-preview-group > header {
    display: grid;
    gap: 0.1rem;
    border-bottom: 1px solid var(--ui-form-border);
    padding: 0.45rem 0 0.35rem;
  }

  .cv-reference-preview-group h4 {
    color: var(--ui-form-foreground);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    margin: 0;
  }

  .cv-reference-preview-group > header > p {
    color: var(--ui-form-muted);
    font-family: var(
      --ui-form-mono,
      ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace
    );
    font-size: 0.6875rem;
    line-height: 1.35;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .cv-reference-preview-group-body {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .cv-reference-preview-row {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.75rem;
    min-height: 2rem;
    align-items: start;
    border-bottom: 1px solid var(--ui-form-border);
    padding: 0.375rem 0;
  }

  .cv-reference-preview-row.highlighted {
    border-color: color-mix(
      in srgb,
      var(--ui-form-accent) 34%,
      var(--ui-form-border)
    );
    background: color-mix(in srgb, var(--ui-form-accent) 9%, transparent);
  }

  .cv-reference-preview-row > span {
    color: var(--ui-form-muted);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .cv-reference-preview-row > p {
    color: var(--ui-form-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .cv-reference-preview-list {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.75rem;
    min-height: 2rem;
    align-items: start;
    border-bottom: 1px solid var(--ui-form-border);
    padding: 0.375rem 0;
  }

  .cv-reference-preview-list > span {
    color: var(--ui-form-muted);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .cv-reference-preview-list > div {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .cv-reference-preview-list p {
    color: var(--ui-form-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: 0 0.25rem;
    white-space: pre-wrap;
  }

  .cv-reference-preview-list p.highlighted {
    background: color-mix(in srgb, var(--ui-form-accent) 9%, transparent);
    box-shadow: inset 0 -1px color-mix(in srgb, var(--ui-form-accent) 34%, var(--ui-form-border));
  }

  @media (max-width: 480px) {
    .cv-reference-preview-row,
    .cv-reference-preview-list {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }
</style>
