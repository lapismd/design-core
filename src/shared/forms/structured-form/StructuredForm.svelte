<script lang="ts">
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  import type { FormConfig, FormValidationIssue, FormViewName } from "../core/types";

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

<style>
  .cv-structured-form {
    --cv-control-column-gap: 1rem;
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr);
    column-gap: var(--cv-control-column-gap);
    row-gap: 0.35rem;
    min-width: 0;
  }

  .cv-structured-form > :global(*) {
    grid-column: 1 / -1;
  }

  @media (max-width: 720px) {
    .cv-structured-form {
      grid-template-columns: 1fr;
    }
  }
</style>
