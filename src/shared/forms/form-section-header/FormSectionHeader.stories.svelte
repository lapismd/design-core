<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";
  import FormSectionHeader from "./FormSectionHeader.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Layout/Form Section Header",
    component: FormSectionHeader,
    parameters: {
      docs: {
        description: {
          component:
            "Collapsible section header with optional move/delete actions.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let open = $state(true);
</script>

<Story
  name="Toggles disclosure"
  play={async ({ canvas }) => {
    const disclosure = canvas.getByRole("button", {
      name: "Collapse Experience",
    });
    const title = canvas.getByRole("button", { name: "Experience" });
    const disclosureRect = disclosure.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    await expect(
      Math.abs(
        disclosureRect.top +
          disclosureRect.height / 2 -
          (titleRect.top + titleRect.height / 2),
      ),
    ).toBeLessThan(1);
    await userEvent.click(disclosure);
    await expect(canvas.getByRole("status")).toHaveTextContent("collapsed");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="max-w-xl">
      <FormSectionHeader
        title="Experience"
        index={0}
        total={1}
        editable={false}
        titleToggleable
        {open}
        onToggle={() => {
          open = !open;
        }}
      />
      {#if open}
        <FormPlaceholder>Section body</FormPlaceholder>
      {/if}
      <output class="sr-only">{open ? "expanded" : "collapsed"}</output>
    </div>
  {/snippet}
</Story>
