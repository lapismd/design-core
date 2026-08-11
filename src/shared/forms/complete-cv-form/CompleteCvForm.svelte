<script lang="ts">
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";

  import * as Alert from "../../shadcn/alert/index";
  import { Button } from "../../shadcn/button/index";
  import * as Tabs from "../../shadcn/tabs/index";
  import { AppShell, AppShellController } from "../../shell/app-shell/index";
  import FormSectionHeader from "../form-section-header/FormSectionHeader.svelte";
  import FormToolbar from "../form-toolbar/FormToolbar.svelte";
  import StructuredForm from "../structured-form/StructuredForm.svelte";
  import YamlEditor from "../yaml-editor/YamlEditor.svelte";
  import CompleteCvContent from "./CompleteCvContent.svelte";
  import CompleteCvGroupList from "./CompleteCvGroupList.svelte";
  import {
    designGroups,
    localeGroups,
    settingsConfig,
  } from "./complete-cv-form.config";
  import {
    applyYamlEdit,
    cloneSource,
    serializeFragment,
  } from "./complete-cv-form.model";
  import { createSampleCv } from "./sample-cv.fixture";
  import type {
    CompleteCvSource,
    CvFragment,
    CvStoryTab,
    StoryRecord,
  } from "./complete-cv-form.types";
  import "./CompleteCvForm.css";

  const tabs: Array<{ value: CvStoryTab; label: string }> = [
    { value: "cv", label: "CV" },
    { value: "design", label: "Design" },
    { value: "locale", label: "Locale" },
    { value: "settings", label: "Settings" },
  ];
  const shellController = new AppShellController();
  const initialSource = createSampleCv();

  function yamlFor(source: CompleteCvSource): Record<CvStoryTab, string> {
    return {
      cv: serializeFragment(source, "cv"),
      design: serializeFragment(source, "design"),
      locale: serializeFragment(source, "locale"),
      settings: serializeFragment(source, "settings"),
    };
  }

  let source = $state<CompleteCvSource>(cloneSource(initialSource));
  let activeTab = $state<CvStoryTab>("cv");
  let yamlText = $state<Record<CvStoryTab, string>>(yamlFor(initialSource));
  let yamlErrors = $state<Record<CvStoryTab, string | null>>({
    cv: null,
    design: null,
    locale: null,
    settings: null,
  });
  let closedByTab = $state<Record<CvStoryTab, string[]>>({
    cv: [],
    design: [],
    locale: [],
    settings: [],
  });
  let identityRevision = $state(0);

  const collapsedAll = $derived(closedByTab[activeTab].includes("*"));

  function commit(next: CompleteCvSource): void {
    source = next;
    yamlText = yamlFor(next);
    yamlErrors = { cv: null, design: null, locale: null, settings: null };
  }

  function commitFragment(tab: CvStoryTab, value: StoryRecord): void {
    commit({ ...source, [tab]: value });
  }

  function editYaml(tab: CvStoryTab, text: string): void {
    yamlText = { ...yamlText, [tab]: text };
    const result = applyYamlEdit(source, tab, text);
    yamlErrors = { ...yamlErrors, [tab]: result.error };
    if (!result.applied) return;
    source = result.source;
    if (tab === "cv") identityRevision += 1;
  }

  function reset(): void {
    source = cloneSource(initialSource);
    activeTab = "cv";
    yamlText = yamlFor(source);
    yamlErrors = { cv: null, design: null, locale: null, settings: null };
    closedByTab = { cv: [], design: [], locale: [], settings: [] };
    identityRevision += 1;
  }

  function setClosed(tab: CvStoryTab, ids: string[]): void {
    closedByTab = { ...closedByTab, [tab]: ids };
  }
</script>

<div class="complete-cv-shell" data-testid="complete-cv-shell">
  <AppShell.Root controller={shellController} mobileBreakpoint={640}>
    <AppShell.Main>
      <AppShell.Body label="Complete CV form">
        <div class="complete-cv-page">
          <div class="complete-cv-sticky-controls">
            <FormToolbar
              {collapsedAll}
              collapseLabel={`Collapse all ${tabs.find((tab) => tab.value === activeTab)?.label ?? activeTab} groups`}
              expandLabel={`Expand all ${tabs.find((tab) => tab.value === activeTab)?.label ?? activeTab} groups`}
              onToggleCollapse={() =>
                setClosed(activeTab, collapsedAll ? [] : ["*"])}
            >
              {#snippet leading()}
                <span class="complete-cv-toolbar-title"
                  >{source.cv.name ?? "CV"}</span
                >
              {/snippet}
              {#snippet actions()}
                <Button type="button" variant="ghost" size="sm" onclick={reset}>
                  <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
                  Reset sample
                </Button>
              {/snippet}
            </FormToolbar>

            <Tabs.Root bind:value={activeTab} class="complete-cv-tabs">
              <Tabs.List variant="line" aria-label="CV form areas">
                {#each tabs as tab (tab.value)}
                  <Tabs.Trigger value={tab.value}>{tab.label}</Tabs.Trigger>
                {/each}
              </Tabs.List>

              {#each tabs as tab (tab.value)}
                <Tabs.Content value={tab.value} class="complete-cv-tab-content">
                  <div class="complete-cv-editor-split">
                    <div
                      class="complete-cv-form-pane"
                      data-testid={`structured-${tab.value}`}
                    >
                      {#if tab.value === "cv"}
                        <CompleteCvContent
                          cv={source.cv}
                          closedIds={closedByTab.cv}
                          {identityRevision}
                          onChange={(cv: CvFragment) =>
                            commit({ ...source, cv })}
                          onClosedIdsChange={(ids) => setClosed("cv", ids)}
                        />
                      {:else if tab.value === "design"}
                        <CompleteCvGroupList
                          value={source.design ?? {}}
                          groups={designGroups}
                          closedIds={closedByTab.design}
                          onChange={(value) => commitFragment("design", value)}
                          onClosedIdsChange={(ids) => setClosed("design", ids)}
                        />
                      {:else if tab.value === "locale"}
                        <CompleteCvGroupList
                          value={source.locale ?? {}}
                          groups={localeGroups}
                          closedIds={closedByTab.locale}
                          onChange={(value) => commitFragment("locale", value)}
                          onClosedIdsChange={(ids) => setClosed("locale", ids)}
                        />
                      {:else}
                        <section
                          class="complete-cv-group complete-cv-settings-group"
                        >
                          <FormSectionHeader
                            title="Document Settings"
                            index={0}
                            total={1}
                            open={!closedByTab.settings.includes("*") &&
                              !closedByTab.settings.includes(
                                "document-settings",
                              )}
                            editable={false}
                            movable={false}
                            removable={false}
                            titleToggleable
                            titleRowClass="complete-cv-setting-title-row"
                            onToggle={() => {
                              const ids = closedByTab.settings.filter(
                                (id) => id !== "*",
                              );
                              setClosed(
                                "settings",
                                ids.includes("document-settings")
                                  ? ids.filter(
                                      (id) => id !== "document-settings",
                                    )
                                  : [...ids, "document-settings"],
                              );
                            }}
                          />
                          {#if !closedByTab.settings.includes("*") && !closedByTab.settings.includes("document-settings")}
                            <div class="complete-cv-group__body">
                              <StructuredForm
                                value={source.settings ?? {}}
                                config={settingsConfig}
                                onChange={(value) =>
                                  commitFragment(
                                    "settings",
                                    value as StoryRecord,
                                  )}
                              />
                            </div>
                          {/if}
                        </section>
                      {/if}
                    </div>

                    <aside
                      class="complete-cv-yaml-pane"
                      aria-label={`${tab.label} YAML source`}
                      data-testid={`yaml-${tab.value}`}
                    >
                      <div class="complete-cv-yaml-header">
                        <strong>YAML</strong>
                        <span>{tab.label}</span>
                      </div>
                      <YamlEditor
                        value={yamlText[tab.value]}
                        invalid={Boolean(yamlErrors[tab.value])}
                        frameless
                        minHeight="100%"
                        ariaLabel={`${tab.label} YAML`}
                        editorId={`complete-cv-${tab.value}-yaml`}
                        onChange={(text) => editYaml(tab.value, text)}
                      />
                      {#if yamlErrors[tab.value]}
                        <Alert.Root
                          variant="destructive"
                          role="alert"
                          data-testid="yaml-error"
                        >
                          <Alert.Title>YAML not applied</Alert.Title>
                          <Alert.Description
                            >{yamlErrors[tab.value]}</Alert.Description
                          >
                        </Alert.Root>
                      {/if}
                    </aside>
                  </div>
                </Tabs.Content>
              {/each}
            </Tabs.Root>
          </div>
        </div>
      </AppShell.Body>
    </AppShell.Main>
  </AppShell.Root>
</div>
