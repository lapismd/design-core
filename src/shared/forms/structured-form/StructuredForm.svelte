<script lang="ts" generics="TValues, TContext = undefined">
  import "./structured-form.css";
  import { untrack } from "svelte";
  import { FormController } from "../core/form-controller.svelte";
  import {
    isPathFormConfig,
    type RuntimePathFormConfig,
  } from "../core/path-config";
  import { pathFormEntries } from "../core/path-runtime";
  import type {
    FormConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  import ConfiguredFormField from "./ConfiguredFormField.svelte";
  import ConfiguredFormGroup from "./ConfiguredFormGroup.svelte";
  import type { FormRendererRegistry } from "./form-renderer-registry";

  let {
    value,
    config,
    view = config.defaultView ?? "edit",
    context = undefined as TContext,
    issues = [],
    readonly = false,
    onChange = () => {},
    controller,
    registry,
  }: {
    value: TValues;
    config:
      | FormConfig<TValues, TContext>
      | RuntimePathFormConfig<TValues, TContext>;
    view?: FormViewName;
    context?: TContext;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    onChange?: (value: TValues) => void | Promise<void>;
    controller?: FormController<TValues, TContext>;
    registry?: FormRendererRegistry;
  } = $props();

  const pathConfig = $derived(isPathFormConfig(config) ? config : null);
  const legacyFields = $derived(
    Array.isArray(config.fields) ? config.fields : [],
  );
  const pathFields = $derived(pathConfig ? pathFormEntries(pathConfig) : []);
  const groups = $derived(Object.entries(pathConfig?.groups ?? {}));
  const ungroupedPathFields = $derived(
    pathFields.filter(([, field]) => !field.group),
  );
  const groupedPathFields = $derived(
    groups.map(([groupId, group]) => ({
      groupId,
      group,
      fields: pathFields.filter(([, field]) => field.group === groupId),
    })),
  );
  const internalController = new FormController<TValues, TContext>({
    defaultValues: untrack(() => value),
  });
  const effectiveController = $derived(controller ?? internalController);
  const mergedIssues = $derived([...issues, ...(controller?.issues ?? [])]);

  $effect(() => {
    if (!pathConfig) return;
    effectiveController.connect({
      value,
      config: pathConfig,
      context,
      onChange,
    });
  });
</script>

<div class="cv-structured-form" data-form-id={config.id} data-view={view}>
  {#each legacyFields as field (field.id)}
    <FormFieldRenderer
      root={value}
      {field}
      {view}
      {context}
      issues={mergedIssues}
      {readonly}
      {onChange}
      {registry}
    />
  {/each}
  {#each ungroupedPathFields as [path, field] (path)}
    <ConfiguredFormField
      root={value}
      form={pathConfig!}
      {path}
      {field}
      {view}
      {context}
      issues={mergedIssues}
      {readonly}
      {onChange}
      controller={effectiveController}
      {registry}
    />
  {/each}
  {#each groupedPathFields as configuredGroup, index (configuredGroup.groupId)}
    <ConfiguredFormGroup
      root={value}
      form={pathConfig!}
      groupId={configuredGroup.groupId}
      group={configuredGroup.group}
      fields={configuredGroup.fields}
      {index}
      total={groupedPathFields.length}
      {view}
      {context}
      issues={mergedIssues}
      {readonly}
      {onChange}
      controller={effectiveController}
      {registry}
    />
  {/each}
</div>
