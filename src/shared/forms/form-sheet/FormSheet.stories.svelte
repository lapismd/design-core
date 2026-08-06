<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import FormSheet from "./FormSheet.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Layout/Form Sheet",
    component: FormSheet,
    parameters: {
      docs: {
        description: {
          component:
            "Right-side workflow frame for editing a focused record. See [Form guidance](?path=/docs/ui-forms-guidance--docs).",
        },
      },
    },
  });
</script>

<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";

  let open = $state(false);
  let collapsedAll = $state(false);
</script>

<Story
  name="Focuses, collapses, and closes an editing workflow"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Edit import" }));
    const dialog = within(document.body).getByRole("dialog", {
      name: "Import proposal",
    });
    await expect(dialog).toBeVisible();
    await expect(document.activeElement).toBe(
      within(dialog).getByText("Import proposal"),
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Collapse all" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "All sections collapsed",
    );
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("closed");
  }}
>
  {#snippet template()}
    <div class="space-y-3">
      <Button onclick={() => (open = true)}>Edit import</Button>
      <FormSheet
        bind:open
        title="Import proposal"
        description="Review and edit this import proposal."
        {collapsedAll}
        onToggleCollapse={() => (collapsedAll = !collapsedAll)}
      >
        {#snippet titleSuffix()}
          <span
            class="bg-muted text-muted-foreground inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums"
            >3</span
          >
        {/snippet}
        <p class="text-muted-foreground text-sm">
          {collapsedAll
            ? "The proposal sections are collapsed."
            : "The proposal sections are expanded."}
        </p>
      </FormSheet>
      <output class="text-muted-foreground text-sm">
        {open
          ? collapsedAll
            ? "All sections collapsed"
            : "All sections expanded"
          : "closed"}
      </output>
    </div>
  {/snippet}
</Story>
