<script lang="ts">
  import type { FieldReviewContext } from "../core/field-review";
  import ListEditor from "../list-editor/ListEditor.svelte";

  let {
    value = [],
    field,
    context = undefined,
    update,
    reviewKey = field.id,
    addLabel = field.addLabel ?? "Add",
    multiline = true,
    multilineSize = "normal",
    placeholder = field.placeholder ?? "",
  }: {
    value?: string[];
    field: {
      id: string;
      label: string;
      addLabel?: string;
      placeholder?: string;
    };
    context?: FieldReviewContext;
    update: (value: string[]) => void | Promise<void>;
    reviewKey?: string;
    addLabel?: string;
    multiline?: boolean;
    multilineSize?: "normal" | "compact";
    placeholder?: string;
  } = $props();

  const reviewItems = $derived(context?.reviewItemsForField?.(reviewKey) ?? {});
</script>

<ListEditor
  label={field.label}
  items={Array.isArray(value) ? value : []}
  {addLabel}
  {multiline}
  {multilineSize}
  {placeholder}
  {reviewItems}
  onChange={(items) => void update(items)}
/>
