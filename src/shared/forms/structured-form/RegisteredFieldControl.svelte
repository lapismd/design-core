<script lang="ts">
  import ChipAutocomplete from "../chip-autocomplete/ChipAutocomplete.svelte";
  import ColorPicker from "../color-picker/ColorPicker.svelte";
  import CyclePicker from "../cycle-picker/CyclePicker.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import InlineOptionPicker from "../inline-option-picker/InlineOptionPicker.svelte";
  import type { InlineOptionPickerOption } from "../inline-option-picker/InlineOptionPicker.svelte";
  import ListEditor from "../list-editor/ListEditor.svelte";
  import ReferencePicker from "../reference-picker/ReferencePicker.svelte";
  import SegmentedControl from "../segmented-control/SegmentedControl.svelte";
  import TimePicker from "../time-picker/TimePicker.svelte";
  import { autosizeTextarea } from "../core/autosize-textarea";
  import type { ReferenceIndex } from "../core/reference-utils";
  import type { FormFieldConfig, FormValidationIssue } from "../core/types";

  type AnyFieldConfig = FormFieldConfig<any, any, any>;

  let {
    root,
    value,
    field,
    context,
    issues = [],
    update,
    blur = () => {},
  }: {
    root: unknown;
    value: unknown;
    field: AnyFieldConfig;
    context: unknown;
    issues?: FormValidationIssue[];
    update: (value: unknown) => void | Promise<void>;
    blur?: () => void;
  } = $props();

  const error = $derived(issues[0]?.message ?? null);

  function textValue() {
    if (value === null || value === undefined) return "";
    return typeof value === "string" ? value : String(value);
  }

  function arrayValue() {
    return Array.isArray(value) ? value.map(String) : [];
  }

  function optionsFor() {
    const source = field.options;
    if (!source) return [];
    const args = { root, value, field, context };
    return (
      typeof source === "function" ? source(args) : source
    ) as InlineOptionPickerOption[];
  }

  function suggestionsFor() {
    const source = field.suggestions;
    if (!source) return [];
    const args = { root, value, field, context };
    return typeof source === "function" ? source(args) : source;
  }

  function referenceIndexFor(): ReferenceIndex {
    const source = field.referenceIndex;
    if (!source) return { references: [], duplicates: {} };
    const args = { root, value, field, context };
    return typeof source === "function" ? source(args) : source;
  }
</script>

{#if field.kind === "ordered-string-list"}
  <ListEditor
    label={field.label}
    items={arrayValue()}
    addLabel={field.addLabel ?? "Add"}
    placeholder={field.placeholder ?? ""}
    multiline={false}
    {error}
    onChange={update}
  />
{:else if field.kind === "reference-list"}
  <ReferencePicker
    label={field.label}
    refs={arrayValue()}
    referenceIndex={referenceIndexFor()}
    addLabel={field.addLabel ?? "Add Reference"}
    addHeading={field.addHeading ?? "Reference"}
    searchPlaceholder={field.searchPlaceholder ?? "Search references..."}
    {error}
    onChange={update}
  />
{:else if field.kind === "textarea"}
  <textarea
    rows={field.rows ?? 1}
    use:autosizeTextarea={textValue()}
    value={textValue()}
    placeholder={field.placeholder ?? ""}
    aria-label={field.ariaLabel ?? field.label}
    aria-invalid={issues.length ? "true" : undefined}
    oninput={(event) => update(event.currentTarget.value)}
    onblur={blur}
  ></textarea>
{:else if field.kind === "date"}
  <DatePicker
    value={textValue() || undefined}
    ariaLabel={field.ariaLabel ?? field.label}
    {error}
    onValueChange={(next) => update(next ?? "")}
  />
{:else if field.kind === "time"}
  <TimePicker
    value={textValue() || undefined}
    ariaLabel={field.ariaLabel ?? field.label}
    placeholder={field.placeholder}
    {error}
    onValueChange={(next) => update(next ?? "")}
  />
{:else if field.kind === "boolean"}
  <button
    type="button"
    class="cv-forms-switch"
    role="switch"
    aria-label={field.ariaLabel ?? field.label}
    aria-checked={value === true}
    aria-invalid={issues.length ? "true" : undefined}
    onclick={() => update(value !== true)}
    onblur={blur}
  >
    <span class="cv-forms-switch-track" aria-hidden="true">
      <span class="cv-forms-switch-thumb"></span>
    </span>
  </button>
{:else if field.kind === "color"}
  <ColorPicker
    value={textValue()}
    placeholder={field.placeholder ?? ""}
    ariaLabel={field.ariaLabel ?? field.label}
    format={field.colorFormat ?? "hex"}
    {error}
    onChange={update}
    onBlur={blur}
  />
{:else if field.kind === "options" && field.presentation === "cycle"}
  <CyclePicker
    value={textValue()}
    options={optionsFor()}
    placeholder={field.placeholder ?? "Select option"}
    ariaLabel={field.ariaLabel ?? field.label}
    preview={field.optionPreview ?? "plain"}
    {error}
    onChange={update}
    onBlur={blur}
  />
{:else if field.kind === "options" || field.kind === "choice"}
  <InlineOptionPicker
    value={textValue()}
    options={optionsFor()}
    presentation={field.presentation === "menu" || field.presentation === "swap"
      ? field.presentation
      : field.kind === "choice"
        ? "menu"
        : "swap"}
    ariaLabel={field.ariaLabel ?? field.label}
    {error}
    onChange={update}
  />
{:else if field.kind === "segmented"}
  <SegmentedControl
    value={textValue()}
    options={optionsFor().map((option) => option.value)}
    labels={Object.fromEntries(
      optionsFor().map((option) => [option.value, option.label]),
    )}
    ariaLabel={field.ariaLabel ?? field.label}
    {error}
    onChange={update}
  />
{:else if field.kind === "tag-list" || field.kind === "chip-list" || field.kind === "string-list"}
  <ChipAutocomplete
    value={arrayValue()}
    suggestions={suggestionsFor()}
    label={field.label}
    showLabel={false}
    placeholder={field.placeholder ??
      (field.kind === "tag-list" ? "Add tag..." : "Add item...")}
    {error}
    onChange={update}
  />
{:else if field.kind === "custom"}
  <p class="cv-forms-missing-renderer" role="alert">
    No renderer is registered for {field.label}.
  </p>
{:else}
  <input
    type={field.inputType ?? "text"}
    value={textValue()}
    placeholder={field.placeholder ?? ""}
    autocomplete={field.autocomplete}
    aria-label={field.ariaLabel ?? field.label}
    aria-invalid={issues.length ? "true" : undefined}
    oninput={(event) => update(event.currentTarget.value)}
    onblur={blur}
  />
{/if}
