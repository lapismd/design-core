<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormSectionHeader from "./FormSectionHeader.svelte";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Section Header",
    component: FormSectionHeader,
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
  name="Collapsed"
  exportName="Collapsed"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Collapsed disclosure with title-row toggle." },
    },
  }}
>
  {#snippet template()}
    <FormSectionHeader
      title="Experience"
      index={0}
      total={1}
      editable={false}
      titleToggleable
      open={false}
    />
  {/snippet}
</Story>

<Story
  name="Expanded with body"
  exportName="ExpandedWithBody"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Open section with placeholder body for spacing." },
    },
  }}
>
  {#snippet template()}
    <div class="max-w-xl">
      <FormSectionHeader
        title="Experience"
        index={0}
        total={1}
        editable={false}
        titleToggleable
        open={true}
      />
      <FormPlaceholder>Section body</FormPlaceholder>
    </div>
  {/snippet}
</Story>

<Story
  name="Multiple entries"
  exportName="MultipleEntries"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Index/total for reorderable section lists." },
    },
  }}
>
  {#snippet template()}
    <div class="flex max-w-xl flex-col gap-3">
      <FormSectionHeader
        title="Experience"
        index={0}
        total={2}
        editable={false}
        titleToggleable
        open={true}
      />
      <FormSectionHeader
        title="Education"
        index={1}
        total={2}
        editable={false}
        titleToggleable
        open={false}
      />
    </div>
  {/snippet}
</Story>
