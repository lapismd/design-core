<script lang="ts">
  import { autosizeTextarea } from "../core/autosize-textarea";
  import "./ListEditor.css";
  import "../form-control-row/FormControlRow.css";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { onDestroy } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import type { FieldReview } from "../core/field-review";
  import FieldReviewActions from "../field-review-actions/FieldReviewActions.svelte";
  import UnifiedReviewDiff from "../unified-review-diff/UnifiedReviewDiff.svelte";
  import SortableArrayItem from "../sortable-array-item/SortableArrayItem.svelte";

  let {
    label,
    items = [],
    addLabel = "Add",
    multiline = true,
    multilineSize = "normal",
    placeholder = "",
    variant = "inline",
    headerVariant = "field",
    readonly = false,
    reviewItems = {},
    /** Validation message shown under the list. */
    error = null,
    onChange,
  }: {
    label: string;
    items?: string[];
    addLabel?: string;
    multiline?: boolean;
    multilineSize?: "normal" | "compact";
    placeholder?: string;
    variant?: "boxed" | "inline";
    headerVariant?: "field" | "section";
    /** Hide add / drag / remove; textareas become readonly. Review UI still shows. */
    readonly?: boolean;
    /** Pending Keep/Undo reviews keyed by item index. */
    reviewItems?: Record<number, FieldReview | null | undefined>;
    error?: string | null;
    onChange: (items: string[]) => void;
  } = $props();

  let draggingIndex = $state<number | null>(null);

  const isInline = $derived(variant === "inline");
  const isFieldHeader = $derived(headerVariant === "field");
  const useControlRowChrome = $derived(isInline && isFieldHeader);
  const hostClass = $derived(isInline ? "cv-control-row-group" : undefined);
  const headerClass = $derived(
    useControlRowChrome ? "cv-control-action-row" : undefined,
  );
  const labelClass = $derived(
    useControlRowChrome ? "cv-control-action-row__label" : undefined,
  );
  const controlClass = $derived(
    useControlRowChrome ? "cv-control-action-row__control" : undefined,
  );

  function reviewForIndex(index: number) {
    return reviewItems[index] ?? null;
  }

  function arrayMove<T>(values: T[], from: number, to: number): T[] {
    const next = [...values];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  }

  function update(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function add() {
    onChange([...items, ""]);
  }

  function singularizeLabel(value: string) {
    const trimmed = value.trim();
    if (trimmed.endsWith("ies")) return `${trimmed.slice(0, -3)}y`;
    if (trimmed.endsWith("s") && !trimmed.endsWith("ss"))
      return trimmed.slice(0, -1);
    return trimmed;
  }

  function inferredPlaceholder() {
    if (placeholder) return placeholder;
    const normalizedAddLabel = addLabel.trim();
    if (normalizedAddLabel.toLowerCase().startsWith("add "))
      return normalizedAddLabel;
    if (normalizedAddLabel && normalizedAddLabel.toLowerCase() !== "add") {
      return `Add ${normalizedAddLabel}`;
    }
    return `Add ${singularizeLabel(label)}`;
  }

  function startDrag(event: PointerEvent, index: number) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    draggingIndex = index;
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag, { once: true });
    window.addEventListener("pointercancel", finishDrag, { once: true });
  }

  function handlePointerMove(event: PointerEvent) {
    if (draggingIndex === null) return;
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const item = element?.closest("[data-sortable-item]") as HTMLElement | null;
    const targetIndex = Number(item?.dataset.sortableIndex);
    if (
      !Number.isInteger(targetIndex) ||
      targetIndex < 0 ||
      targetIndex >= items.length
    )
      return;
    if (targetIndex === draggingIndex) return;
    onChange(arrayMove([...items], draggingIndex, targetIndex));
    draggingIndex = targetIndex;
  }

  function finishDrag() {
    draggingIndex = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", finishDrag);
    window.removeEventListener("pointercancel", finishDrag);
  }

  onDestroy(finishDrag);
</script>

<div
  class={hostClass}
  data-ui-component="list-editor"
  data-ui-part="list-editor"
  data-variant={variant}
  data-header-variant={headerVariant}
  data-readonly={readonly ? "" : undefined}
  data-invalid={error ? "" : undefined}
>
  <div
    class={headerClass}
    data-ui-component="list-editor"
    data-ui-part="list-editor-header"
  >
    <span
      class={labelClass}
      data-ui-component="list-editor"
      data-ui-part="list-editor-label"
    >
      {label}
    </span>
    {#if !readonly}
      <div class={controlClass}>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          class="ui-list-editor__add"
          onclick={add}
        >
          <PlusIcon data-icon="inline-start" aria-hidden="true" />
          {addLabel}
        </Button>
      </div>
    {/if}
  </div>

  <div data-ui-component="list-editor" data-ui-part="list-editor-items">
    {#each items as item, index (`${label}-${index}`)}
      {@const review = reviewForIndex(index)}
      <SortableArrayItem
        id={`${label}-${index}`}
        {index}
        dragging={!readonly && draggingIndex === index}
        compact={variant === "inline"}
        removable={!readonly}
        onDragStart={readonly ? undefined : startDrag}
        onRemove={readonly
          ? undefined
          : () => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
      >
        <div
          data-ui-component="list-editor"
          data-ui-part="list-editor-item-body"
        >
          {#if review}
            <UnifiedReviewDiff before={review.removedValue} after={item} />
            <FieldReviewActions
              stale={review.stale}
              onUndo={review.onUndo}
              onKeep={review.onKeep}
            />
          {:else}
            <textarea
              data-ui-component="list-editor"
              data-ui-part="list-editor-input"
              data-multiline={variant !== "inline" && multiline
                ? ""
                : undefined}
              rows={variant === "inline" ||
              !multiline ||
              multilineSize === "compact"
                ? 1
                : 3}
              use:autosizeTextarea={item}
              value={item}
              placeholder={inferredPlaceholder()}
              aria-label={`${label} ${index + 1}`}
              {readonly}
              oninput={(event) => update(index, event.currentTarget.value)}
            ></textarea>
          {/if}
        </div>
      </SortableArrayItem>
    {/each}
  </div>

  {#if error}
    <p
      data-ui-component="list-editor"
      data-ui-part="list-editor-error"
      role="alert"
    >
      {error}
    </p>
  {/if}
</div>
