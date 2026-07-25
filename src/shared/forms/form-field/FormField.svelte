<script lang="ts">
  import "./FormField.css";
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
    data-ui-component="form-field"
    data-ui-part="form-field"
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
    data-ui-component="form-field"
    data-ui-part="form-field"
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
