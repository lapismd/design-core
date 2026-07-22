<script lang="ts">
  import "../form-control-row/FormControlRow.css";
  import { autosizeTextarea } from "../core/autosize-textarea";
  import type { FieldReview } from "../core/field-review";
  import FieldReviewActions from "./FieldReviewActions.svelte";
  import UnifiedReviewDiff from "./UnifiedReviewDiff.svelte";

  /** Input types rendered as a wrapping, single-row textarea instead of `<input>`. */
  const WRAPS_TEXT_TYPES = new Set(["text", "email", "search", "tel", "url"]);

  let {
    label,
    value = "",
    placeholder = "",
    ariaLabel,
    type = "text",
    multiline = false,
    multilineSize = "normal",
    controlClass = "",
    review = null,
    onChange,
  }: {
    label: string;
    value?: string;
    placeholder?: string;
    /** Defaults to `label` when omitted. */
    ariaLabel?: string;
    type?: string;
    multiline?: boolean;
    multilineSize?: "normal" | "compact";
    controlClass?: string;
    /** Active AI proposal for this field; renders the diff + Keep/Undo row instead of the editable control. */
    review?: FieldReview | null;
    onChange: (value: string) => void;
  } = $props();

  const resolvedAriaLabel = $derived(ariaLabel ?? label);
  const useTextarea = $derived(multiline || WRAPS_TEXT_TYPES.has(type));
  const rows = $derived(multiline && multilineSize !== "compact" ? 3 : 1);

  function handleInput(nextValue: string) {
    onChange(nextValue);
  }
</script>

<div
  class="cv-control-row"
  class:cv-control-row--start={Boolean(review) || multiline}
  data-ui-part="reviewed-text-control"
>
  <span class="cv-control-row__label">{label}</span>
  <div class="cv-control-row__control reviewed-text-control__control">
    {#if review}
      <UnifiedReviewDiff before={review.removedValue} after={value} />
      <FieldReviewActions
        stale={review.stale}
        onUndo={review.onUndo}
        onKeep={review.onKeep}
      />
    {:else if useTextarea}
      <textarea
        class={["reviewed-text-control__input", controlClass]
          .filter(Boolean)
          .join(" ")}
        {rows}
        use:autosizeTextarea={value}
        {value}
        {placeholder}
        aria-label={resolvedAriaLabel}
        oninput={(event) => handleInput(event.currentTarget.value)}
      ></textarea>
    {:else}
      <input
        class={["reviewed-text-control__input", controlClass]
          .filter(Boolean)
          .join(" ")}
        {type}
        {value}
        {placeholder}
        aria-label={resolvedAriaLabel}
        oninput={(event) => handleInput(event.currentTarget.value)}
      />
    {/if}
  </div>
</div>

<style>
  .reviewed-text-control__control {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }

  .reviewed-text-control__input {
    width: 100%;
    min-width: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: var(--ui-form-foreground);
    font: inherit;
    line-height: 1.45;
    padding: 0.35rem 0;
  }

  textarea.reviewed-text-control__input {
    resize: none;
    overflow: hidden;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .reviewed-text-control__input:focus,
  .reviewed-text-control__input:focus-visible {
    outline: 0;
    box-shadow: none;
  }

  .reviewed-text-control__input::placeholder {
    color: var(--ui-form-muted);
  }
</style>
