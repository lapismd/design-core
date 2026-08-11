<script lang="ts">
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
  import type { FormController } from "../core/form-controller.svelte";
  import type {
    AnyPathFormFieldConfig,
    FormGroupConfig,
    RuntimePathFormConfig,
  } from "../core/path-config";
  import type { FormValidationIssue, FormViewName } from "../core/types";
  import ConfiguredFormField from "./ConfiguredFormField.svelte";
  import type { FormRendererRegistry } from "./form-renderer-registry";

  let {
    root,
    form,
    groupId,
    group,
    fields,
    index,
    total,
    view,
    context,
    issues,
    readonly,
    onChange,
    controller,
    registry,
  }: {
    root: any;
    form: RuntimePathFormConfig<any, any>;
    groupId: string;
    group: FormGroupConfig;
    fields: Array<[string, AnyPathFormFieldConfig]>;
    index: number;
    total: number;
    view: FormViewName;
    context: any;
    issues: FormValidationIssue[];
    readonly: boolean;
    onChange: (value: any) => void | Promise<void>;
    controller: FormController<any, any>;
    registry?: FormRendererRegistry;
  } = $props();

  const disclosureId = $derived(`${form.id}:group:${groupId}`);
  const open = $derived(
    group.collapsible === false
      ? true
      : controller.isDisclosureOpen(disclosureId, group.defaultOpen !== false),
  );

  $effect(() => {
    controller.registerDisclosure(disclosureId, groupId);
  });
</script>

<section
  class="ui-configured-form-group"
  data-ui-component="configured-form-group"
  data-ui-part="configured-form-group"
  data-group-id={groupId}
  data-testid={`group-${groupId}`}
>
  <FormSectionHeader
    title={group.title}
    {index}
    {total}
    {open}
    editable={false}
    movable={false}
    removable={false}
    titleToggleable
    titleRowClass="ui-configured-form-group__title-row"
    onToggle={() => controller.toggleDisclosure(disclosureId)}
  />
  {#if open}
    <div class="ui-configured-form-group__body cv-structured-form">
      {#each fields as [path, field] (path)}
        <ConfiguredFormField
          {root}
          {form}
          {path}
          {field}
          {view}
          {context}
          {issues}
          {readonly}
          {onChange}
          {controller}
          {registry}
        />
      {/each}
    </div>
  {/if}
</section>
