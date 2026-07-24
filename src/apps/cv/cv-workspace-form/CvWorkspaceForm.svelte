<script lang="ts">
  import { YamlEditor } from "@stevejuma/ui/forms";
  import { Label } from "@stevejuma/ui/shadcn/label";
  import { Switch } from "@stevejuma/ui/shadcn/switch";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
  import { cloneSampleCvSource } from "../fixture";
  import CvSectionsForm from "../cv-sections-form/CvSectionsForm.svelte";
  import { parseCvYaml, serializeCvSource } from "../cv-yaml";
  import CvDesignTab from "../tabs/CvDesignTab.svelte";
  import CvEvidenceTab from "../tabs/CvEvidenceTab.svelte";
  import CvLocaleTab from "../tabs/CvLocaleTab.svelte";
  import CvSettingsTab from "../tabs/CvSettingsTab.svelte";
  import type { CvSource } from "../types";
  import "../cv-shared.css";

  let {
    tab = $bindable("cv"),
    yamlMode = $bindable(false),
    value = $bindable(cloneSampleCvSource()),
    collapseAll = false,
    onChange,
  }: {
    tab?: string;
    yamlMode?: boolean;
    value?: CvSource;
    collapseAll?: boolean;
    onChange?: (value: CvSource) => void;
  } = $props();

  let yamlText = $state(serializeCvSource(value));
  let yamlError = $state<string | null>(null);

  function commit(next: CvSource) {
    value = next;
    onChange?.(next);
    if (!yamlMode) {
      yamlText = serializeCvSource(next);
      yamlError = null;
    }
  }

  function handleYamlChange(next: string) {
    yamlText = next;
    const parsed = parseCvYaml(next);
    if (!parsed.ok) {
      yamlError = parsed.error;
      return;
    }
    yamlError = null;
    value = {
      ...value,
      cv: parsed.value.cv,
    };
    onChange?.(value);
  }

  function handleYamlModeChange(checked: boolean) {
    yamlMode = checked;
    if (checked) {
      yamlText = serializeCvSource(value);
      yamlError = null;
    } else if (!yamlError) {
      const parsed = parseCvYaml(yamlText);
      if (parsed.ok) {
        commit({ ...value, cv: parsed.value.cv });
      }
    }
  }
</script>

<div data-testid="cv-workspace-form" data-ui-part="cv-workspace-form">
  <Tabs.Root bind:value={tab}>
    <div class="cv-workspace-form__header">
      <div class="cv-workspace-form__header-row">
        <Tabs.List variant="line" class="cv-workspace-form__tabs-list">
          <Tabs.Trigger value="cv">CV</Tabs.Trigger>
          <Tabs.Trigger value="evidence">Evidence</Tabs.Trigger>
          <Tabs.Trigger value="design">Design</Tabs.Trigger>
          <Tabs.Trigger value="locale">Locale</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        {#if tab === "cv"}
          <Label class="cv-workspace-form__yaml-label">
            YAML
            <Switch
              checked={yamlMode}
              aria-label="YAML mode"
              onCheckedChange={handleYamlModeChange}
            />
          </Label>
        {/if}
      </div>
    </div>

    <Tabs.Content value="cv">
      {#if yamlMode}
        <div class="cv-workspace-form__yaml-panel">
          {#if yamlError}
            <p class="cv-workspace-form__error" role="alert">{yamlError}</p>
          {/if}
          <YamlEditor
            value={yamlText}
            minHeight="24rem"
            onChange={handleYamlChange}
          />
        </div>
      {:else}
        <div class="cv-workspace-form__content">
          <CvSectionsForm
            value={value.cv}
            {collapseAll}
            onChange={(cv) => commit({ ...value, cv })}
          />
        </div>
      {/if}
    </Tabs.Content>

    <Tabs.Content value="evidence">
      <CvEvidenceTab
        value={value.evidence}
        onChange={(evidence) => commit({ ...value, evidence })}
      />
    </Tabs.Content>

    <Tabs.Content value="design">
      <CvDesignTab
        value={value.design}
        onChange={(design) => commit({ ...value, design })}
      />
    </Tabs.Content>

    <Tabs.Content value="locale">
      <CvLocaleTab
        value={value.locale}
        onChange={(locale) => commit({ ...value, locale })}
      />
    </Tabs.Content>

    <Tabs.Content value="settings">
      <CvSettingsTab
        value={value.settings}
        onChange={(settings) => commit({ ...value, settings })}
      />
    </Tabs.Content>
  </Tabs.Root>
</div>

<style>
  .cv-workspace-form__header {
    border-bottom: 1px solid var(--border);
    padding: 0.375rem 0.75rem 0;
  }

  .cv-workspace-form__header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  :global(.cv-workspace-form__tabs-list) {
    justify-content: flex-start;
    overflow: visible;
  }

  :global(.cv-workspace-form__yaml-label) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--muted-foreground);
    font-size: 0.75rem;
  }

  .cv-workspace-form__yaml-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 720px;
    padding: 1rem 2.75rem 1rem 2.5rem;
  }

  .cv-workspace-form__error {
    color: var(--destructive);
    font-size: 0.875rem;
  }

  .cv-workspace-form__content {
    max-width: 646px;
    padding: 1rem 2.75rem 1rem 2.5rem;
  }
</style>
