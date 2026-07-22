<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ListEditor from "./ListEditor.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/List Editor",
    component: ListEditor,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let tags = $state<string[]>([
    "Starling Bank",
    "Payments",
    "ISO 20022",
    "Validation",
  ]);
  let boxed = $state<string[]>(["First", "Second"]);
</script>

<Story name="Inline tags" exportName="InlineTags" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="cv-structured-form max-w-xl">
      <ListEditor
        label="Tags"
        items={tags}
        addLabel="Add"
        multiline={false}
        onChange={(next) => {
          tags = next;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story name="Boxed" exportName="Boxed" tags={["skip-visual"]}>
  {#snippet template()}
    <div class="max-w-xl">
      <ListEditor
        label="Highlights"
        items={boxed}
        addLabel="highlight"
        variant="boxed"
        onChange={(next) => {
          boxed = next;
        }}
      />
    </div>
  {/snippet}
</Story>
