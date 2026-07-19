<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ReferencePicker from "./ReferencePicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Reference Picker",
    component: ReferencePicker,
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
  let refs = $state<string[]>(["[^1]"]);
  let addOpen = $state(false);

  const referenceIndex = {
    references: [
      {
        id: "1",
        ref: "[^1]",
        marker: "1",
        path: "/stories/1",
        type: "story" as const,
        label: "Deployment story",
        excerpt: "Shipped the deploy pipeline",
        duplicate: false,
      },
    ],
    duplicates: {},
  };
</script>


<Story
  name="With selection"
  exportName="WithSelection"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Selected reference plus add affordance." },
    },
  }}
>
  {#snippet template()}
    <ReferencePicker
      {refs}
      {addOpen}
      {referenceIndex}
      onAddOpenChange={(open) => {
        addOpen = open;
      }}
      onChange={(next) => {
        refs = next;
      }}
    />
  {/snippet}
</Story>

<Story
  name="Empty"
  exportName="Empty"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "No refs selected yet." },
    },
  }}
>
  {#snippet template()}
    <ReferencePicker
      refs={[]}
      addOpen={false}
      {referenceIndex}
      onAddOpenChange={() => {}}
      onChange={() => {}}
    />
  {/snippet}
</Story>
