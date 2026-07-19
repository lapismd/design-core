<script lang="ts">
  let {
    label,
    value = "",
    highlighted = false,
  }: {
    label: string;
    value?: string;
    highlighted?: boolean;
  } = $props();
</script>

<div class:highlighted class="cv-readonly-form-row">
  <span>{label}</span>
  <p>{value || " "}</p>
</div>

<style>
  .cv-readonly-form-row {
    display: grid;
    grid-template-columns: 8.5rem minmax(0, 1fr);
    gap: 0.75rem;
    min-height: 2rem;
    align-items: start;
    border-bottom: 1px solid
      var(--cv-form-border, var(--kanban-border, var(--border)));
    padding: 0.375rem 0;
  }

  .cv-readonly-form-row.highlighted {
    border-color: color-mix(
      in srgb,
      var(--cv-form-accent, var(--card-color, var(--primary))) 34%,
      var(--cv-form-border, var(--kanban-border, var(--border)))
    );
    background: color-mix(
      in srgb,
      var(--cv-form-accent, var(--card-color, var(--primary))) 9%,
      transparent
    );
  }

  .cv-readonly-form-row > span {
    color: var(--cv-form-muted, var(--kanban-muted, var(--muted-foreground)));
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.25rem;
  }

  .cv-readonly-form-row > p {
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    font-size: 0.8125rem;
    line-height: 1.25rem;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  @media (max-width: 720px) {
    .cv-readonly-form-row {
      grid-template-columns: 1fr;
      gap: 0.1rem;
    }
  }
</style>
