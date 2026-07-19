<script lang="ts">
  import ChipAutocomplete from "./ChipAutocomplete.svelte";
  import FormField from "./FormField.svelte";
  import InlineOptionPicker from "./InlineOptionPicker.svelte";
  import type { InlineOptionPickerOption } from "./InlineOptionPicker.svelte";
  import ReferencePicker from "./ReferencePicker.svelte";
  import SegmentedControl from "./SegmentedControl.svelte";
  import TagEditor from "./TagEditor.svelte";
  import { autosizeTextarea } from "./autosize-textarea";
  import type { ReferenceIndex } from "./reference-utils";

  import {
    defaultFieldAlign,
    defaultFieldWrapper,
    fieldIssuesFor,
    formatFieldValue,
    rendererPropsFor,
    resolveFieldRenderer,
  } from "./registry";
  import type {
    FormFieldConfig,
    FormValidationIssue,
    FormViewName,
  } from "./types";

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
  const customRenderer = $derived(resolveFieldRenderer(field, view, readonly));
  const readonlyView = $derived(
    readonly || field.readonly === true || view === "readonly",
  );
  const fieldReadonly = $derived(
    readonlyView ||
      (view !== "edit" && customRenderer?.interactive !== true) ||
      (view !== "edit" && !customRenderer),
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

  function describedBy() {
    return fieldIssues.length ? `${field.id}-issues` : undefined;
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
{:else}
  <FormField
    label={field.label}
    align={customRenderer?.align ??
      field.align ??
      defaultFieldAlign(field.kind)}
    as={customRenderer?.as ?? field.as ?? defaultFieldWrapper(field.kind)}
  >
    {#if customRenderer}
      {@const Renderer = customRenderer.component}
      <Renderer {...rendererProps()} />
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
        aria-describedby={describedBy()}
        oninput={(event) => updateValue(event.currentTarget.value)}
      ></textarea>
    {:else if field.kind === "date"}
      <input
        type="date"
        value={textValue()}
        aria-label={field.ariaLabel ?? field.label}
        aria-invalid={fieldIssues.length ? "true" : undefined}
        aria-describedby={describedBy()}
        oninput={(event) => updateValue(event.currentTarget.value)}
      />
    {:else if field.kind === "boolean"}
      <button
        type="button"
        class="cv-forms-switch"
        role="switch"
        aria-label={field.ariaLabel ?? field.label}
        aria-checked={value === true}
        aria-invalid={fieldIssues.length ? "true" : undefined}
        aria-describedby={describedBy()}
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
        onChange={updateValue}
      />
    {:else if field.kind === "tag-list"}
      <TagEditor
        value={arrayValue()}
        suggestions={suggestionsFor()}
        label={field.label}
        showLabel={false}
        placeholder={field.placeholder ?? "Add tag..."}
        onChange={updateValue}
      />
    {:else if field.kind === "chip-list" || field.kind === "string-list"}
      <ChipAutocomplete
        value={arrayValue()}
        suggestions={suggestionsFor()}
        label={field.label}
        showLabel={false}
        placeholder={field.placeholder ?? "Add item..."}
        onChange={updateValue}
      />
    {:else if field.kind === "reference-list"}
      <ReferencePicker
        refs={arrayValue()}
        referenceIndex={referenceIndexFor()}
        addLabel={field.addLabel ?? "Add Reference"}
        addHeading={field.addHeading ?? "Reference"}
        searchPlaceholder={field.searchPlaceholder ?? "Search references..."}
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
        aria-describedby={describedBy()}
        oninput={(event) => updateValue(event.currentTarget.value)}
      />
    {/if}

    {#if fieldIssues.length}
      <div id={`${field.id}-issues`} class="cv-forms-field-issues">
        {#each fieldIssues as issue}
          <p>{issue.message}</p>
        {/each}
      </div>
    {/if}
  </FormField>
{/if}

<style>
  .cv-forms-preview-value {
    display: block;
    padding: 0.35rem 0;
    color: var(
      --cv-form-foreground,
      var(--kanban-foreground, var(--foreground))
    );
    font: inherit;
    line-height: 1.45;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  .cv-forms-field-issues {
    display: grid;
    gap: 0.15rem;
    color: var(--destructive);
    font-size: 0.75rem;
    padding: 0 0 0.35rem;
  }

  .cv-forms-field-issues p {
    margin: 0;
  }

  .cv-forms-switch {
    display: inline-grid;
    width: fit-content;
    min-height: 1.6rem;
    align-items: center;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
  }

  .cv-forms-switch-track {
    position: relative;
    display: inline-flex;
    width: 2rem;
    height: 1.15rem;
    align-items: center;
    border: 1px solid var(--cv-form-border, var(--kanban-border, var(--border)));
    border-radius: 999px;
    background: var(
      --cv-form-muted-surface,
      var(--kanban-muted-surface, var(--muted))
    );
    transition:
      background 140ms ease,
      border-color 140ms ease;
  }

  .cv-forms-switch-thumb {
    position: absolute;
    left: 0.13rem;
    width: 0.82rem;
    height: 0.82rem;
    border-radius: 999px;
    background: var(
      --cv-form-background,
      var(--kanban-background, var(--background))
    );
    box-shadow: 0 1px 2px
      var(--cv-form-shadow, var(--kanban-shadow, rgb(15 23 42 / 22%)));
    transition: translate 140ms ease;
  }

  .cv-forms-switch[aria-checked="true"] .cv-forms-switch-track {
    border-color: color-mix(
      in srgb,
      var(--cv-form-accent, var(--card-color, var(--primary))) 55%,
      transparent
    );
    background: color-mix(
      in srgb,
      var(--cv-form-accent, var(--card-color, var(--primary))) 10%,
      transparent
    );
  }

  .cv-forms-switch[aria-checked="true"] .cv-forms-switch-thumb {
    background: var(--cv-form-accent, var(--card-color, var(--primary)));
    translate: 0.82rem 0;
  }

  .cv-forms-switch:hover,
  .cv-forms-switch:focus-visible {
    outline: 0;
  }
</style>
