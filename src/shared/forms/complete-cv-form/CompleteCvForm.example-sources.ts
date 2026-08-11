export const CompleteCvFormExample = `<script lang="ts">
  import { AppShell, AppShellController } from "@lapismd/design-core/shell";
  import { FormToolbar, StructuredForm, YamlEditor } from "@lapismd/design-core/forms";
  import { createFormConfig, textField } from "@lapismd/design-core/forms/core";
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
  let yaml = $state("cv:\n  name: John Doe\n");

  function updateDraft(value: CvDraft) {
    draft = value;
    yaml = "cv:\n  name: " + value.name + "\n";
  }
</script>

<AppShell.Root controller={shell}>
  <AppShell.Main>
    <AppShell.Body label="CV form">
      <FormToolbar collapsedAll={false} onToggleCollapse={() => {}} />
      <Tabs.Root bind:value={tab}>
        <Tabs.List variant="line">
          <Tabs.Trigger value="cv">CV</Tabs.Trigger>
          <Tabs.Trigger value="design">Design</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="cv">
          <div class="editor-split">
            <StructuredForm
              value={draft}
              {config}
              onChange={(value) => updateDraft(value as CvDraft)}
            />
            <aside aria-label="CV YAML source">
              <YamlEditor
                value={yaml}
                ariaLabel="CV YAML"
                minHeight="100%"
                onChange={(value) => (yaml = value)}
              />
            </aside>
          </div>
        </Tabs.Content>
        <Tabs.Content value="design">Compose another StructuredForm here.</Tabs.Content>
      </Tabs.Root>
    </AppShell.Body>
  </AppShell.Main>
</AppShell.Root>

<style>
  .editor-split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 1fr);
  }

  .editor-split > * {
    min-width: 0;
  }

  @media (max-width: 60rem) {
    .editor-split {
      grid-template-columns: 1fr;
    }
  }
</style>`;
