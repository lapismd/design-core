<script lang="ts">
  import "./FormFieldRenderer.css";
  import ChipAutocomplete from "../chip-autocomplete/ChipAutocomplete.svelte";
  import DatePicker from "../date-picker/DatePicker.svelte";
  import FormField from "../form-field/FormField.svelte";
  import InlineOptionPicker from "../inline-option-picker/InlineOptionPicker.svelte";
  import type { InlineOptionPickerOption } from "../inline-option-picker/InlineOptionPicker.svelte";
  import ListEditor from "../list-editor/ListEditor.svelte";
  import ReferencePicker from "../reference-picker/ReferencePicker.svelte";
  import SegmentedControl from "../segmented-control/SegmentedControl.svelte";
  import TimePicker from "../time-picker/TimePicker.svelte";
  import { autosizeTextarea } from "../core/autosize-textarea";
  import type { ReferenceIndex } from "../core/reference-utils";

  import {
    defaultFieldAlign,
    defaultFieldWrapper,
    fieldIssuesFor,
    formatFieldValue,
    rendererPropsFor,
    resolveFieldRenderer,
  } from "../core/registry";
  import type {
    FormFieldConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";

  type AnyFieldConfig = FormFieldConfig<any, any, any>;

  let {
    root,
    field,
    view = "edit",
    context = undefined,
    issues = [],
    readonly = false,
    onChange = () => {},
  }: {
    root: unknown;
    field: AnyFieldConfig;
    view?: FormViewName;
    context?: unknown;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    onChange?: (value: unknown) => void | Promise<void>;
  } = $props();

  const value = $derived(field.get(root, context));
  const fieldIssues = $derived(fieldIssuesFor(issues, field));
  const fieldError = $derived(fieldIssues[0]?.message ?? null);
  const customRenderer = $derived(resolveFieldRenderer(field, view, readonly));
  const readonlyView = $derived(
    readonly || field.readonly === true || view === "readonly",
  );
  const fieldReadonly = $derived(
    readonlyView ||
      (view !== "edit" && customRenderer?.interactive !== true) ||
      (view !== "edit" && !customRenderer),
  );

  /** Leaf controls that render their own validation message. */
  const leafOwnsError = $derived(
    field.kind === "date" ||
      field.kind === "time" ||
      field.kind === "options" ||
      field.kind === "choice" ||
      field.kind === "segmented" ||
      field.kind === "tag-list" ||
      field.kind === "chip-list" ||
      field.kind === "string-list" ||
      field.kind === "reference-list" ||
      field.kind === "ordered-string-list",
  );

  function updateValue(nextValue: unknown) {
    if (fieldReadonly || !field.set) return;
    void onChange(field.set(root, nextValue, context));
  }

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

  function previewText() {
    return formatFieldValue(field, value, root, context);
  }

  function rendererArgs() {
    return {
      root,
      value,
      field,
      view,
      context,
      issues: fieldIssues,
      readonly: fieldReadonly,
      update: updateValue,
      updateRoot: onChange,
    };
  }

  function rendererProps() {
    return customRenderer
      ? rendererPropsFor(customRenderer, rendererArgs())
      : rendererArgs();
  }
</script>

{#if customRenderer?.wrapper === "none"}
  {@const Renderer = customRenderer.component}
  <Renderer {...rendererProps()} />
{:else if field.kind === "ordered-string-list"}
  <!-- ListEditor owns its own label/action row chrome. -->
  <ListEditor
    label={field.label}
    items={arrayValue()}
    addLabel={field.addLabel ?? "Add"}
    placeholder={field.placeholder ?? ""}
    multiline={false}
    readonly={fieldReadonly}
    error={fieldError}
    onChange={updateValue}
  />
{:else if field.kind === "reference-list"}
  <!-- ReferencePicker owns list-section chrome (header + Add). -->
  <ReferencePicker
    label={field.label}
    refs={arrayValue()}
    referenceIndex={referenceIndexFor()}
    addLabel={field.addLabel ?? "Add Reference"}
    addHeading={field.addHeading ?? "Reference"}
    searchPlaceholder={field.searchPlaceholder ?? "Search references..."}
    error={fieldError}
    onChange={updateValue}
  />
{:else}
  <FormField
    label={field.label}
    align={customRenderer?.align ??
      field.align ??
      defaultFieldAlign(field.kind)}
    as={customRenderer?.as ?? field.as ?? defaultFieldWrapper(field.kind)}
    readonly={fieldReadonly}
    error={customRenderer || (leafOwnsError && !fieldReadonly)
      ? null
      : fieldError}
  >
    {#if customRenderer}
      {@const Renderer = customRenderer.component}
      <Renderer {...rendererProps()} />
      {#if fieldIssues.length}
        <div id={`${field.id}-issues`} class="cv-forms-field-issues">
          {#each fieldIssues as issue, index (index)}
            <p>{issue.message}</p>
          {/each}
        </div>
      {/if}
    {:else if fieldReadonly}
      <span class="cv-forms-preview-value">{previewText() || " "}</span>
    {:else if field.kind === "textarea"}
      <textarea
        rows={field.rows ?? 1}
        use:autosizeTextarea={textValue()}
        value={textValue()}
        placeholder={field.placeholder ?? ""}
        aria-label={field.ariaLabel ?? field.label}
        aria-invalid={fieldIssues.length ? "true" : undefined}
        oninput={(event) => updateValue(event.currentTarget.value)}
      ></textarea>
    {:else if field.kind === "date"}
      <DatePicker
        value={textValue() || undefined}
        ariaLabel={field.ariaLabel ?? field.label}
        error={fieldError}
        onValueChange={(next) => updateValue(next ?? "")}
      />
    {:else if field.kind === "time"}
      <TimePicker
        value={textValue() || undefined}
        ariaLabel={field.ariaLabel ?? field.label}
        placeholder={field.placeholder}
        error={fieldError}
        onValueChange={(next) => updateValue(next ?? "")}
      />
    {:else if field.kind === "boolean"}
      <button
        type="button"
        class="cv-forms-switch"
        role="switch"
        aria-label={field.ariaLabel ?? field.label}
        aria-checked={value === true}
        aria-invalid={fieldIssues.length ? "true" : undefined}
        onclick={() => updateValue(value !== true)}
      >
        <span class="cv-forms-switch-track" aria-hidden="true">
          <span class="cv-forms-switch-thumb"></span>
        </span>
      </button>
    {:else if field.kind === "options" || field.kind === "choice"}
      <InlineOptionPicker
        value={textValue()}
        options={optionsFor()}
        presentation={field.presentation ??
          (field.kind === "choice" ? "menu" : "swap")}
        ariaLabel={field.ariaLabel ?? field.label}
        error={fieldError}
        onChange={updateValue}
      />
    {:else if field.kind === "segmented"}
      <SegmentedControl
        value={textValue()}
        options={optionsFor().map((option) => option.value)}
        labels={Object.fromEntries(
          optionsFor().map((option) => [option.value, option.label]),
        )}
        ariaLabel={field.ariaLabel ?? field.label}
        error={fieldError}
        onChange={updateValue}
      />
    {:else if field.kind === "tag-list" || field.kind === "chip-list" || field.kind === "string-list"}
      <ChipAutocomplete
        value={arrayValue()}
        suggestions={suggestionsFor()}
        label={field.label}
        showLabel={false}
        placeholder={field.placeholder ??
          (field.kind === "tag-list" ? "Add tag..." : "Add item...")}
        error={fieldError}
        onChange={updateValue}
      />
    {:else}
      <input
        type={field.inputType ?? "text"}
        value={textValue()}
        placeholder={field.placeholder ?? ""}
        autocomplete={field.autocomplete}
        aria-label={field.ariaLabel ?? field.label}
        aria-invalid={fieldIssues.length ? "true" : undefined}
        oninput={(event) => updateValue(event.currentTarget.value)}
      />
    {/if}
  </FormField>
{/if}
