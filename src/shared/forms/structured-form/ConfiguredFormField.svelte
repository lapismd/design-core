<script lang="ts">
  import AddSectionChooser from "../add-section-chooser/AddSectionChooser.svelte";
  import EntryActions from "../entry-actions/EntryActions.svelte";
  import FormAddButton from "../form-add-button/FormAddButton.svelte";
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
  import type { FormController } from "../core/form-controller.svelte";
  import type {
    AnyPathFormFieldConfig,
    RuntimePathFormConfig,
  } from "../core/path-config";
  import {
    formFieldId,
    formFieldLabel,
    normalizePathField,
  } from "../core/path-runtime";
  import {
    getFormValueAtPath,
    moveFormArrayItem,
    removeFormArrayItem,
    setFormValueWithDefault,
  } from "../core/path-utils";
  import type {
    FormFieldConfig,
    FormValidationIssue,
    FormViewName,
  } from "../core/types";
  import FormFieldRenderer from "./FormFieldRenderer.svelte";
  import type { FormRendererRegistry } from "./form-renderer-registry";
  import StructuredForm from "./StructuredForm.svelte";
  import { registerConfiguredArraySectionDisclosures } from "./disclosure-policy";

  let {
    root,
    form,
    path,
    field,
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
    path: string;
    field: AnyPathFormFieldConfig;
    view: FormViewName;
    context: any;
    issues: FormValidationIssue[];
    readonly: boolean;
    onChange: (value: any) => void | Promise<void>;
    controller: FormController<any, any>;
    registry?: FormRendererRegistry;
  } = $props();

  let chooserOpen = $state(false);
  let chooserTitle = $state("New Section");
  const normalized = $derived(normalizePathField(form, path, field));
  const structural = $derived(
    field.kind === "array" || field.kind === "variant-array",
  );
  const items = $derived.by(() => {
    if (!structural) return [];
    const value = getFormValueAtPath(root, path) ?? field.defaultValue;
    return Array.isArray(value) ? value : [];
  });
  const itemIds = $derived(
    structural
      ? controller.itemIds(
          path,
          items,
          typeof field.getKey === "function"
            ? (field.getKey as (item: unknown, index: number) => string)
            : undefined,
        )
      : [],
  );
  const label = $derived(
    typeof field.label === "string" ? field.label : formFieldLabel(path),
  );
  const presentation = $derived(
    field.presentation === "sections" ? "sections" : "rows",
  );

  $effect(() => {
    if (presentation !== "sections") return;
    registerConfiguredArraySectionDisclosures(
      controller,
      form.id,
      path,
      itemIds,
    );
  });

  function commitItems(nextItems: unknown[]): void {
    const nextRoot = setFormValueWithDefault(
      root,
      path,
      nextItems,
      form.defaults,
      typeof field.materializeDefaultFrom === "string"
        ? field.materializeDefaultFrom
        : undefined,
    );
    controller.notifyChange(path, nextRoot);
  }

  function updateItem(index: number, value: unknown): void {
    const next = [...items];
    next[index] = value;
    commitItems(next);
  }

  function moveItem(index: number, direction: -1 | 1): void {
    const next = moveFormArrayItem(items, index, direction);
    if (next === items) return;
    controller.moveItemIdentity(path, index, direction);
    commitItems(next);
  }

  function removeItem(index: number): void {
    controller.removeItemIdentity(path, index);
    commitItems(removeFormArrayItem(items, index));
  }

  function appendItem(value: unknown): void {
    controller.appendItemIdentity(path);
    commitItems([...items, value]);
  }

  function titleFor(item: unknown, index: number): string {
    if (typeof field.itemTitle === "function") {
      return String(field.itemTitle({ item, index }));
    }
    if (typeof field.itemTitle === "string") {
      return String(
        getFormValueAtPath(item, field.itemTitle) ?? `${label} ${index + 1}`,
      );
    }
    return `${label.replace(/s$/, "")} ${index + 1}`;
  }

  function itemConfig(item: unknown): RuntimePathFormConfig<any, any> | null {
    if (field.kind === "array") {
      return (field.itemConfig as RuntimePathFormConfig<any, any>) ?? null;
    }
    if (
      field.kind === "variant-array" &&
      item !== null &&
      typeof item === "object" &&
      typeof field.discriminator === "string"
    ) {
      const discriminator = String(
        (item as Record<string, unknown>)[field.discriminator],
      );
      const variant = (
        field.variants as Record<string, Record<string, unknown>>
      )[discriminator];
      return (variant?.itemConfig as RuntimePathFormConfig<any, any>) ?? null;
    }
    return null;
  }

  function primitiveField(
    index: number,
  ): FormFieldConfig<unknown, unknown, unknown> {
    const itemField = (field.itemField ?? {}) as Record<string, unknown>;
    return {
      ...itemField,
      id: formFieldId(form.id, `${path}.${index}`),
      label:
        typeof itemField.label === "string"
          ? itemField.label
          : formFieldLabel(path),
      kind: typeof itemField.kind === "string" ? itemField.kind : "text",
      path: `${path}.${index}`,
      get: (value) => value,
      set: (_value, value) => value,
    } as FormFieldConfig<unknown, unknown, unknown>;
  }

  function disclosureId(itemId: string): string {
    return `${form.id}:${path}:${itemId}`;
  }

  function itemOpen(itemId: string): boolean {
    return controller.isDisclosureOpen(disclosureId(itemId));
  }

  function toggleItem(itemId: string): void {
    controller.toggleDisclosure(disclosureId(itemId));
  }

  function editableTitle(item: unknown, value: string): unknown {
    if (typeof field.editableTitlePath !== "string") return item;
    return setFormValueWithDefault(item, field.editableTitlePath, value);
  }

  function addDefaultItem(): void {
    if (typeof field.createItem !== "function") return;
    appendItem(field.createItem());
  }

  function chooseVariant(value: string): void {
    const variant = (
      field.variants as Record<string, Record<string, unknown>>
    )?.[value];
    if (typeof variant?.createItem !== "function") return;
    appendItem(editableTitle(variant.createItem(), chooserTitle));
    chooserOpen = false;
    chooserTitle = "New Section";
  }
</script>

{#if normalized}
  <FormFieldRenderer
    {root}
    field={normalized}
    {view}
    {context}
    {issues}
    {readonly}
    {onChange}
    {controller}
    {registry}
  />
{:else if structural}
  <section
    class="ui-configured-array"
    data-ui-component="configured-array"
    data-ui-part="configured-array"
    data-presentation={presentation}
    data-appearance={field.appearance ?? "default"}
    data-field-path={path}
    data-testid={typeof field.testId === "string" ? field.testId : undefined}
  >
    {#if field.showLabel !== false}
      <div class="ui-configured-array__title-row">
        <p class="ui-configured-array__title">{label}</p>
        {#if field.kind === "array" && field.addPlacement === "header" && !readonly}
          <FormAddButton
            label={typeof field.addLabel === "string" ? field.addLabel : "Add"}
            onclick={addDefaultItem}
          />
        {/if}
      </div>
    {/if}

    <div class="ui-configured-array__items">
      {#each items as item, index (itemIds[index])}
        {@const id = itemIds[index] ?? `${path}:${index}`}
        {@const config = itemConfig(item)}
        {@const itemTestId =
          typeof field.itemTestId === "function"
            ? field.itemTestId({ item, index })
            : undefined}
        {#if presentation === "sections"}
          <article
            class="ui-configured-array__section"
            data-ui-part="configured-array-section"
            data-testid={itemTestId}
          >
            <FormSectionHeader
              title={titleFor(item, index)}
              {index}
              total={items.length}
              open={itemOpen(id)}
              editable={typeof field.editableTitlePath === "string"}
              titleToggleable={typeof field.editableTitlePath !== "string"}
              titleRowClass="ui-configured-array__section-title-row"
              onTitleChange={(title) =>
                updateItem(index, editableTitle(item, title))}
              onMove={(direction) => moveItem(index, direction)}
              onRemove={() => removeItem(index)}
              onToggle={() => toggleItem(id)}
            />
            {#if itemOpen(id)}
              <div class="ui-configured-array__section-body">
                {#if config}
                  <StructuredForm
                    value={item}
                    {config}
                    {view}
                    {context}
                    {issues}
                    {readonly}
                    onChange={(value) => updateItem(index, value)}
                    {registry}
                  />
                {:else}
                  <FormFieldRenderer
                    root={item}
                    field={primitiveField(index)}
                    {view}
                    {context}
                    {issues}
                    {readonly}
                    onChange={(value) => updateItem(index, value)}
                    {registry}
                  />
                {/if}
              </div>
            {/if}
          </article>
        {:else}
          {@const marker =
            typeof field.marker === "function"
              ? field.marker({ item, index, total: items.length })
              : null}
          <EntryActions
            {index}
            total={items.length}
            removeLabel={`Remove ${titleFor(item, index)}`}
            onMove={(direction) => moveItem(index, direction)}
            onRemove={() => removeItem(index)}
          >
            <div
              class="ui-configured-array__row-body"
              data-ui-part="configured-array-row-body"
              data-has-marker={marker ? "" : undefined}
              data-marker-spacing={marker
                ? (field.markerSpacing ?? "default")
                : undefined}
              data-hide-label={(field.itemField as Record<string, unknown>)
                ?.hideLabel || field.hideItemLabels
                ? ""
                : undefined}
              data-testid={itemTestId}
            >
              {#if marker}
                <span
                  class="ui-configured-array__marker"
                  data-testid="simple-entry-marker"
                  aria-hidden="true"
                >
                  {marker}
                </span>
              {/if}
              {#if config}
                <StructuredForm
                  value={item}
                  {config}
                  {view}
                  {context}
                  {issues}
                  {readonly}
                  onChange={(value) => updateItem(index, value)}
                  {registry}
                />
              {:else}
                <div
                  class="ui-configured-array__primitive-form cv-structured-form"
                >
                  <FormFieldRenderer
                    root={item}
                    field={primitiveField(index)}
                    {view}
                    {context}
                    {issues}
                    {readonly}
                    onChange={(value) => updateItem(index, value)}
                    {registry}
                  />
                </div>
              {/if}
            </div>
          </EntryActions>
        {/if}
      {/each}
    </div>

    {#if !readonly && field.kind === "array" && field.addPlacement !== "header"}
      <FormAddButton
        label={typeof field.addLabel === "string"
          ? field.addLabel
          : `Add ${label.replace(/s$/, "")}`}
        presentation={field.addButtonPresentation === "panel"
          ? "panel"
          : "inline"}
        onclick={addDefaultItem}
      />
    {:else if !readonly && field.kind === "variant-array"}
      <AddSectionChooser
        open={chooserOpen}
        title={chooserTitle}
        addLabel={typeof field.addLabel === "string"
          ? field.addLabel
          : "Add New Section"}
        options={Object.entries(
          field.variants as Record<string, Record<string, unknown>>,
        ).map(([value, variant]) => ({
          value,
          label: String(variant.label ?? value),
        }))}
        onOpen={() => (chooserOpen = true)}
        onCancel={() => {
          chooserOpen = false;
          chooserTitle = "New Section";
        }}
        onTitleChange={(title) => (chooserTitle = title)}
        onChoose={chooseVariant}
      />
    {/if}
  </section>
{/if}
