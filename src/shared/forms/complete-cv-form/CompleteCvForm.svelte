<script lang="ts">
  import RotateCcwIcon from "@lucide/svelte/icons/rotate-ccw";
  import { tick } from "svelte";

  import * as Alert from "../../shadcn/alert/index";
  import { Button } from "../../shadcn/button/index";
  import * as Resizable from "../../shadcn/resizable/index";
  import * as ScrollArea from "../../shadcn/scroll-area/index";
  import * as Tabs from "../../shadcn/tabs/index";
  import { AppShell, AppShellController } from "../../shell/app-shell/index";
  import { createFormController, type FormController } from "../core/core";
  import FormToolbar from "../form-toolbar/FormToolbar.svelte";
  import StructuredForm from "../structured-form/StructuredForm.svelte";
  import YamlEditor from "../yaml-editor/YamlEditor.svelte";
  import {
    completeCvConfig,
    completeDesignConfig,
    completeLocaleConfig,
    completeSettingsConfig,
  } from "./complete-cv-form.typed-config";
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
    DesignFragment,
    LocaleFragment,
    SettingsFragment,
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
  const cvController = createFormController<CvFragment>({
    defaultValues: initialSource.cv,
  });
  const designController = createFormController<DesignFragment>({
    defaultValues: initialSource.design ?? {},
  });
  const localeController = createFormController<LocaleFragment>({
    defaultValues: initialSource.locale ?? {},
  });
  const settingsController = createFormController<SettingsFragment>({
    defaultValues: initialSource.settings ?? {},
  });

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
  let activeWorkspacePane = $state<"form" | "yaml">("form");
  let yamlText = $state<Record<CvStoryTab, string>>(yamlFor(initialSource));
  let yamlErrors = $state<Record<CvStoryTab, string | null>>({
    cv: null,
    design: null,
    locale: null,
    settings: null,
  });
  let shellHost: HTMLDivElement;

  const activeController = $derived(
    {
      cv: cvController,
      design: designController,
      locale: localeController,
      settings: settingsController,
    }[activeTab] as FormController<any, any>,
  );
  const collapsedAll = $derived(activeController.allDisclosuresCollapsed());

  function commit(next: CompleteCvSource): void {
    source = next;
    yamlText = yamlFor(next);
    yamlErrors = { cv: null, design: null, locale: null, settings: null };
  }

  function commitFragment<TTab extends Exclude<CvStoryTab, "cv">>(
    tab: TTab,
    value: NonNullable<CompleteCvSource[TTab]>,
  ): void {
    commit({ ...source, [tab]: value });
  }

  function editYaml(tab: CvStoryTab, text: string): void {
    yamlText = { ...yamlText, [tab]: text };
    const result = applyYamlEdit(source, tab, text);
    yamlErrors = { ...yamlErrors, [tab]: result.error };
    if (!result.applied) return;
    source = result.source;
  }

  async function reset(): Promise<void> {
    source = cloneSource(initialSource);
    activeTab = "cv";
    activeWorkspacePane = "form";
    yamlText = yamlFor(source);
    yamlErrors = { cv: null, design: null, locale: null, settings: null };
    cvController.reset(source.cv, { emit: false });
    designController.reset(source.design ?? {}, { emit: false });
    localeController.reset(source.locale ?? {}, { emit: false });
    settingsController.reset(source.settings ?? {}, { emit: false });
    await tick();
    const resetScroll = () => {
      shellHost
        ?.querySelectorAll<HTMLElement>(
          '.complete-cv-form-pane > [data-ui-part="scroll-area-viewport"], .complete-cv-yaml-pane .cm-scroller',
        )
        .forEach((element) => element.scrollTo({ top: 0 }));
    };
    resetScroll();
    requestAnimationFrame(() => {
      resetScroll();
      requestAnimationFrame(resetScroll);
    });
  }
</script>

<div
  bind:this={shellHost}
  class="complete-cv-shell"
  data-testid="complete-cv-shell"
>
  <AppShell.Root controller={shellController} mobileBreakpoint={640}>
    <AppShell.Main>
      <AppShell.Body
        layout="regions"
        label="Complete CV form"
        class="complete-cv-body"
      >
        <div class="complete-cv-page">
          <div class="complete-cv-sticky-controls">
            <FormToolbar
              {collapsedAll}
              collapseLabel={`Collapse all ${tabs.find((tab) => tab.value === activeTab)?.label ?? activeTab} groups`}
              expandLabel={`Expand all ${tabs.find((tab) => tab.value === activeTab)?.label ?? activeTab} groups`}
              onToggleCollapse={() =>
                collapsedAll
                  ? activeController.expandAll()
                  : activeController.collapseAll()}
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
                  <Tabs.Root
                    bind:value={activeWorkspacePane}
                    class="complete-cv-workspace-tabs"
                  >
                    <Tabs.List
                      class="complete-cv-workspace-tabs__list"
                      aria-label={`${tab.label} workspace view`}
                    >
                      <Tabs.Trigger value="form">Form</Tabs.Trigger>
                      <Tabs.Trigger value="yaml">YAML</Tabs.Trigger>
                    </Tabs.List>
                    <Resizable.PaneGroup
                      direction="horizontal"
                      class="complete-cv-editor-split"
                    >
                      <Resizable.Pane
                        defaultSize={48}
                        minSize={30}
                        class="complete-cv-form-resizable-pane"
                        data-mobile-pane="form"
                        data-mobile-pane-active={activeWorkspacePane === "form"
                          ? ""
                          : undefined}
                        data-testid={`complete-cv-${tab.value}-form-resizable-pane`}
                      >
                        <ScrollArea.Root
                          class="complete-cv-form-pane"
                          orientation="vertical"
                          type="always"
                          data-testid={`structured-${tab.value}`}
                        >
                          <div class="complete-cv-form-pane__content">
                            {#if tab.value === "cv"}
                              <StructuredForm
                                value={source.cv}
                                config={completeCvConfig}
                                controller={cvController}
                                onChange={(cv) => commit({ ...source, cv })}
                              />
                            {:else if tab.value === "design"}
                              <StructuredForm
                                value={source.design ?? {}}
                                config={completeDesignConfig}
                                controller={designController}
                                onChange={(value) =>
                                  commitFragment("design", value)}
                              />
                            {:else if tab.value === "locale"}
                              <StructuredForm
                                value={source.locale ?? {}}
                                config={completeLocaleConfig}
                                controller={localeController}
                                onChange={(value) =>
                                  commitFragment("locale", value)}
                              />
                            {:else}
                              <StructuredForm
                                value={source.settings ?? {}}
                                config={completeSettingsConfig}
                                controller={settingsController}
                                onChange={(value) =>
                                  commitFragment("settings", value)}
                              />
                            {/if}
                          </div>
                        </ScrollArea.Root>
                      </Resizable.Pane>

                      <Resizable.Handle
                        withHandle
                        variant="prominent"
                        class="complete-cv-resize-handle"
                        aria-label="Resize form and YAML panels"
                        data-testid={`complete-cv-${tab.value}-resize-handle`}
                      />

                      <Resizable.Pane
                        defaultSize={52}
                        minSize={30}
                        class="complete-cv-yaml-resizable-pane"
                        data-mobile-pane="yaml"
                        data-mobile-pane-active={activeWorkspacePane === "yaml"
                          ? ""
                          : undefined}
                        data-testid={`complete-cv-${tab.value}-yaml-resizable-pane`}
                      >
                        <aside
                          class="complete-cv-yaml-pane"
                          aria-label={`${tab.label} YAML source`}
                          data-testid={`yaml-${tab.value}`}
                        >
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
                      </Resizable.Pane>
                    </Resizable.PaneGroup>
                  </Tabs.Root>
                </Tabs.Content>
              {/each}
            </Tabs.Root>
          </div>
        </div>
      </AppShell.Body>
    </AppShell.Main>
  </AppShell.Root>
</div>
