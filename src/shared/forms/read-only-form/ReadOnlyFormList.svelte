<script lang="ts">
  let {
    label,
    items = [],
    highlightedIndexes = [],
  }: {
    label: string;
    items?: string[];
    highlightedIndexes?: number[];
  } = $props();

  function isHighlighted(index: number) {
    return highlightedIndexes.includes(index);
  }
</script>

<div class="cv-readonly-form-list">
  <span>{label}</span>
  <div>
    {#if items.length > 0}
      {#each items as item, index (`${label}-${index}`)}
        <p class:highlighted={isHighlighted(index)}>{item || " "}</p>
      {/each}
    {:else}
      <p></p>
    {/if}
  </div>
</div>

<style>
  .cv-readonly-form-list {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.75rem;
    min-height: 2rem;
    align-items: start;
    border-bottom: 1px solid
      var(--ui-form-border);
    padding: 0.375rem 0;
  }

  .cv-readonly-form-list > span {
    color: var(--ui-form-muted);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .cv-readonly-form-list > div {
    display: grid;
    gap: 0;
    min-width: 0;
  }

  .cv-readonly-form-list p {
    color: var(--ui-form-foreground);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    padding: 0 0.25rem;
    white-space: pre-wrap;
  }

  .cv-readonly-form-list p.highlighted {
    background: color-mix(
      in srgb,
      var(--ui-form-accent) 9%,
      transparent
    );
    box-shadow: inset 0 -1px color-mix(in srgb, var(--ui-form-accent)
          34%, var(--ui-form-border));
  }

  @media (max-width: 480px) {
    .cv-readonly-form-list {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }
</style>
