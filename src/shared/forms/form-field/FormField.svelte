<script lang="ts">
  import type { Snippet } from "svelte";
  // Ensure bare `.cv-structured-form` hosts get the 2-col grid FormField subgrids into.
  import "../structured-form/structured-form.css";

  let {
    label,
    align = "start",
    as = "label",
    children,
  }: {
    label: string;
    align?: "start" | "center";
    as?: "label" | "div";
    children?: Snippet;
  } = $props();

  const labelId = `cv-form-field-${Math.random().toString(36).slice(2, 10)}`;
</script>

{#if as === "div"}
  <div
    class="cv-form-field"
    data-align={align}
    role="group"
    aria-labelledby={labelId}
  >
    <span id={labelId}>{label}</span>
    <div class="cv-form-field-control">
      {@render children?.()}
    </div>
  </div>
{:else}
  <label class="cv-form-field" data-align={align}>
    <span>{label}</span>
    <div class="cv-form-field-control">
      {@render children?.()}
    </div>
  </label>
{/if}

<style>
  .cv-form-field {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: var(--ui-form-column-gap);
    row-gap: 0;
    align-items: start;
    border-bottom: 1px solid var(--ui-form-border);
  }

  @supports (grid-template-columns: subgrid) {
    :global(.cv-structured-form) > .cv-form-field,
    :global(.ui-structured-form) > .cv-form-field {
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      column-gap: var(--ui-form-column-gap);
    }
  }

  .cv-form-field[data-align="center"] {
    align-items: stretch;
  }

  .cv-form-field > span {
    color: var(--ui-form-muted);
    font-size: 0.75rem;
    font-weight: 500;
    padding-top: 0.45rem;
  }

  .cv-form-field[data-align="center"] > span {
    display: flex;
    align-items: center;
    min-height: 2.65rem;
    padding-top: 0;
  }

  .cv-form-field-control {
    min-width: 0;
  }

  .cv-form-field[data-align="center"] .cv-form-field-control {
    display: flex;
    align-items: center;
    min-height: 2.65rem;
    padding-block: 0.35rem;
    box-sizing: border-box;
  }

  .cv-form-field-control :global(input),
  .cv-form-field-control :global(textarea) {
    width: 100%;
    min-width: 0;
    border: 0;
    border-radius: 0;
    border-bottom: 0;
    background: transparent;
    color: var(--ui-form-foreground);
    font: inherit;
    line-height: 1.45;
    padding: 0.35rem 0;
  }

  .cv-form-field-control :global(textarea) {
    min-height: 1.8rem;
    overflow: hidden;
    resize: none;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .cv-form-field-control :global(input:focus),
  .cv-form-field-control :global(input:focus-visible),
  .cv-form-field-control :global(textarea:focus),
  .cv-form-field-control :global(textarea:focus-visible) {
    outline: 0;
    box-shadow: none;
  }

  @media (max-width: 480px) {
    .cv-form-field {
      grid-column: auto;
      grid-template-columns: 1fr;
      row-gap: 0.25rem;
    }

    :global(.cv-structured-form) > .cv-form-field {
      grid-column: auto;
      grid-template-columns: 1fr;
    }
  }
</style>
