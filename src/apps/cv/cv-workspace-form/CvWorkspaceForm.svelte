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
    <div class="border-b px-3 pt-1.5">
      <div class="flex items-center justify-between gap-3">
        <Tabs.List variant="line" class="justify-start overflow-visible">
          <Tabs.Trigger value="cv">CV</Tabs.Trigger>
          <Tabs.Trigger value="evidence">Evidence</Tabs.Trigger>
          <Tabs.Trigger value="design">Design</Tabs.Trigger>
          <Tabs.Trigger value="locale">Locale</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        {#if tab === "cv"}
          <Label class="text-muted-foreground flex items-center gap-2 text-xs">
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
        <div class="flex max-w-[720px] flex-col gap-2 py-4 pr-11 pl-10">
          {#if yamlError}
            <p class="text-destructive text-sm" role="alert">{yamlError}</p>
          {/if}
          <YamlEditor
            value={yamlText}
            minHeight="24rem"
            onChange={handleYamlChange}
          />
        </div>
      {:else}
        <div class="max-w-[646px] py-4 pr-11 pl-10">
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
