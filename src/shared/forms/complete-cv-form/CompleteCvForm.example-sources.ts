export const CompleteCvFormExample = `<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";
  import { FormToolbar, StructuredForm, YamlEditor } from "@lapismd/design-core/forms";
  import { createFormConfig, textField } from "@lapismd/design-core/forms/core";
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
  import * as ScrollArea from "@lapismd/design-core/shadcn/scroll-area";
  import * as Tabs from "@lapismd/design-core/shadcn/tabs";

  type CvDraft = { name: string };
  const shell = new AppShellController();
  const config = createFormConfig<CvDraft>({
    id: "cv",
    fields: [
      textField({
        id: "name",
        label: "Name",
        get: (draft) => draft.name,
        set: (draft, name) => ({ ...draft, name }),
      }),
    ],
  });
  let draft = $state<CvDraft>({ name: "John Doe" });
  let tab = $state("cv");
  let pane = $state("form");
  let yaml = $state("cv:\n  name: John Doe\n");

  function updateDraft(value: CvDraft) {
    draft = value;
    yaml = "cv:\n  name: " + value.name + "\n";
  }
</script>

<AppShell.Root controller={shell}>
  <AppShell.Main>
    <AppShell.Body layout="regions" label="CV form">
      <FormToolbar collapsedAll={false} onToggleCollapse={() => {}} />
      <Tabs.Root bind:value={tab}>
        <Tabs.List variant="line">
          <Tabs.Trigger value="cv">CV</Tabs.Trigger>
          <Tabs.Trigger value="design">Design</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="cv">
          <Tabs.Root bind:value={pane} class="workspace-switch">
            <Tabs.List aria-label="CV workspace view">
              <Tabs.Trigger value="form">Form</Tabs.Trigger>
              <Tabs.Trigger value="yaml">YAML</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
          <Resizable.PaneGroup direction="horizontal" class="editor-split">
            <Resizable.Pane
              defaultSize={48}
              minSize={30}
              data-pane="form"
              data-pane-active={pane === "form" ? "" : undefined}
            >
              <ScrollArea.Root
                class="form-pane"
                orientation="vertical"
                type="always"
              >
                <div class="form-content">
                  <StructuredForm
                    value={draft}
                    {config}
                    onChange={(value) => updateDraft(value as CvDraft)}
                  />
                </div>
              </ScrollArea.Root>
            </Resizable.Pane>
            <Resizable.Handle
              withHandle
              aria-label="Resize form and YAML panels"
            />
            <Resizable.Pane
              defaultSize={52}
              minSize={30}
              data-pane="yaml"
              data-pane-active={pane === "yaml" ? "" : undefined}
            >
              <aside class="yaml-pane" aria-label="CV YAML source">
                <YamlEditor
                  value={yaml}
                  ariaLabel="CV YAML"
                  minHeight="100%"
                  onChange={(value) => (yaml = value)}
                />
              </aside>
            </Resizable.Pane>
          </Resizable.PaneGroup>
        </Tabs.Content>
        <Tabs.Content value="design">Compose another StructuredForm here.</Tabs.Content>
      </Tabs.Root>
    </AppShell.Body>
  </AppShell.Main>
</AppShell.Root>

<style>
  .editor-split {
    height: 100%;
    min-height: 32rem;
  }

  .workspace-switch {
    display: none;
  }

  .form-pane,
  .yaml-pane {
    height: 100%;
    min-height: 0;
  }

  .form-pane {
    overflow: hidden;
  }

  .form-content {
    max-width: 46rem;
    padding: 1.5rem 2.5rem 5rem;
  }

  .editor-split > * {
    min-width: 0;
  }

  @media (max-width: 60rem) {
    .editor-split {
      display: flex !important;
      height: 100% !important;
    }

    .editor-split > [data-ui-part="resizable-pane"] {
      width: 100% !important;
      height: 100% !important;
      flex: 1 1 auto !important;
    }

    .workspace-switch {
      display: flex;
    }

    .editor-split > [data-pane]:not([data-pane-active]) {
      display: none !important;
    }

    .editor-split > [data-ui-part="resizable-handle"] {
      display: none !important;
    }
  }
</style>`;
