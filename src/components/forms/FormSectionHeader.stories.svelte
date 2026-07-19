<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormSectionHeader from "./FormSectionHeader.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Form Section Header",
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
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse Experience" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("collapsed");
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
        {open}
        onToggle={() => {
          open = !open;
        }}
      />
      {#if open}
        <p class="text-muted-foreground text-sm">Section body</p>
      {/if}
      <output class="sr-only">{open ? "expanded" : "collapsed"}</output>
    </div>
  {/snippet}
</Story>
