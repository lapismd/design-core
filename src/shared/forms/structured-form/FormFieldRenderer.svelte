<script lang="ts" generics="TRoot, TContext = undefined, TValue = unknown">
  import "./FormFieldRenderer.css";
  import type { Component } from "svelte";
  import FormField from "../form-field/FormField.svelte";
  import type { FormController } from "../core/form-controller.svelte";
  import type { FieldPath } from "../core/path-types";
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
  import {
    defaultFormRendererRegistry,
    type FormRendererRegistry,
  } from "./form-renderer-registry";

  let {
    root,
    field,
    view = "edit",
    context = undefined as TContext,
    issues = [],
    readonly = false,
    onChange = () => {},
    controller,
    registry = defaultFormRendererRegistry,
  }: {
    root: TRoot;
    field: FormFieldConfig<TRoot, TContext, TValue>;
    view?: FormViewName;
    context?: TContext;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    onChange?: (value: TRoot) => void | Promise<void>;
    controller?: FormController<any, any>;
    registry?: FormRendererRegistry;
  } = $props();

  let fieldHost = $state<HTMLElement | null>(null);
  const value = $derived(field.get(root, context));
  const fieldIssues = $derived(fieldIssuesFor(issues, field));
  const fieldError = $derived(fieldIssues[0]?.message ?? null);
  const localRenderer = $derived(resolveFieldRenderer(field, view, readonly));
  const readonlyView = $derived(
    readonly || field.readonly === true || view === "readonly",
  );
  const registeredRenderer = $derived(
    !localRenderer && !readonlyView && view === "edit"
      ? registry.resolve(field.kind)
      : null,
  );
  const activeRenderer = $derived(localRenderer ?? registeredRenderer);
  const fieldReadonly = $derived(
    readonlyView ||
      (view !== "edit" && activeRenderer?.interactive !== true) ||
      (view !== "edit" && !activeRenderer),
  );
  const rendererMissing = $derived(
    !fieldReadonly && view === "edit" && !activeRenderer,
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

  $effect(() => {
    if (!controller || !field.path) return;
    controller.registerField(field.path as FieldPath<TRoot>, fieldHost);
    return () => controller.registerField(field.path as FieldPath<TRoot>, null);
  });

  function updateValue(nextValue: TValue) {
    if (fieldReadonly || !field.set) return;
    const nextRoot = field.set(root, nextValue, context);
    if (controller && field.path) {
      controller.notifyChange(field.path as FieldPath<TRoot>, nextRoot);
      return;
    }
    void onChange(nextRoot);
  }

  function blur() {
    if (controller && field.path) {
      controller.notifyBlur(field.path as FieldPath<TRoot>);
    }
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
      blur,
    };
  }

  function rendererComponent(): Component<any> {
    return activeRenderer?.component as Component<any>;
  }

  function rendererProps() {
    if (!activeRenderer) return rendererArgs();
    if (localRenderer) return rendererPropsFor(localRenderer, rendererArgs());
    return {
      ...(activeRenderer.props ?? {}),
      ...rendererArgs(),
      blur,
    };
  }
</script>

<div
  bind:this={fieldHost}
  class="cv-form-field-renderer"
  data-field-path={field.path}
>
  {#if activeRenderer?.wrapper === "none" && !fieldReadonly}
    {@const Renderer = rendererComponent()}
    <Renderer {...rendererProps()} />
  {:else}
    <FormField
      label={field.label}
      align={activeRenderer?.align ??
        field.align ??
        defaultFieldAlign(field.kind)}
      as={activeRenderer?.as ?? field.as ?? defaultFieldWrapper(field.kind)}
      readonly={fieldReadonly}
      error={activeRenderer || (leafOwnsError && !fieldReadonly)
        ? null
        : fieldError}
    >
      {#if fieldReadonly}
        <span class="cv-forms-preview-value">{previewText() || " "}</span>
      {:else if activeRenderer}
        {@const Renderer = rendererComponent()}
        <Renderer {...rendererProps()} />
        {#if localRenderer && fieldIssues.length}
          <div id={`${field.id}-issues`} class="cv-forms-field-issues">
            {#each fieldIssues as issue, index (index)}
              <p>{issue.message}</p>
            {/each}
          </div>
        {/if}
      {:else if rendererMissing}
        <p class="cv-forms-missing-renderer" role="alert">
          No renderer is registered for field kind “{field.kind}”.
        </p>
      {/if}
    </FormField>
  {/if}
</div>
