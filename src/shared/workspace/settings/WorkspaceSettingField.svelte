<script lang="ts">
  import { PasswordInput } from "@lapismd/design-core/forms";
  import * as Alert from "@lapismd/design-core/shadcn/alert";
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Slider } from "@lapismd/design-core/shadcn/slider";
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
  import WorkspaceIconPicker from "../icon/WorkspaceIconPicker.svelte";
  import WorkspaceSettingFieldRecursive from "./WorkspaceSettingField.svelte";
  import WorkspaceSettingAddButton from "./WorkspaceSettingAddButton.svelte";
  import WorkspaceSettingList from "./WorkspaceSettingList.svelte";
  import WorkspaceSettingObjectTable from "./WorkspaceSettingObjectTable.svelte";
  import WorkspaceSettingSelect from "./WorkspaceSettingSelect.svelte";
  import WorkspaceSettingToggleTable from "./WorkspaceSettingToggleTable.svelte";
  import CopyableValue from "./CopyableValue.svelte";

  let {
    controller,
    field,
  }: {
    controller: WorkspaceSettingsController;
    field: SettingDefinition;
  } = $props();

  let value = $derived(controller.get(field.id));
  let error = $derived(controller.getError(field.id));
  let busy = $derived(controller.isBusy(field.id));
  let actionResult = $derived(controller.getActionResult(field.id));
  let controlDisabled = $derived(
    field.disabled === true || field.readOnly === true,
  );
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
      field.type === "object-map" ||
      (field.type === "custom" && field.presentation === "full-width")
      ? "stacked"
      : "row";
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
    void controller.set(field.id, next);
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
      {#if field.presentation === "toggle-table"}
        <WorkspaceSettingToggleTable {controller} group={field} />
      {:else}
        {#each field.fields as child (child.id)}
          <WorkspaceSettingFieldRecursive {controller} field={child} />
        {/each}
      {/if}
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
          disabled={controlDisabled}
          onCheckedChange={(checked) => void controller.set(field.id, checked)}
        />
      {:else if field.type === "string" && field.presentation === "icon"}
        <WorkspaceIconPicker
          id={`setting-${field.id}`}
          value={String(value ?? "")}
          disabled={controlDisabled}
          placeholder={field.placeholder ?? "Select an icon"}
          ariaLabel={field.title}
          onValueChange={(next) => void controller.set(field.id, next)}
        />
      {:else if field.type === "string" && field.presentation === "textarea"}
        <Textarea
          id={`setting-${field.id}`}
          rows={1}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          disabled={controlDisabled}
          aria-invalid={Boolean(error)}
          oninput={(event) =>
            void controller.set(field.id, event.currentTarget.value)}
        />
      {:else if field.type === "string" && (field.presentation === "combobox" || field.optionsSource)}
        <WorkspaceSettingSelect
          id={`setting-${field.id}`}
          items={options}
          value={String(value ?? field.default)}
          disabled={controlDisabled}
          ariaLabel={field.title}
          placeholder={field.placeholder}
          onValueChange={(next: string) => void controller.set(field.id, next)}
        />
      {:else if field.type === "string" && field.presentation === "password"}
        <PasswordInput
          id={`setting-${field.id}`}
          value={String(value ?? "")}
          placeholder={field.placeholder}
          disabled={controlDisabled}
          aria-invalid={Boolean(error)}
          oninput={(event) =>
            void controller.set(field.id, event.currentTarget.value)}
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
          disabled={controlDisabled}
          aria-invalid={Boolean(error)}
          oninput={(event) =>
            void controller.set(field.id, event.currentTarget.value)}
        />
      {:else if (field.type === "number" || field.type === "integer") && field.minimum !== undefined && field.maximum !== undefined}
        <div class="ui-workspace-setting-range">
          <Slider
            id={`setting-${field.id}`}
            type="single"
            value={Number(value ?? field.default)}
            min={field.minimum}
            max={field.maximum}
            step={field.step ?? (field.type === "integer" ? 1 : 0.1)}
            disabled={controlDisabled}
            aria-label={field.title}
            onValueChange={(next: number) =>
              void controller.set(field.id, next)}
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
          disabled={controlDisabled}
          onchange={(event) =>
            void controller.set(field.id, event.currentTarget.valueAsNumber)}
        />
      {:else if field.type === "enum"}
        <WorkspaceSettingSelect
          id={`setting-${field.id}`}
          items={options}
          value={String(value ?? field.default)}
          disabled={controlDisabled}
          ariaLabel={field.title}
          onValueChange={(next: string) => void controller.set(field.id, next)}
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
          disabled={controlDisabled}
          ariaLabel={field.title}
          placeholder="Select options..."
          onValueChange={(next: string[]) =>
            void controller.set(field.id, next)}
        />
      {:else if field.type === "list"}
        <WorkspaceSettingList
          itemType={field.itemType}
          label={field.title}
          itemLabels={field.itemLabels}
          value={Array.isArray(value) ? value : []}
          disabled={controlDisabled}
          maximumItems={field.maximumItems}
          onValueChange={(next) => void controller.set(field.id, next)}
        />
      {:else if field.type === "object-array" || field.type === "object-grid"}
        <WorkspaceSettingObjectTable
          label={field.title}
          properties={field.properties}
          value={value ?? field.default}
          disabled={controlDisabled}
          minimumItems={field.minimumItems}
          maximumItems={field.maximumItems}
          rowKey={field.rowKey}
          reorderable={field.reorderable}
          allowAdd={field.allowAdd}
          allowRemove={field.allowRemove}
          stateRevision={controller.sourceRevision}
          addLabel={field.addLabel}
          rowActions={field.rowActions}
          onValueChange={(next) => void controller.set(field.id, next)}
        />
      {:else if field.type === "object-map"}
        <WorkspaceSettingObjectTable
          label={field.title}
          properties={field.properties}
          mode="map"
          value={value ?? field.default}
          disabled={controlDisabled}
          onValueChange={(next) => void controller.set(field.id, next)}
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
                        void controller.set(field.id, next);
                      }}
                    >
                      <WorkspaceIcon name="trash-2" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
          <WorkspaceSettingAddButton
            label={field.addLabel ?? "Add entry"}
            onclick={() =>
              void controller.set(field.id, {
                ...keyValue(field),
                [nextKey(field)]: keyValueOptions[0]?.value ?? "",
              })}
          />
        </div>
      {:else if field.type === "output"}
        {#if field.presentation === "copyable"}
          <CopyableValue
            value={value == null ? null : String(value)}
            label={field.copyLabel ?? field.title}
            emptyLabel={field.emptyLabel}
            leadingCharacters={field.leadingCharacters}
            trailingCharacters={field.trailingCharacters}
          />
        {:else}
          <output
            id={`setting-${field.id}`}
            class="ui-workspace-setting-output"
            data-presentation={field.presentation ?? "text"}
          >
            {#if field.presentation === "code"}
              <code
                >{value == null
                  ? (field.emptyLabel ?? "None")
                  : String(value)}</code
              >
            {:else}
              {value == null ? (field.emptyLabel ?? "None") : String(value)}
            {/if}
          </output>
        {/if}
      {:else if field.type === "custom"}
        {@const CustomComponent = field.adapter
          ? controller.resolveCustomAdapter(field.id, field.adapter)?.component
          : field.component}
        {#if CustomComponent}
          <CustomComponent
            id={field.id}
            {field}
            {value}
            disabled={controlDisabled}
            readOnly={field.readOnly}
            {busy}
            {error}
            setValue={(next) => controller.set(field.id, next)}
            update={(next) => controller.update(field.id, next)}
          />
        {:else}
          <Alert.Root class="ui-workspace-setting-unsupported">
            <Alert.Title>Unavailable custom field</Alert.Title>
            <Alert.Description>
              The adapter for this setting is not registered.
            </Alert.Description>
          </Alert.Root>
        {/if}
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
          disabled={controller.isDisabled(field.id) || busy}
          aria-busy={busy}
          onclick={() => controller.runAction(field.id)}
        >
          {#if field.icon}<WorkspaceIcon name={field.icon} />{/if}
          {field.label}
        </Button>
      {/if}

      {#if field.type === "action" && actionResult}
        <p
          class="ui-workspace-setting-action-result"
          data-tone={actionResult.tone}
          role={actionResult.tone === "error" ? "alert" : "status"}
        >
          {actionResult.message}
        </p>
      {/if}

      {#if field.type !== "action" && field.type !== "output" && "default" in field && field.default !== undefined}
        <Button
          class="ui-workspace-setting-restore"
          variant="ghost"
          size="icon-sm"
          aria-label={`Restore ${field.title} default`}
          title="Restore default"
          disabled={controlDisabled}
          onclick={() => controller.restoreDefault(field.id)}
        >
          <WorkspaceIcon name="rotate-ccw" />
        </Button>
      {/if}
    </div>
  </div>
{/if}
