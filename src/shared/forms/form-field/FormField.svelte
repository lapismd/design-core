<script lang="ts">
  import type { Snippet } from "svelte";
  // Ensure bare `.cv-structured-form` hosts get the 2-col grid FormField subgrids into.
  import "../structured-form/structured-form.css";
  import type { FieldReview } from "../core/field-review";
  import FieldReviewActions from "../form-review/FieldReviewActions.svelte";
  import UnifiedReviewDiff from "../form-review/UnifiedReviewDiff.svelte";

  let {
    label,
    align = "middle",
    as = "label",
    readonly = false,
    review = null,
    value = "",
    /** Validation message; marks the field invalid and renders under the control. */
    error = null,
    children,
  }: {
    label: string;
    align?: "start" | "center" | "middle";
    as?: "label" | "div";
    /** Non-interactive presentation; sets `data-readonly` and disables pointer events on the control. */
    readonly?: boolean;
    /** When set, renders Keep/Undo review chrome instead of `children`. Forces start alignment. */
    review?: FieldReview | null;
    /** Current/proposed value used as the review diff "after" side when `review` is set. */
    value?: string;
    error?: string | null;
    children?: Snippet;
  } = $props();

  const labelId = `cv-form-field-${Math.random().toString(36).slice(2, 10)}`;
  const resolvedAlign = $derived(review ? "start" : align);
  // Review actions and error alerts must not nest inside a <label>.
  const resolvedAs = $derived(review || error ? "div" : as);
</script>

{#if resolvedAs === "div"}
  <div
    class="cv-form-field"
    data-align={resolvedAlign}
    data-readonly={readonly ? "" : undefined}
    data-review={review ? "" : undefined}
    data-invalid={error ? "" : undefined}
    role="group"
    aria-labelledby={labelId}
  >
    <span id={labelId}>{label}</span>
    <div class="cv-form-field-control">
      {#if review}
        <UnifiedReviewDiff before={review.removedValue} after={value} />
        <FieldReviewActions
          stale={review.stale}
          onUndo={review.onUndo}
          onKeep={review.onKeep}
        />
      {:else}
        {@render children?.()}
        {#if error}
          <p class="cv-form-field-error" role="alert">{error}</p>
        {/if}
      {/if}
    </div>
  </div>
{:else}
  <label
    class="cv-form-field"
    data-align={resolvedAlign}
    data-readonly={readonly ? "" : undefined}
    data-review={review ? "" : undefined}
    data-invalid={error ? "" : undefined}
  >
    <span>{label}</span>
    <div class="cv-form-field-control">
      {@render children?.()}
      {#if error}
        <p class="cv-form-field-error" role="alert">{error}</p>
      {/if}
    </div>
  </label>
{/if}

<style>
  .cv-form-field {
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: var(--ui-form-column-gap);
    row-gap: 0;
    align-items: center;
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
    line-height: 1.25rem;
    padding-top: 0;
  }

  .cv-form-field[data-align="start"] {
    align-items: start;
  }

  .cv-form-field[data-align="start"] > span {
    /* Multiline / tall controls: pin label to the first value line. */
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

  .cv-form-field-error {
    margin: 0;
    padding: 0 0 0.35rem;
    color: var(--destructive, #dc2626);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.3;
  }

  .cv-form-field[data-invalid] {
    border-bottom-color: color-mix(
      in srgb,
      var(--destructive, #dc2626) 55%,
      var(--ui-form-border)
    );
  }

  .cv-form-field[data-align="center"] .cv-form-field-control {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    min-height: 2.65rem;
    padding-block: 0.35rem;
    box-sizing: border-box;
  }

  .cv-form-field[data-align="center"] .cv-form-field-error {
    flex: 1 0 100%;
  }

  /* Readonly: block interaction on the control; keep text fully readable.
     Review Keep/Undo stays interactive even when readonly is set. */
  .cv-form-field[data-readonly]:not([data-review]) .cv-form-field-control {
    pointer-events: none;
  }

  .cv-form-field-control :global(input),
  .cv-form-field-control :global(textarea) {
    width: 100%;
    min-width: 0;
    min-height: 1.25rem;
    border: 0;
    border-radius: 0;
    border-bottom: 0;
    background: transparent;
    color: var(--ui-form-foreground);
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0;
  }

  /* Match input vertical rhythm so bare buttons/links sit with the label. */
  .cv-form-field:not([data-align="center"])
    .cv-form-field-control
    :global(:where(button, a)) {
    margin: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ui-form-foreground);
    font: inherit;
    font-size: 0.875rem;
    line-height: 1.25rem;
    padding: 0;
    text-align: inherit;
    cursor: pointer;
  }

  .cv-form-field-control :global(textarea) {
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
