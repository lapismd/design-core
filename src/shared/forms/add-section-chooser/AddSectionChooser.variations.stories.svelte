<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import AddSectionChooser from "./AddSectionChooser.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Add Section Chooser",
    component: AddSectionChooser,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>


<Story
  name="Closed"
  exportName="Closed"
  parameters={{
    visualDelta: {"images":["/visual-baselines/forms/add-section-chooser/closed-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
    docs: {
      description: { story: "Dashed add button idle state." },
    },
  }}

  tags={["visual-approved"]}
>
  {#snippet template()}
    <AddSectionChooser
      open={false}
      title=""
      options={[
        { value: "experience", label: "Experience" },
        { value: "education", label: "Education" },
      ]}
      onOpen={() => {}}
      onCancel={() => {}}
      onTitleChange={() => {}}
      onChoose={() => {}}
    />
  {/snippet}
</Story>

<Story
  name="Open chooser"
  exportName="OpenChooser"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Title field + type chips after opening add." },
    },
  }}
>
  {#snippet template()}
    <AddSectionChooser
      open={true}
      title="New section"
      options={[
        { value: "experience", label: "Experience" },
        { value: "education", label: "Education" },
      ]}
      onOpen={() => {}}
      onCancel={() => {}}
      onTitleChange={() => {}}
      onChoose={() => {}}
    />
  {/snippet}
</Story>
