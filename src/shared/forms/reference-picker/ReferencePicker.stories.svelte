<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ReferencePicker from "./ReferencePicker.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Inputs/Reference Picker",
    component: ReferencePicker,
    parameters: {
      docs: {
        description: {
          component:
            "Multi-reference picker. Apps supply the reference index; the control stays prop-driven.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let refs = $state<string[]>([]);
  let addOpen = $state(false);
</script>

<Story
  name="Adds a reference"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: /Add Reference/i }),
    );
    await expect(
      canvas.getByPlaceholderText(/Search references/i),
    ).toBeVisible();
  }}
  tags={["visual-failed"]}
>
  {#snippet template()}
    <ReferencePicker
      {refs}
      {addOpen}
      referenceIndex={{
        references: [
          {
            id: "1",
            ref: "[^1]",
            marker: "1",
            path: "/stories/1",
            type: "story",
            label: "Deployment story",
            excerpt: "Shipped the deploy pipeline",
            duplicate: false,
          },
        ],
        duplicates: {},
      }}
      onAddOpenChange={(open) => {
        addOpen = open;
      }}
      onChange={(next) => {
        refs = next;
      }}
    />
  {/snippet}
</Story>

<Story name="Shows an error" tags={["skip-visual"]}>
  {#snippet template()}
    <ReferencePicker
      refs={[]}
      addOpen={false}
      error="Enter at least one value."
      referenceIndex={{
        references: [
          {
            id: "1",
            ref: "[^1]",
            marker: "1",
            path: "/stories/1",
            type: "story",
            label: "Deployment story",
            excerpt: "Shipped the deploy pipeline",
            duplicate: false,
          },
        ],
        duplicates: {},
      }}
      onChange={() => {}}
    />
  {/snippet}
</Story>
