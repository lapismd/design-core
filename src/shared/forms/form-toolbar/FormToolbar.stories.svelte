<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormToolbar from "./FormToolbar.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Layout/Form Toolbar",
    component: FormToolbar,
    parameters: {
      docs: {
        description: {
          component:
            "Form-level toolbar with collapse-all and optional leading/actions snippets. See [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });
</script>

<script lang="ts">
  let collapsedAll = $state(false);
</script>

<Story
  name="Collapses every section"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Collapse all" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "All sections collapsed",
    );
  }}
>
  {#snippet template()}
    <div class="max-w-md space-y-2">
      <FormToolbar
        {collapsedAll}
        onToggleCollapse={() => (collapsedAll = !collapsedAll)}
      >
        {#snippet leading()}
          <span class="text-sm font-medium">Source settings</span>
        {/snippet}
        {#snippet actions()}
          <button type="button" class="text-muted-foreground text-sm"
            >Save draft</button
          >
        {/snippet}
      </FormToolbar>
      <output class="text-muted-foreground text-sm">
        {collapsedAll ? "All sections collapsed" : "All sections expanded"}
      </output>
    </div>
  {/snippet}
</Story>
