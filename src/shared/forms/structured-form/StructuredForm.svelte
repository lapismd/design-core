<script lang="ts">
  import "./structured-form.css";
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  import type {
    FormConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";

  type AnyFormConfig = FormConfig<any, any>;

  let {
    value,
    config,
    view = config.defaultView ?? "edit",
    context = undefined,
    issues = [],
    readonly = false,
    onChange = () => {},
  }: {
    value: unknown;
    config: AnyFormConfig;
    view?: FormViewName;
    context?: unknown;
    issues?: FormValidationIssue[];
    readonly?: boolean;
    onChange?: (value: unknown) => void | Promise<void>;
  } = $props();
</script>

<div class="cv-structured-form" data-form-id={config.id} data-view={view}>
  {#each config.fields as field (field.id)}
    <FormFieldRenderer
      root={value}
      {field}
      {view}
      {context}
      {issues}
      {readonly}
      {onChange}
    />
  {/each}
</div>
