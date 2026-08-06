<script lang="ts">
  import * as Alert from "@lapismd/design-core/shadcn/alert";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import * as Table from "@lapismd/design-core/shadcn/table";
  import { Textarea } from "@lapismd/design-core/shadcn/textarea";
  import type {
    WorkspaceKeyValueSetting,
    WorkspaceSettingField as SettingDefinition,
    WorkspaceSettingOption,
  } from "./types.js";
  import type { WorkspaceSettingsController } from "./settings-controller.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSettingFieldRecursive from "./WorkspaceSettingField.svelte";
  import WorkspaceSettingList from "./WorkspaceSettingList.svelte";
  import WorkspaceSettingSelect from "./WorkspaceSettingSelect.svelte";

  let {
    controller,
    field,
  }: {
    controller: WorkspaceSettingsController;
    field: SettingDefinition;
  } = $props();

  let value = $derived(controller.get(field.id));
  let error = $derived(controller.validationErrors[field.id]);
  let options = $state<WorkspaceSettingOption[]>([]);
  let optionRequest = 0;
  let keyValueOptions = $derived.by(() => {
    if (field.type !== "key-value") return [];
    const known = new Set(options.map((option) => option.value));
    return [
      ...options,
      ...Object.values(keyValue(field))
        .filter((entry) => entry && !known.has(entry))
        .map((entry) => ({
          value: entry,
          label: field.allowUnknownValues
            ? `${entry} (custom)`
            : `${entry} (missing)`,
        })),
    ];
  });

  $effect(() => {
    if (
      field.type !== "enum" &&
      field.type !== "multi-enum" &&
      field.type !== "string" &&
      field.type !== "key-value"
    ) {
      options = [];
      return;
    }
    options =
      field.type === "string"
        ? []
        : field.type === "key-value"
          ? (field.valueOptions ?? [])
          : (field.options ?? []);
    const sourceId =
      field.type === "key-value"
        ? field.valueOptionsSource
        : field.optionsSource;
    if (!sourceId) return;
    const request = ++optionRequest;
    void controller
      .loadOptions(sourceId, {
        settingId: field.id,
        params:
          field.type === "key-value" ? undefined : field.optionsSourceParams,
      })
      .then((loaded) => {
        if (request === optionRequest) options = loaded;
      });
  });

  function controlKind() {
    if (field.type === "boolean") return "toggle";
    if (field.type === "number" || field.type === "integer") {
      return field.minimum !== undefined && field.maximum !== undefined
        ? "range"
        : "number";
    }
    if (field.type === "enum") return "select";
    if (field.type === "multi-enum") return "multiselect";
    if (field.type === "key-value") return "key-value";
    return field.type;
  }

  function controlLayout() {
    return field.type === "key-value" ||
      field.type === "object-array" ||
      field.type === "object-grid" ||
      field.type === "object-map"
      ? "stacked"
      : "row";
  }

  function updateStructured(raw: string) {
    try {
      controller.update(field.id, JSON.parse(raw));
    } catch {
      // Keep the last valid structured value while the draft is incomplete.
    }
  }

  function keyValue(field: WorkspaceKeyValueSetting) {
    const current =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, string>)
        : field.default;
    return current;
  }

  function updateKeyValue(
    field: WorkspaceKeyValueSetting,
    currentKey: string,
    nextKey: string,
    nextValue: string,
  ) {
    const current = keyValue(field);
    const next = { ...current };
    delete next[currentKey];
    next[nextKey] = nextValue;
    controller.update(field.id, next);
  }

  function nextKey(field: WorkspaceKeyValueSetting) {
    const value = keyValue(field);
    const candidate = ["*.md", "*.txt", "**/*"].find(
      (entry) => !(entry in value),
    );
    if (candidate) return candidate;
    let index = 1;
    while (`pattern-${index}` in value) index += 1;
    return `pattern-${index}`;
  }
</script>

{#if field.type === "group"}
  <section
    class="ui-workspace-settings__schema-section"
    data-settings-group-id={field.id}
  >
    <header>
      <h2>{field.title}</h2>
      {#if field.description}<p>{field.description}</p>{/if}
    </header>
    <div class="ui-workspace-settings__schema-body">
      {#each field.fields as child (child.id)}
        <WorkspaceSettingFieldRecursive {controller} field={child} />
      {/each}
    </div>
  </section>
{:else}
  <div
    class="ui-workspace-setting-item"
    data-ui-part="setting-item"
    data-setting-id={field.id}
    data-setting-control-kind={controlKind()}
    data-setting-layout={controlLayout()}
    data-invalid={Boolean(error)}
  >
    <div class="ui-workspace-setting-item__info">
      <label for={`setting-${field.id}`}>{field.title}</label>
      {#if field.description}<p>{field.description}</p>{/if}
      {#if field.deprecated}<p>{field.deprecated}</p>{/if}
      {#if error}<p class="ui-workspace-setting-item__error" role="alert">
          {error}
        </p>{/if}
    </div>

    <div class="ui-workspace-setting-item__control">
      {#if field.type === "boolean"}
        <Switch
          id={`setting-${field.id}`}
          checked={value === true}
          disabled={field.disabled}
          onCheckedChange={(checked) => controller.update(field.id, checked)}
        />
      {:else if field.type === "string" && field.presentation === "textarea"}
        <Textarea
          id={`setting-${field.id}`}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          disabled={field.disabled}
          aria-invalid={Boolean(error)}
          oninput={(event) =>
            controller.update(field.id, event.currentTarget.value)}
        />
      {:else if field.type === "string" && (field.presentation === "combobox" || field.optionsSource)}
        <WorkspaceSettingSelect
          id={`setting-${field.id}`}
          items={options}
          value={String(value ?? field.default)}
          disabled={field.disabled}
          ariaLabel={field.title}
          placeholder={field.placeholder}
          onValueChange={(next: string) => controller.update(field.id, next)}
        />
      {:else if field.type === "string"}
        <Input
          id={`setting-${field.id}`}
          type={field.presentation === "email"
            ? "email"
            : field.presentation === "url"
              ? "url"
              : field.presentation === "date"
                ? "date"
                : field.presentation === "time"
                  ? "time"
                  : field.presentation === "color"
                    ? "color"
                    : "text"}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          disabled={field.disabled}
          aria-invalid={Boolean(error)}
          oninput={(event) =>
            controller.update(field.id, event.currentTarget.value)}
        />
      {:else if (field.type === "number" || field.type === "integer") && field.minimum !== undefined && field.maximum !== undefined}
        <div class="ui-workspace-setting-range">
          <Input
            id={`setting-${field.id}`}
            type="range"
            value={Number(value ?? field.default)}
            min={field.minimum}
            max={field.maximum}
            step={field.step ?? (field.type === "integer" ? 1 : 0.1)}
            disabled={field.disabled}
            oninput={(event) =>
              controller.update(field.id, event.currentTarget.valueAsNumber)}
          />
          <output for={`setting-${field.id}`}
            >{Number(value ?? field.default)}</output
          >
        </div>
      {:else if field.type === "number" || field.type === "integer"}
        <Input
          id={`setting-${field.id}`}
          type="number"
          value={Number(value ?? field.default)}
          min={field.minimum}
          max={field.maximum}
          step={field.step ?? (field.type === "integer" ? 1 : "any")}
          disabled={field.disabled}
          onchange={(event) =>
            controller.update(field.id, event.currentTarget.valueAsNumber)}
        />
      {:else if field.type === "enum"}
        <WorkspaceSettingSelect
          id={`setting-${field.id}`}
          items={options}
          value={String(value ?? field.default)}
          disabled={field.disabled}
          ariaLabel={field.title}
          onValueChange={(next: string) => controller.update(field.id, next)}
        />
      {:else if field.type === "multi-enum"}
        <WorkspaceSettingSelect
          id={`setting-${field.id}`}
          type="multiple"
          items={options}
          value={Array.isArray(value)
            ? value.filter(
                (entry): entry is string => typeof entry === "string",
              )
            : field.default}
          disabled={field.disabled}
          ariaLabel={field.title}
          placeholder="Select options..."
          onValueChange={(next: string[]) => controller.update(field.id, next)}
        />
      {:else if field.type === "list"}
        <WorkspaceSettingList
          itemType={field.itemType}
          label={field.title}
          value={Array.isArray(value) ? value : []}
          disabled={field.disabled}
          maximumItems={field.maximumItems}
          onValueChange={(next) => controller.update(field.id, next)}
        />
      {:else if field.type === "object-array" || field.type === "object-grid" || field.type === "object-map"}
        <Textarea
          id={`setting-${field.id}`}
          class="ui-workspace-setting-structured"
          value={JSON.stringify(value ?? field.default, null, 2)}
          disabled={field.disabled}
          aria-invalid={Boolean(error)}
          onchange={(event) => updateStructured(event.currentTarget.value)}
        />
      {:else if field.type === "key-value"}
        <div class="ui-workspace-setting-key-value">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>{field.keyLabel ?? "Pattern"}</Table.Head>
                <Table.Head>{field.valueLabel ?? "Value"}</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each Object.entries(keyValue(field)) as [key, entry] (key)}
                <Table.Row>
                  <Table.Cell>
                    <Input
                      aria-label="Association pattern"
                      value={key}
                      placeholder={field.keyPlaceholder}
                      onchange={(event) =>
                        updateKeyValue(
                          field,
                          key,
                          event.currentTarget.value,
                          entry,
                        )}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <WorkspaceSettingSelect
                      ariaLabel="Associated editor view"
                      items={keyValueOptions}
                      value={entry}
                      onValueChange={(next: string) =>
                        updateKeyValue(field, key, key, next)}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${key}`}
                      onclick={() => {
                        const next = { ...keyValue(field) };
                        delete next[key];
                        controller.update(field.id, next);
                      }}
                    >
                      <WorkspaceIcon name="trash-2" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
          <Button
            variant="outline"
            size="sm"
            onclick={() =>
              controller.update(field.id, {
                ...keyValue(field),
                [nextKey(field)]: keyValueOptions[0]?.value ?? "",
              })}
          >
            <WorkspaceIcon name="plus" />
            {field.addLabel ?? "Add entry"}
          </Button>
        </div>
      {:else if field.type === "custom"}
        {@const CustomComponent = field.component}
        <CustomComponent
          id={field.id}
          {value}
          disabled={field.disabled}
          update={(next) => controller.update(field.id, next)}
        />
      {:else if field.type === "unsupported"}
        <Alert.Root class="ui-workspace-setting-unsupported">
          <Alert.Title>Unsupported setting</Alert.Title>
          <Alert.Description>
            {field.schemaType
              ? `The ${field.schemaType} schema type is not available.`
              : "This setting cannot be edited by the default renderer."}
          </Alert.Description>
        </Alert.Root>
      {:else if field.type === "action"}
        <Button
          id={`setting-${field.id}`}
          variant={field.variant ?? "outline"}
          disabled={field.disabled}
          onclick={() => controller.runAction(field.id)}
        >
          {#if field.icon}<WorkspaceIcon name={field.icon} />{/if}
          {field.label}
        </Button>
      {/if}

      {#if field.type !== "action"}
        <Button
          class="ui-workspace-setting-restore"
          variant="ghost"
          size="icon-sm"
          aria-label={`Restore ${field.title} default`}
          title="Restore default"
          disabled={field.disabled}
          onclick={() => controller.restoreDefault(field.id)}
        >
          <WorkspaceIcon name="rotate-ccw" />
        </Button>
      {/if}
    </div>
  </div>
{/if}
