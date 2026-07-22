<script lang="ts">
  import "../form-control-row/FormControlRow.css";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import { onDestroy } from "svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { FieldReview } from "../core/field-review";
  import FieldReviewActions from "../form-review/FieldReviewActions.svelte";
  import UnifiedReviewDiff from "../form-review/UnifiedReviewDiff.svelte";
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
  class={variant === "inline"
    ? "cv-control-row-group gap-0"
    : "flex flex-col gap-2"}
  data-ui-part="list-editor"
  data-readonly={readonly ? "" : undefined}
  data-invalid={error ? "" : undefined}
>
  <div
    class={headerVariant === "section"
      ? "border-muted-foreground/40 flex items-center justify-between gap-3 border-b pb-0.5"
      : variant === "inline"
        ? "cv-control-action-row"
        : "flex items-center justify-between gap-3"}
  >
    <span
      class={headerVariant === "section"
        ? "text-foreground text-base font-semibold"
        : variant === "inline"
          ? "cv-control-action-row__label"
          : "text-muted-foreground text-xs font-medium"}
    >
      {label}
    </span>
    {#if !readonly}
      <div class={variant === "inline" ? "cv-control-action-row__control" : ""}>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          class={headerVariant === "section"
            ? "text-muted-foreground hover:text-foreground h-4 gap-1 px-0 text-xs font-normal hover:bg-transparent [&_svg]:size-3"
            : variant === "inline"
              ? "text-muted-foreground hover:text-foreground h-5 gap-1 px-0 text-xs font-normal hover:bg-transparent [&_svg]:size-3"
              : "text-muted-foreground hover:text-foreground h-5 gap-1 px-0 text-xs font-normal hover:bg-transparent [&_svg]:size-3"}
          onclick={add}
        >
          <PlusIcon data-icon="inline-start" />
          {addLabel}
        </Button>
      </div>
    {/if}
  </div>

  <div
    class={variant === "inline"
      ? "col-span-full flex flex-col"
      : "list-editor-items flex flex-col gap-2"}
  >
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
        <div class="flex min-w-0 flex-col">
          {#if review}
            <UnifiedReviewDiff before={review.removedValue} after={item} />
            <FieldReviewActions
              stale={review.stale}
              onUndo={review.onUndo}
              onKeep={review.onKeep}
            />
          {:else}
            <textarea
              class={variant === "inline"
                ? "min-h-5 w-full resize-none overflow-hidden border-0 bg-transparent px-0 py-0 text-sm leading-5 break-words whitespace-pre-wrap [color:var(--ui-form-foreground)] shadow-none outline-none"
                : multiline
                  ? "border-input bg-background min-h-20 w-full resize-none overflow-hidden rounded-md border px-2 py-1.5 text-sm outline-none"
                  : "border-input bg-background min-h-9 w-full resize-none overflow-hidden rounded-md border px-2 py-1.5 text-sm outline-none"}
              rows={variant === "inline" ||
              !multiline ||
              multilineSize === "compact"
                ? 1
                : 3}
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
    <p class="ui-form-control-error col-span-full" role="alert">{error}</p>
  {/if}
</div>

<style>
  .ui-form-control-error {
    margin: 0;
    color: var(--destructive, #dc2626);
    font-size: 0.75rem;
    font-weight: 500;
    line-height: 1.3;
  }
</style>
