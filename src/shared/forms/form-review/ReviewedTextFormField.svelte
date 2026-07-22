<script lang="ts">
  import { autosizeTextarea } from "../core/autosize-textarea";
  import type { FieldReviewContext } from "../core/field-review";
  import FormField from "../form-field/FormField.svelte";

  /** Input types rendered as a wrapping, single-row textarea instead of `<input>`. */
  const WRAPS_TEXT_TYPES = new Set(["text", "email", "search", "tel", "url"]);

  let {
    value = "",
    field,
    context = undefined,
    update,
    reviewKey = field.id,
    multiline = false,
    multilineSize = "normal",
    inputType = field.inputType ?? "text",
  }: {
    value?: string;
    field: {
      id: string;
      label: string;
      placeholder?: string;
      inputType?: string;
    };
    context?: FieldReviewContext;
    update: (value: string) => void | Promise<void>;
    reviewKey?: string;
    multiline?: boolean;
    multilineSize?: "normal" | "compact";
    inputType?: string;
  } = $props();

  const review = $derived(context?.reviewForField?.(reviewKey) ?? null);
  const textValue = $derived(typeof value === "string" ? value : "");
  const useTextarea = $derived(multiline || WRAPS_TEXT_TYPES.has(inputType));
  const rows = $derived(multiline && multilineSize !== "compact" ? 3 : 1);
</script>

<FormField
  label={field.label}
  value={textValue}
  {review}
  align={multiline || review ? "start" : "middle"}
>
  {#if useTextarea}
    <textarea
      {rows}
      use:autosizeTextarea={textValue}
      value={textValue}
      placeholder={field.placeholder ?? ""}
      aria-label={field.label}
      oninput={(event) => void update(event.currentTarget.value)}
    ></textarea>
  {:else}
    <input
      type={inputType}
      value={textValue}
      placeholder={field.placeholder ?? ""}
      aria-label={field.label}
      oninput={(event) => void update(event.currentTarget.value)}
    />
  {/if}
</FormField>
