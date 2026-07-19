<script lang="ts">
  let {
    value,
    options,
    labels = {},
    ariaLabel,
    onChange = () => {},
  }: {
    value: string;
    options: string[];
    labels?: Record<string, string>;
    ariaLabel: string;
    onChange?: (value: string) => void;
  } = $props();
</script>

<div class="cv-form-segmented" aria-label={ariaLabel}>
  {#each options as option (option)}
    <button
      type="button"
      class:active={value === option}
      aria-pressed={value === option}
      onclick={() => onChange(option)}
    >
      {labels[option] ?? option}
    </button>
  {/each}
</div>

<style>
  .cv-form-segmented {
    display: inline-flex;
    width: fit-content;
    max-width: 100%;
    overflow: hidden;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 999px;
    background: transparent;
  }

  .cv-form-segmented button {
    min-height: 1.65rem;
    border: 0;
    border-right: 1px solid
      var(--cv-form-border, var(--kanban-border, var(--border)));
    background: transparent;
    color: var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)));
    cursor: pointer;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 650;
    padding: 0 0.65rem;
  }

  .cv-form-segmented button:last-child {
    border-right: 0;
  }

  .cv-form-segmented button:hover,
  .cv-form-segmented button:focus-visible {
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    outline: 0;
  }

  .cv-form-segmented button.active {
    background: var(
      --cv-form-selection,
      color-mix(in srgb, var(--card-color, var(--primary)) 12%, transparent)
    );
    color: var(--cv-form-accent, var(--card-color, var(--primary)));
  }
</style>
